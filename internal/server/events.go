package server

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"connectrpc.com/connect"
	lighteventv1 "github.com/aarongodin/lightevent/internal/gen/lightevent/v1"
	"github.com/aarongodin/lightevent/internal/model"
	"github.com/aarongodin/lightevent/internal/secret"
	"github.com/aarongodin/lightevent/internal/storage"
)

// eventWithDates translates an event and loads its dates (sorted ascending) with registration counts.
func eventWithDates(ctx context.Context, q *storage.Queries, rec storage.Event) (*lighteventv1.Event, error) {
	dates, err := q.ListEventDatesByEventID(ctx, rec.ID)
	if err != nil {
		return nil, err
	}
	counts, err := q.CountActiveRegistrationsByEventDate(ctx, rec.ID)
	if err != nil {
		return nil, err
	}
	byDate := make(map[int64]int64, len(counts))
	for _, c := range counts {
		byDate[c.EventDateID] = c.OnceCount + c.SeriesCount
	}
	event := translateEvent(rec)
	for _, d := range dates {
		ed := translateEventDate(d)
		ed.RegistrationCount = int32(byDate[d.ID])
		event.Dates = append(event.Dates, ed)
	}
	return event, nil
}

// visibleToPublic reports whether members and anonymous callers may see the event.
func visibleToPublic(rec storage.Event) bool {
	return !storage.IntToBool(rec.Hidden) && !rec.ArchivedAt.Valid
}

func eventFilterString(f lighteventv1.EventFilter) string {
	switch f {
	case lighteventv1.EventFilter_EVENT_FILTER_PAST:
		return "past"
	case lighteventv1.EventFilter_EVENT_FILTER_ARCHIVED:
		return "archived"
	case lighteventv1.EventFilter_EVENT_FILTER_ALL:
		return "all"
	default:
		return "upcoming"
	}
}

func (s *Server) ListEvents(ctx context.Context, req *connect.Request[lighteventv1.ListEventsRequest]) (*connect.Response[lighteventv1.ListEventsResponse], error) {
	limit := pageLimit(req.Msg.Limit, 50, 200)
	offset := pageOffset(req.Msg.Offset)
	now := s.Now()

	var (
		recs  []storage.Event
		total int64
		err   error
	)
	if identity(ctx).IsAdmin() {
		filter := eventFilterString(req.Msg.Filter)
		recs, err = s.q.ListEvents(ctx, storage.ListEventsParams{Filter: filter, Now: now, Search: req.Msg.Search, Limit: limit, Offset: offset})
		if err == nil {
			total, err = s.q.CountEvents(ctx, storage.CountEventsParams{Filter: filter, Now: now, Search: req.Msg.Search})
		}
	} else {
		recs, err = s.q.ListPublicEvents(ctx, storage.ListPublicEventsParams{Now: now, Search: req.Msg.Search, Limit: limit, Offset: offset})
		if err == nil {
			total, err = s.q.CountPublicEvents(ctx, storage.CountPublicEventsParams{Now: now, Search: req.Msg.Search})
		}
	}
	if err != nil {
		return nil, errorResponse(ctx, err, "events")
	}

	events := make([]*lighteventv1.Event, 0, len(recs))
	for _, rec := range recs {
		event, err := eventWithDates(ctx, s.q, rec)
		if err != nil {
			return nil, errorResponse(ctx, err, "events")
		}
		events = append(events, event)
	}
	return connect.NewResponse(&lighteventv1.ListEventsResponse{Events: events, Total: int32(total)}), nil
}

func (s *Server) GetEvent(ctx context.Context, req *connect.Request[lighteventv1.GetEventRequest]) (*connect.Response[lighteventv1.GetEventResponse], error) {
	rec, err := s.q.GetEventByName(ctx, req.Msg.Name)
	if err != nil {
		return nil, errorResponse(ctx, err, "event")
	}
	if !identity(ctx).IsAdmin() && !visibleToPublic(rec) {
		return nil, notFound("event")
	}
	event, err := eventWithDates(ctx, s.q, rec)
	if err != nil {
		return nil, errorResponse(ctx, err, "event")
	}
	return connect.NewResponse(&lighteventv1.GetEventResponse{Event: event}), nil
}

func (s *Server) CreateEvent(ctx context.Context, req *connect.Request[lighteventv1.CreateEventRequest]) (*connect.Response[lighteventv1.CreateEventResponse], error) {
	in, err := model.Event(req.Msg.Event)
	if err != nil {
		return nil, errorResponse(ctx, err, "event")
	}
	for i, d := range in.Dates {
		if d.UID != "" {
			return nil, newError(connect.CodeInvalidArgument, fmt.Sprintf("event.dates[%d].uid: must be empty when creating an event", i))
		}
	}

	now := s.Now()
	var event *lighteventv1.Event
	err = s.store.WithTx(ctx, func(q *storage.Queries) error {
		rec, err := q.CreateEvent(ctx, storage.CreateEventParams{
			Name:        in.Name,
			Title:       in.Title,
			Description: in.Description,
			Hidden:      storage.BoolToInt(in.Hidden),
			Closed:      storage.BoolToInt(in.Closed),
			Capacity:    in.Capacity,
			CreatedAt:   now,
		})
		if err != nil {
			return err
		}
		for _, d := range in.Dates {
			if _, err := q.CreateEventDate(ctx, storage.CreateEventDateParams{Uid: secret.UID(), EventID: rec.ID, Value: d.Value}); err != nil {
				return err
			}
		}
		event, err = eventWithDates(ctx, q, rec)
		return err
	})
	if err != nil {
		return nil, errorResponse(ctx, err, "event")
	}
	return connect.NewResponse(&lighteventv1.CreateEventResponse{Event: event}), nil
}

func (s *Server) UpdateEvent(ctx context.Context, req *connect.Request[lighteventv1.UpdateEventRequest]) (*connect.Response[lighteventv1.UpdateEventResponse], error) {
	in, err := model.Event(req.Msg.Event)
	if err != nil {
		return nil, errorResponse(ctx, err, "event")
	}

	now := s.Now()
	var event *lighteventv1.Event
	err = s.store.WithTx(ctx, func(q *storage.Queries) error {
		current, err := q.GetEventByName(ctx, in.Name)
		if err != nil {
			return err
		}
		updated, err := q.UpdateEvent(ctx, storage.UpdateEventParams{
			ID:          current.ID,
			Title:       in.Title,
			Description: in.Description,
			Hidden:      storage.BoolToInt(in.Hidden),
			Closed:      storage.BoolToInt(in.Closed),
			Capacity:    in.Capacity,
			UpdatedAt:   sql.NullTime{Time: now, Valid: true},
		})
		if err != nil {
			return err
		}

		existing, err := q.ListEventDatesByEventID(ctx, current.ID)
		if err != nil {
			return err
		}
		existingByUID := make(map[string]storage.EventDate, len(existing))
		for _, d := range existing {
			existingByUID[d.Uid] = d
		}
		keep := make(map[string]bool, len(in.Dates))
		for i, d := range in.Dates {
			if d.UID == "" {
				continue
			}
			if _, ok := existingByUID[d.UID]; !ok {
				return newError(connect.CodeInvalidArgument, fmt.Sprintf("event.dates[%d].uid: is not a date of this event", i))
			}
			keep[d.UID] = true
		}

		// Remove omitted dates first so their values can be reused by new or updated dates.
		for _, d := range existing {
			if keep[d.Uid] {
				continue
			}
			active, err := q.CountActiveOnceRegistrationsForDate(ctx, sql.NullInt64{Int64: d.ID, Valid: true})
			if err != nil {
				return err
			}
			if active > 0 {
				return newError(connect.CodeFailedPrecondition, fmt.Sprintf(
					"the date %s has %d registration(s) and cannot be removed; cancel the date instead",
					d.Value.Format(time.RFC3339), active))
			}
			if err := q.DeleteInactiveRegistrationsForDate(ctx, sql.NullInt64{Int64: d.ID, Valid: true}); err != nil {
				return err
			}
			if err := q.DeleteEventDate(ctx, d.ID); err != nil {
				return err
			}
		}

		for _, d := range in.Dates {
			if d.UID == "" {
				if _, err := q.CreateEventDate(ctx, storage.CreateEventDateParams{Uid: secret.UID(), EventID: current.ID, Value: d.Value}); err != nil {
					return err
				}
				continue
			}
			if prev := existingByUID[d.UID]; !prev.Value.Equal(d.Value) {
				if _, err := q.UpdateEventDateValue(ctx, storage.UpdateEventDateValueParams{ID: prev.ID, Value: d.Value}); err != nil {
					return err
				}
			}
		}

		event, err = eventWithDates(ctx, q, updated)
		return err
	})
	if err != nil {
		return nil, errorResponse(ctx, err, "event")
	}
	return connect.NewResponse(&lighteventv1.UpdateEventResponse{Event: event}), nil
}

func (s *Server) SetEventArchived(ctx context.Context, req *connect.Request[lighteventv1.SetEventArchivedRequest]) (*connect.Response[lighteventv1.SetEventArchivedResponse], error) {
	rec, err := s.q.GetEventByName(ctx, req.Msg.Name)
	if err != nil {
		return nil, errorResponse(ctx, err, "event")
	}
	now := s.Now()
	archivedAt := sql.NullTime{}
	if req.Msg.Archived {
		archivedAt = sql.NullTime{Time: now, Valid: true}
	}
	rec, err = s.q.SetEventArchivedAt(ctx, storage.SetEventArchivedAtParams{
		ID: rec.ID, ArchivedAt: archivedAt, UpdatedAt: sql.NullTime{Time: now, Valid: true},
	})
	if err != nil {
		return nil, errorResponse(ctx, err, "event")
	}
	event, err := eventWithDates(ctx, s.q, rec)
	if err != nil {
		return nil, errorResponse(ctx, err, "event")
	}
	return connect.NewResponse(&lighteventv1.SetEventArchivedResponse{Event: event}), nil
}

func (s *Server) DeleteEvent(ctx context.Context, req *connect.Request[lighteventv1.DeleteEventRequest]) (*connect.Response[lighteventv1.DeleteEventResponse], error) {
	err := s.store.WithTx(ctx, func(q *storage.Queries) error {
		rec, err := q.GetEventByName(ctx, req.Msg.Name)
		if err != nil {
			return err
		}
		count, err := q.CountEventRegistrationsAll(ctx, rec.ID)
		if err != nil {
			return err
		}
		if count > 0 {
			return newError(connect.CodeFailedPrecondition, "events with registrations cannot be deleted; archive the event instead")
		}
		return q.DeleteEvent(ctx, rec.ID)
	})
	if err != nil {
		return nil, errorResponse(ctx, err, "event")
	}
	return connect.NewResponse(&lighteventv1.DeleteEventResponse{}), nil
}

func (s *Server) CancelEventDate(ctx context.Context, req *connect.Request[lighteventv1.CancelEventDateRequest]) (*connect.Response[lighteventv1.CancelEventDateResponse], error) {
	rec, err := s.q.GetEventDateByUID(ctx, req.Msg.EventDateUid)
	if err != nil {
		return nil, errorResponse(ctx, err, "event date")
	}
	if !storage.IntToBool(rec.Cancelled) {
		if rec, err = s.q.CancelEventDate(ctx, rec.ID); err != nil {
			return nil, errorResponse(ctx, err, "event date")
		}
	}
	return connect.NewResponse(&lighteventv1.CancelEventDateResponse{EventDate: translateEventDate(rec)}), nil
}

func (s *Server) ListUpcomingEventDates(ctx context.Context, req *connect.Request[lighteventv1.ListUpcomingEventDatesRequest]) (*connect.Response[lighteventv1.ListUpcomingEventDatesResponse], error) {
	rows, err := s.q.ListUpcomingEventDates(ctx, storage.ListUpcomingEventDatesParams{Now: s.Now(), Limit: pageLimit(req.Msg.Limit, 8, 50)})
	if err != nil {
		return nil, errorResponse(ctx, err, "event dates")
	}

	type counts struct{ once, series int64 }
	countsByEvent := make(map[int64]map[int64]counts)
	summaries := make([]*lighteventv1.EventDateSummary, 0, len(rows))
	for _, row := range rows {
		byDate, ok := countsByEvent[row.Event.ID]
		if !ok {
			cs, err := s.q.CountActiveRegistrationsByEventDate(ctx, row.Event.ID)
			if err != nil {
				return nil, errorResponse(ctx, err, "event dates")
			}
			byDate = make(map[int64]counts, len(cs))
			for _, c := range cs {
				byDate[c.EventDateID] = counts{once: c.OnceCount, series: c.SeriesCount}
			}
			countsByEvent[row.Event.ID] = byDate
		}
		c := byDate[row.EventDate.ID]
		date := translateEventDate(row.EventDate)
		date.RegistrationCount = int32(c.once + c.series)
		summaries = append(summaries, &lighteventv1.EventDateSummary{
			EventDate:   date,
			Event:       translateEvent(row.Event),
			OnceCount:   int32(c.once),
			SeriesCount: int32(c.series),
		})
	}
	return connect.NewResponse(&lighteventv1.ListUpcomingEventDatesResponse{EventDates: summaries}), nil
}

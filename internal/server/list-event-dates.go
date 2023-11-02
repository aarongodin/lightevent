package server

import (
	"context"
	"database/sql"
	"time"

	"github.com/aarongodin/lightevent/internal/service"
	"github.com/aarongodin/lightevent/internal/storage"
)

func (s *Server) ListEventDates(ctx context.Context, message *service.ListEventDatesOptions) (*service.EventDateList, error) {
	recs, err := s.queries.ListEventDates(ctx, int64(message.Count))
	if err != nil {
		return nil, errorResponse(err, "event dates")
	}

	eventDateSummaries := make([]*service.EventDateSummary, 0, len(recs))
	eventsCache := make(map[int64]storage.Event)
	membersCache := make(map[int64]storage.Member)

	for _, rec := range recs {
		event, ok := eventsCache[rec.EventID]
		if !ok {
			event, err = s.queries.GetEvent(ctx, rec.EventID)
			if err != nil {
				return nil, errorResponse(err, "event")
			}
			eventsCache[rec.EventID] = event
		}

		registrations, err := s.queries.ListEventDateRegistrations(ctx, storage.ListEventDateRegistrationsParams{
			EventID:     event.ID,
			EventDateID: sql.NullInt64{Int64: rec.ID, Valid: true},
		})
		if err != nil {
			return nil, errorResponse(err, "event date registrations")
		}

		summary := &service.EventDateSummary{
			EventDate:     translateEventDate(rec),
			Event:         translateEvent(event),
			Registrations: make([]*service.Registration, 0),
		}

		for _, registration := range registrations {
			reg := &service.Registration{
				ConfCode:  registration.ConfCode,
				Kind:      registrationKindFromString(registration.Kind),
				EventName: event.Name,
				CreatedAt: registration.CreatedAt.Format(time.RFC3339),
			}
			if registration.Kind == KindOnce {
				reg.EventDate = summary.EventDate
			}
			member, ok := membersCache[registration.MemberID]
			if !ok {
				member, err = s.queries.GetMember(ctx, registration.MemberID)
				if err != nil {
					return nil, errorResponse(err, "member")
				}
				membersCache[registration.MemberID] = member
			}
			reg.Member = translateMember(member)
			summary.Registrations = append(summary.Registrations, reg)
		}

		eventDateSummaries = append(eventDateSummaries, summary)
	}

	return &service.EventDateList{
		EventDates: eventDateSummaries,
	}, nil
}

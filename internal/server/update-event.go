package server

import (
	"context"
	"time"

	"github.com/aarongodin/lightevent/internal/service"
	"github.com/aarongodin/lightevent/internal/storage"
	"github.com/google/uuid"
)

func (s *Server) UpdateEvent(ctx context.Context, message *service.Event) (*service.Event, error) {
	current, err := s.queries.GetEventByName(ctx, message.Name)
	if err != nil {
		return nil, errorResponse(err, "event")
	}
	currentEventDates, err := s.queries.ListEventDates(ctx, current.ID)
	if err != nil {
		return nil, errorResponse(err, "event date")
	}

	params := storage.UpdateEventParams{
		Name:  message.Name,
		Title: message.Title,
	}
	storage.SetInt64FromBool(&params.Hidden, message.Hidden)
	storage.SetInt64FromBool(&params.Closed, message.Closed)

	tx, err := s.db.Begin()
	if err != nil {
		return nil, errorResponse(err, "event")
	}
	defer tx.Rollback()
	qtx := s.queries.WithTx(tx)

	updated, err := qtx.UpdateEvent(ctx, params)
	if err != nil {
		return nil, errorResponse(err, "event")
	}

	// eventDates stores a map where the key is the uid of the event date.
	// This allows easier checking of event dates to delete after creates and updates
	// have finished.
	eventDates := make(map[string]storage.EventDate, 0)

	for _, date := range message.Dates {
		var (
			eventDate storage.EventDate
			value     time.Time
			err       error
		)
		if value, err = time.Parse(time.RFC3339, date.Value); err != nil {
			return nil, errorResponse(err, "event date")
		}
		if date.Uid == "" {
			params := storage.CreateEventDateParams{
				EventID: current.ID,
				Uid:     uuid.New().String(),
				Value:   value,
			}
			storage.SetInt64FromBool(&params.Cancelled, date.Cancelled)
			if eventDate, err = qtx.CreateEventDate(ctx, params); err != nil {
				return nil, errorResponse(err, "event date")
			}
		} else {
			if eventDate, err = qtx.GetEventDateByUid(ctx, date.Uid); err != nil {
				return nil, errorResponse(err, "event date")
			}
			params := storage.UpdateEventDateParams{
				ID:    eventDate.ID,
				Value: value,
			}
			storage.SetInt64FromBool(&params.Cancelled, date.Cancelled)
			if eventDate.Value.Equal(params.Value) && eventDate.Cancelled == params.Cancelled {
				// we do not need to write if the values are unchanged
				eventDates[eventDate.Uid] = eventDate
				continue
			}
			if eventDate, err = qtx.UpdateEventDate(ctx, params); err != nil {
				return nil, errorResponse(err, "event date")
			}
		}
		eventDates[eventDate.Uid] = eventDate
	}

	for _, ced := range currentEventDates {
		if _, ok := eventDates[ced.Uid]; !ok {
			// there is an existing event date that is not in the message; let's delete it
			if err := qtx.DeleteEventDate(ctx, ced.ID); err != nil {
				return nil, errorResponse(err, "event date")
			}
		}
	}

	if err := tx.Commit(); err != nil {
		return nil, errorResponse(err, "event")
	}

	event := translateEvent(updated)
	for _, eventDate := range eventDates {
		event.Dates = append(event.Dates, translateEventDate(eventDate))
	}

	return event, nil
}

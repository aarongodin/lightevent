package server

import (
	"context"
	"database/sql"

	"github.com/aarongodin/lightevent/internal/model"
	"github.com/aarongodin/lightevent/internal/service"
	"github.com/aarongodin/lightevent/internal/storage"
)

func (s *Server) UpdateEvent(ctx context.Context, message *service.Event) (*service.Event, error) {
	items, err := model.UpdateEvent(message)
	if err != nil {
		return nil, errorResponse(err, "event")
	}

	tx, err := s.db.Begin()
	if err != nil {
		return nil, errorResponse(err, "event")
	}
	defer tx.Rollback()
	qtx := s.queries.WithTx(tx)

	updated, err := qtx.UpdateEvent(ctx, items.Event)
	if err != nil {
		return nil, errorResponse(err, "event")
	}

	currentEventDates, err := qtx.ListEventDatesByEventID(ctx, updated.ID)
	if err != nil {
		return nil, errorResponse(err, "event")
	}

	eventDates := make(map[string]storage.EventDate, 0)
	for _, date := range items.EventDatesCreate {
		eventDate, err := qtx.CreateEventDate(ctx, date)
		if err != nil {
			return nil, errorResponse(err, "event date")
		}
		eventDates[eventDate.Uid] = eventDate
	}
	for _, date := range items.EventDatesUpdate {
		eventDate, err := qtx.UpdateEventDate(ctx, date)
		if err != nil {
			return nil, errorResponse(err, "event date")
		}
		eventDates[eventDate.Uid] = eventDate
	}

	for _, ced := range currentEventDates {
		if _, ok := eventDates[ced.Uid]; !ok {
			registrations, err := qtx.ListEventDateRegistrations(ctx, storage.ListEventDateRegistrationsParams{
				EventID:     ced.EventID,
				EventDateID: sql.NullInt64{Int64: ced.ID, Valid: true},
			})
			if err != nil {
				return nil, errorResponse(err, "event date")
			}
			for _, reg := range registrations {
				if reg.Kind == KindOnce {
					return nil, errorResponse(model.ErrValidationFailed{Argument: "dates", Reason: "event date with registrations cannot be deleted"}, "event date")
				}
			}
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

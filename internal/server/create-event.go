package server

import (
	"context"

	"github.com/aarongodin/lightevent/internal/model"
	"github.com/aarongodin/lightevent/internal/service"
)

func (s *Server) CreateEvent(ctx context.Context, message *service.Event) (*service.Event, error) {
	items, err := model.CreateEvent(message)
	if err != nil {
		return nil, errorResponse(err, "event")
	}

	tx, err := s.db.Begin()
	if err != nil {
		return nil, errorResponse(err, "event")
	}
	defer tx.Rollback()
	qtx := s.queries.WithTx(tx)

	rec, err := qtx.CreateEvent(ctx, items.Event)
	if err != nil {
		return nil, errorResponse(err, "event")
	}
	event := translateEvent(rec)

	for _, eventDateParams := range items.EventDates {
		eventDate, err := qtx.CreateEventDate(ctx, eventDateParams)
		if err != nil {
			return nil, errorResponse(err, "event date")
		}
		event.Dates = append(event.Dates, translateEventDate(eventDate))
	}

	if err := tx.Commit(); err != nil {
		return nil, errorResponse(err, "event")
	}
	return event, nil
}

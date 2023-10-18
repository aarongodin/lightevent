package server

import (
	"context"
	"time"

	"github.com/aarongodin/lightevent/internal/service"
	"github.com/aarongodin/lightevent/internal/storage"
	"github.com/aarongodin/lightevent/internal/validation"
)

func (s *Server) CreateEvent(ctx context.Context, message *service.Event) (*service.Event, error) {
	if err := validation.ValidateEvent(ctx, message); err != nil {
		return nil, errorResponse(err, "event")
	}

	var hidden, closed int64
	if message.Hidden {
		hidden = 1
	}
	if message.Closed {
		closed = 1
	}
	params := storage.CreateEventParams{
		Name:   message.Name,
		Title:  message.Title,
		Hidden: hidden,
		Closed: closed,
	}

	tx, err := s.db.Begin()
	if err != nil {
		return nil, errorResponse(err, "event")
	}
	defer tx.Rollback()
	qtx := s.queries.WithTx(tx)

	rec, err := qtx.CreateEvent(ctx, params)
	if err != nil {
		return nil, errorResponse(err, "event")
	}
	event := translateEvent(rec)

	for _, date := range message.Dates {
		value, err := time.Parse(time.RFC3339, date.Value)
		if err != nil {
			return nil, errorResponse(err, "event")
		}
		eventDate, err := qtx.CreateEventDate(ctx, storage.CreateEventDateParams{
			EventID:   rec.ID,
			Value:     value,
			Cancelled: 0,
		})
		if err != nil {
			return nil, errorResponse(err, "event")
		}
		event.Dates = append(event.Dates, translateEventDate(eventDate))
	}
	if err := tx.Commit(); err != nil {
		return nil, errorResponse(err, "event")
	}
	return event, nil
}

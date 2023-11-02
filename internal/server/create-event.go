package server

import (
	"context"
	"database/sql"
	"time"

	"github.com/aarongodin/lightevent/internal/service"
	"github.com/aarongodin/lightevent/internal/storage"
	"github.com/aarongodin/lightevent/internal/validation"
	"github.com/google/uuid"
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
		Name:        message.Name,
		Title:       message.Title,
		Description: sql.NullString{String: message.Description, Valid: message.Description != ""},
		Hidden:      hidden,
		Closed:      closed,
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
		eventDateParams := storage.CreateEventDateParams{
			EventID: rec.ID,
			Uid:     uuid.New().String(),
			Value:   value,
		}
		storage.SetInt64FromBool(&eventDateParams.Cancelled, date.Cancelled)
		eventDate, err := qtx.CreateEventDate(ctx, eventDateParams)
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

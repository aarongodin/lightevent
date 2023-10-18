package server

import (
	"context"
	"time"

	"github.com/aarongodin/lightevent/internal/service"
	"github.com/aarongodin/lightevent/internal/storage"
	gonanoid "github.com/matoous/go-nanoid/v2"
)

func (s *Server) UpdateEvent(ctx context.Context, message *service.Event) (*service.Event, error) {
	current, err := s.queries.GetEventByName(ctx, message.Name)
	if err != nil {
		return nil, errorResponse(err, "event")
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

	for _, date := range message.Dates {
		uid := date.Id
		if uid == "" {
			if dateID, err := gonanoid.New(); err != nil {
				return nil, errorResponse(err, "event")
			} else {
				uid = dateID
			}
		}

		value, err := time.Parse(time.RFC3339, date.Value)
		if err != nil {
			return nil, errorResponse(err, "event")
		}

		params := storage.UpsertEventDateParams{
			EventID: current.ID,
			Uid:     uid,
			Value:   value,
		}
		storage.SetInt64FromBool(&params.Cancelled, date.Cancelled)
		if _, err := qtx.UpsertEventDate(ctx, params); err != nil {
			return nil, errorResponse(err, "event")
		}
	}

	if err := tx.Commit(); err != nil {
		return nil, errorResponse(err, "event")
	}

	event := translateEvent(updated)
	eventDates, err := s.queries.ListEventDates(ctx, current.ID)
	if err != nil {
		return nil, errorResponse(err, "event")
	}
	for _, eventDate := range eventDates {
		event.Dates = append(event.Dates, translateEventDate(eventDate))
	}

	return event, nil
}

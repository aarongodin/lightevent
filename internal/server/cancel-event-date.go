package server

import (
	"context"

	"github.com/aarongodin/lightevent/internal/service"
	"github.com/aarongodin/lightevent/internal/storage"
)

func (s *Server) CancelEventDate(ctx context.Context, message *service.CancelEventDateOptions) (*service.EventDate, error) {
	rec, err := s.queries.GetEventDateByUid(ctx, message.EventDateUid)
	if err != nil {
		return nil, errorResponse(err, "event date")
	}
	eventDate, err := s.queries.UpdateEventDate(ctx, storage.UpdateEventDateParams{
		ID:        rec.ID,
		Value:     rec.Value,
		Cancelled: 1,
	})
	if err != nil {
		return nil, errorResponse(err, "event")
	}
	return translateEventDate(eventDate), nil
}

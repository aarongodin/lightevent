package server

import (
	"context"

	"github.com/aarongodin/spectral/internal/service"
)

func (s *Server) CreateEvent(ctx context.Context, message *service.Event) (*service.Event, error) {
	rec, err := s.Repo.Events.CreateEvent(eventMessageToRecord(message))
	if err != nil {
		return nil, errorResponse(err, "event")
	}
	return eventRecordToMessage(rec), nil
}

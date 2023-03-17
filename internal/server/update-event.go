package server

import (
	"context"

	service "github.com/aarongodin/spectral/internal/service"
)

func (s *Server) UpdateEvent(ctx context.Context, message *service.Event) (*service.Event, error) {
	rec, err := s.Repo.Events.UpdateEvent(eventMessageToRecord(message))
	if err != nil {
		return nil, errorResponse(err, "event")
	}
	return eventRecordToMessage(rec), nil
}

package server

import (
	"context"

	"github.com/aarongodin/spectral/internal/service"
)

func (s *Server) GetEvent(ctx context.Context, message *service.ByName) (*service.Event, error) {
	rec, err := s.Repo.Events.GetEventByName(message.Name)
	if err != nil {
		return nil, errorResponse(err, "event")
	}
	return eventRecordToMessage(rec), nil
}

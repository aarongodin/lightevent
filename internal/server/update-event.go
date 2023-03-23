package server

import (
	"context"

	service "github.com/aarongodin/spectral/internal/service"
)

func (s *Server) UpdateEvent(ctx context.Context, message *service.Event) (*service.Event, error) {
	rec, err := s.Repo.Events.GetEventByName(message.Name)
	if err != nil {
		return nil, errorResponse(err, "event")
	}

	rec.Title = message.Title
	rec.Hidden = message.Hidden
	rec.Closed = message.Closed

	rec, err = s.Repo.Events.UpdateEvent(rec)
	if err != nil {
		return nil, errorResponse(err, "event")
	}

	return eventRecordToMessage(rec), nil
}

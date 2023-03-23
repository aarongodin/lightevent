package server

import (
	"context"

	"github.com/aarongodin/spectral/internal/service"
)

func (s *Server) CreateEvent(ctx context.Context, message *service.Event) (*service.Event, error) {
	rec, err := eventMessageToRecord(message)
	if err != nil {
		return nil, err
	}

	if err := s.Repo.Events.Validate(rec, false); err != nil {
		return nil, errorResponse(err, "event")
	}

	rec, err = s.Repo.Events.CreateEvent(rec)
	if err != nil {
		return nil, errorResponse(err, "event")
	}
	return eventRecordToMessage(rec), nil
}

package server

import (
	"context"

	"github.com/aarongodin/spectral/internal/service"
)

func (s *Server) GetRegistration(ctx context.Context, message *service.ByConfCode) (*service.Registration, error) {
	rec, err := s.Repo.Registrations.GetRegistration(message.ConfCode)
	if err != nil {
		return nil, errorResponse(err, "registration")
	}

	event, err := s.Repo.Events.GetEvent(rec.EventID)
	if err != nil {
		return nil, errorResponse(err, "event")
	}

	reg, err := registrationRecordToMessage(rec, event)
	if err != nil {
		return nil, errorResponse(err, "registration")
	}
	return reg, nil
}

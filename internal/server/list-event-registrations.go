package server

import (
	"context"
	"errors"

	"github.com/aarongodin/spectral/internal/service"
	"github.com/asdine/storm/v3"
)

func (s *Server) ListEventRegistrations(ctx context.Context, message *service.ListEventRegistrationsOptions) (*service.RegistrationList, error) {
	event, err := s.Repo.Events.GetEventByName(message.EventName)
	if err != nil {
		return nil, errorResponse(err, "event")
	}

	recs, err := s.Repo.Registrations.ListEventRegistrations(event.ID)
	if err != nil {
		if !errors.Is(err, storm.ErrNotFound) {
			return nil, errorResponse(err, "event registration")
		}
	}

	registrations, err := registrationRecordsToMessage(recs, event)
	if err != nil {
		return nil, errorResponse(err, "event registration")
	}

	return &service.RegistrationList{
		Registrations: registrations,
	}, nil
}

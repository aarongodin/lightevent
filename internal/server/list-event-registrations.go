package server

import (
	"context"
	"errors"

	"github.com/aarongodin/spectral/internal/server/repository"
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

	members := make(map[string]*repository.MemberRecord)
	for _, rec := range recs {
		if _, ok := members[rec.MemberEmail]; !ok {
			member, err := s.Repo.Members.GetMember(rec.MemberEmail)
			if err != nil {
				return nil, errorResponse(err, "member")
			}
			members[rec.MemberEmail] = member
		}
	}

	registrations, err := registrationRecordsToMessage(recs, members, event)
	if err != nil {
		return nil, errorResponse(err, "event registration")
	}

	return &service.RegistrationList{
		Registrations: registrations,
	}, nil
}

package server

import (
	"context"

	"github.com/aarongodin/spectral/internal/server/access"
	"github.com/aarongodin/spectral/internal/service"
	"github.com/twitchtv/twirp"
)

func (s *Server) Register(ctx context.Context, message *service.MemberRegistration) (*service.Registration, error) {
	sub := access.GetSubject(ctx)
	if sub == "" {
		return nil, twirp.InternalError("expected subject on a member authorized route")
	}

	event, err := s.Repo.Events.GetEventByName(message.EventName)
	if err != nil {
		return nil, errorResponse(err, "event")
	}

	// TODO(aarongodin): implement a lot of validations

	payload, err := memberRegistrationMessageToRecord(message, event)
	if err != nil {
		return nil, err
	}
	payload.MemberEmail = sub
	payload.ConfCode, err = s.Repo.Registrations.NewConfCode()
	if err != nil {
		return nil, err
	}

	rec, err := s.Repo.Registrations.CreateRegistration(payload)
	if err != nil {
		return nil, errorResponse(err, "registration")
	}
	reg, err := registrationRecordToMessage(rec, event)
	if err != nil {
		return nil, errorResponse(err, "registration")
	}
	return reg, nil
}

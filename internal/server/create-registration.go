package server

import (
	"context"

	"github.com/aarongodin/spectral/internal/service"
)

func (s *Server) CreateRegistration(ctx context.Context, message *service.WriteableRegistration) (*service.Registration, error) {
	event, err := s.Repo.Events.GetEventByName(message.EventName)
	if err != nil {
		return nil, errorResponse(err, "event")
	}

	member, err := s.Repo.Members.GetMember(message.MemberEmail)
	if err != nil {
		return nil, errorResponse(err, "member")
	}

	payload, err := writeableRegistrationMessageToRecord(message, event)
	if err != nil {
		return nil, err
	}

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
	reg.Member = memberRecordToMessage(member)
	return reg, nil
}

package server

import (
	"context"
	"time"

	"github.com/aarongodin/lightevent/internal/service"
)

func (s *Server) GetRegistration(ctx context.Context, message *service.ByConfCode) (*service.Registration, error) {
	rec, err := s.queries.GetRegistrationByConfCode(ctx, message.ConfCode)
	if err != nil {
		return nil, errorResponse(err, "registration")
	}

	event, err := s.queries.GetEvent(ctx, rec.EventID)
	if err != nil {
		return nil, errorResponse(err, "event")
	}

	reg := &service.Registration{
		ConfCode:  rec.ConfCode,
		Kind:      registrationKindFromString(rec.Kind),
		EventName: event.Name,
		CreatedAt: rec.CreatedAt.Format(time.RFC3339),
	}

	// TODO(aarongodin): combine with logic from list-event-registrations.go
	member, err := s.queries.GetMember(ctx, rec.MemberID)
	if err != nil {
		return nil, errorResponse(err, "member")
	}
	reg.Member = translateMember(member)

	if rec.EventDateID.Valid {
		eventDate, err := s.queries.GetEventDate(ctx, rec.EventDateID.Int64)
		if err != nil {
			return nil, errorResponse(err, "event")
		}
		reg.EventDate = translateEventDate(eventDate)
	}

	return reg, nil
}

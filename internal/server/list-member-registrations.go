package server

import (
	"context"
	"database/sql"
	"errors"

	"github.com/aarongodin/lightevent/internal/service"
)

func (s *Server) ListMemberRegistrations(ctx context.Context, message *service.ListMemberRegistrationsOptions) (*service.MemberRegistrationList, error) {
	member, err := s.queries.GetMemberByEmail(ctx, message.MemberEmail)
	if err != nil {
		return nil, errorResponse(err, "member")
	}

	recs, err := s.queries.ListMemberRegistrations(ctx, member.ID)
	if err != nil {
		if !errors.Is(err, sql.ErrNoRows) {
			return nil, errorResponse(err, "member registrations")
		}
	}

	regs := make([]*service.MemberRegistration, 0, len(recs))

	for _, rec := range recs {
		reg := &service.MemberRegistration{
			ConfCode:  rec.ConfCode,
			Kind:      registrationKindFromString(rec.Kind),
			EventName: rec.EventName,
		}

		if rec.EventDateID.Valid {
			eventDate, err := s.queries.GetEventDate(ctx, rec.EventDateID.Int64)
			if err != nil {
				return nil, errorResponse(err, "event_date")
			}
			reg.EventDate = translateEventDate(eventDate)
		}

		regs = append(regs, reg)
	}

	return &service.MemberRegistrationList{
		Registrations: regs,
	}, nil
}

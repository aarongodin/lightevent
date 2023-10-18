package server

import (
	"context"
	"database/sql"
	"errors"

	"github.com/aarongodin/lightevent/internal/service"
	"github.com/aarongodin/lightevent/internal/storage"
)

func (s *Server) ListEventRegistrations(ctx context.Context, message *service.ListEventRegistrationsOptions) (*service.RegistrationList, error) {
	event, err := s.queries.GetEventByName(ctx, message.EventName)
	if err != nil {
		return nil, errorResponse(err, "event")
	}

	recs, err := s.queries.ListEventRegistrations(ctx, event.ID)
	if err != nil {
		if !errors.Is(err, sql.ErrNoRows) {
			return nil, errorResponse(err, "event registration")
		}
	}

	regs := make([]*service.Registration, 0, len(recs))
	members := make(map[int64]storage.Member)
	eventDates := make(map[int64]storage.EventDate)

	for _, rec := range recs {
		reg := &service.Registration{
			ConfCode:  rec.ConfCode,
			Kind:      registrationKindFromString(rec.Kind),
			EventName: event.Name,
		}

		member, ok := members[rec.MemberID]
		if !ok {
			member, err = s.queries.GetMember(ctx, rec.MemberID)
			if err != nil {
				return nil, errorResponse(err, "member")
			}
			members[rec.MemberID] = member
		}
		reg.Member = translateMember(member)

		if rec.EventDateID.Valid {
			eventDate, ok := eventDates[rec.EventDateID.Int64]
			if !ok {
				eventDate, err = s.queries.GetEventDate(ctx, rec.EventDateID.Int64)
				if err != nil {
					return nil, errorResponse(err, "event_date")
				}
				eventDates[rec.EventDateID.Int64] = eventDate
			}
			reg.EventDate = translateEventDate(eventDate)
		}
	}

	return &service.RegistrationList{
		Registrations: regs,
	}, nil
}

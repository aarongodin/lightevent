package server

import (
	"context"
	"database/sql"
	"time"

	"github.com/aarongodin/lightevent/internal/service"
	"github.com/aarongodin/lightevent/internal/storage"
	"github.com/aarongodin/lightevent/internal/util"
	"github.com/twitchtv/twirp"
)

func (s *Server) CreateRegistration(ctx context.Context, message *service.CreateRegistrationOptions) (*service.Registration, error) {
  if (message.Registration == nil) {
    return nil, twirp.InvalidArgumentError("registration", "must be present")
  }

	event, err := s.queries.GetEventByName(ctx, message.Registration.EventName)
	if err != nil {
		return nil, errorResponse(err, "event")
	}

	member, err := s.queries.GetMemberByUID(ctx, message.MemberUid)
	if err != nil {
		return nil, errorResponse(err, "member")
	}

	confCode, err := util.RandomHexUpper(4)
	if err != nil {
		return nil, twirp.InternalErrorWith(err)
	}

	params := storage.CreateRegistrationParams{
		ConfCode: confCode,
		Kind:     stringFromRegistrationKind(message.Registration.Kind),
		EventID:  event.ID,
		MemberID: member.ID,
	}

	if message.Registration.Kind == service.RegistrationKind_REG_ONCE {
		if message.Registration.EventDateUid == nil {
			return nil, twirp.InvalidArgumentError("registration.event_date", "must be present when kind is once")
		}
		eventDate, err := s.queries.GetEventDateByUid(ctx, *message.Registration.EventDateUid)
		if err != nil {
			return nil, errorResponse(err, "registration.event_date")
		}
		params.EventDateID = sql.NullInt64{Int64: eventDate.ID, Valid: true}
	}

	rec, err := s.queries.CreateRegistration(ctx, params)
	if err != nil {
		return nil, errorResponse(err, "registration")
	}

	reg := &service.Registration{
		ConfCode:  rec.ConfCode,
		Kind:      registrationKindFromString(rec.Kind),
		EventName: event.Name,
		Member:    translateMember(member),
		CreatedAt: rec.CreatedAt.Format(time.RFC3339),
	}
	if rec.EventDateID.Valid {
		eventDate, err := s.queries.GetEventDate(ctx, rec.EventDateID.Int64)
		if err != nil {
			return nil, errorResponse(err, "event")
		}
		reg.EventDate = translateEventDate(eventDate)
	}

	return reg, nil
}

package server

import (
	"context"
	"database/sql"

	"github.com/aarongodin/lightevent/internal/server/access"
	"github.com/aarongodin/lightevent/internal/service"
	"github.com/aarongodin/lightevent/internal/storage"
	"github.com/aarongodin/lightevent/internal/util"
	"github.com/twitchtv/twirp"
)

func (s *Server) Register(ctx context.Context, message *service.RegisterOptions) (*service.Registration, error) {
	sub := access.GetSubject(ctx)
	if sub == "" {
		return nil, twirp.InternalError("expected subject on a member authorized route")
	}

	event, err := s.queries.GetEventByName(ctx, message.EventName)
	if err != nil {
		return nil, errorResponse(err, "event")
	}

	member, err := s.queries.GetMemberByEmail(ctx, sub)
	if err != nil {
		return nil, twirp.InternalError("expected authorized member to exist")
	}

	// TODO(aarongodin): implement a lot of validations

	confCode, err := util.RandomHexUpper(8)
	if err != nil {
		return nil, twirp.InternalErrorWith(err)
	}

	params := storage.CreateRegistrationParams{
		ConfCode: confCode,
		Kind:     stringFromRegistrationKind(message.Kind),
		EventID:  event.ID,
		MemberID: member.ID,
	}

	if message.Kind == service.RegistrationKind_REG_ONCE {
		if message.EventDateUid == nil {
			return nil, twirp.InvalidArgumentError("event_date", "must be present when kind is once")
		}
		eventDate, err := s.queries.GetEventDateByUid(ctx, *message.EventDateUid)
		if err != nil {
			return nil, errorResponse(err, "event_date")
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

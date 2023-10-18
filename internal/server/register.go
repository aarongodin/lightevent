package server

import (
	"context"
	"database/sql"
	"time"

	"github.com/aarongodin/spectral/internal/server/access"
	"github.com/aarongodin/spectral/internal/service"
	"github.com/aarongodin/spectral/internal/storage"
	"github.com/aarongodin/spectral/internal/util"
	"github.com/twitchtv/twirp"
)

func (s *Server) Register(ctx context.Context, message *service.MemberRegistration) (*service.Registration, error) {
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
		if message.EventDate == nil {
			return nil, twirp.InvalidArgumentError("event_date", "must be present when kind is once")
		}

		value, err := time.Parse(time.RFC3339, *message.EventDate)
		if err != nil {
			return nil, twirp.InvalidArgumentError("event_date", "must be a valid RFC3339 time when present")
		}
		eventDate, err := s.queries.GetEventDateByValue(ctx, storage.GetEventDateByValueParams{
			EventID: event.ID,
			Value:   value,
		})
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

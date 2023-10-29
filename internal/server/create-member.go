package server

import (
	"context"
	"database/sql"

	"github.com/aarongodin/lightevent/internal/events"
	"github.com/aarongodin/lightevent/internal/service"
	"github.com/aarongodin/lightevent/internal/storage"
)

func (s *Server) CreateMember(ctx context.Context, message *service.WriteableMember) (*service.Member, error) {
	params := storage.CreateMemberParams{
		Email:    message.Email,
		Verified: 0,
	}
	if message.FirstName != "" {
		params.FirstName = sql.NullString{String: message.FirstName, Valid: true}
	}
	if message.LastName != "" {
		params.LastName = sql.NullString{String: message.LastName, Valid: true}
	}
	rec, err := s.queries.CreateMember(ctx, params)
	if err != nil {
		return nil, errorResponse(err, "member")
	}
	events.Default.Emit(events.Event{
		Name:    events.EvtMembersCreate,
		Payload: rec,
	})
	return translateMember(rec), nil
}

package server

import (
	"context"
	"database/sql"

	"github.com/aarongodin/lightevent/internal/service"
	"github.com/aarongodin/lightevent/internal/storage"
)

func (s *Server) UpdateMember(ctx context.Context, message *service.WriteableMember) (*service.Member, error) {
	rec, err := s.queries.UpdateMember(ctx, storage.UpdateMemberParams{
		Email:     message.Email,
		FirstName: sql.NullString{String: message.FirstName, Valid: true},
		LastName:  sql.NullString{String: message.LastName, Valid: true},
	})
	if err != nil {
		return nil, errorResponse(err, "member")
	}

	// TODO(aarongodin): change to also emit update event
	// events.Default.Emit(events.Event{
	// 	Name:    events.EvtMembersCreate,
	// 	Payload: rec,
	// })

	return translateMember(rec), nil
}

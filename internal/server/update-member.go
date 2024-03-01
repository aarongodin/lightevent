package server

import (
	"context"

	"github.com/aarongodin/lightevent/internal/service"
	"github.com/aarongodin/lightevent/internal/storage"
)

func (s *Server) UpdateMember(ctx context.Context, message *service.WriteableMember) (*service.Member, error) {
  params := storage.UpdateMemberParams{
    Uid: message.Uid,
  }
  storage.SetOptionalString(&params.Email, message.Email)
  storage.SetOptionalString(&params.FirstName, message.FirstName)
  storage.SetOptionalString(&params.LastName, message.LastName)

	rec, err := s.queries.UpdateMember(ctx, params)
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

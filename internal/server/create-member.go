package server

import (
	"context"

	"github.com/aarongodin/lightevent/internal/service"
	"github.com/aarongodin/lightevent/internal/storage"
	"github.com/twitchtv/twirp"
  "github.com/google/uuid"
)

func (s *Server) CreateMember(ctx context.Context, message *service.WriteableMember) (*service.Member, error) {
  if (message.Email == nil) {
    return nil, twirp.InvalidArgumentError("email", "must be present on create")
  }
	params := storage.CreateMemberParams{
    Uid:   uuid.New().String(),
    Email: *message.Email,
		Verified: 1,
	}
  storage.SetOptionalString(&params.FirstName, message.FirstName)
  storage.SetOptionalString(&params.LastName, message.LastName)
	rec, err := s.queries.CreateMember(ctx, params)
	if err != nil {
		return nil, errorResponse(err, "member")
	}
	if err = s.providers.Email.Send(rec.Email, "Welcome to [orgname]", "welcome boop"); err != nil {
		return nil, errorResponse(err, "member")
	}
	return translateMember(rec), nil
}

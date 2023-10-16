package server

import (
	"context"

	"github.com/aarongodin/spectral/internal/service"
)

func (s *Server) CreateMember(ctx context.Context, message *service.WriteableMember) (*service.Member, error) {
	rec, err := s.Repo.Members.CreateMember(message.Email, false, message.FirstName, message.LastName)
	if err != nil {
		return nil, errorResponse(err, "member")
	}
	return memberRecordToMessage(rec), nil
}

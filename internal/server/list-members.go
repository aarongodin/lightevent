package server

import (
	"context"

	"github.com/aarongodin/spectral/internal/service"
)

func (s *Server) ListMembers(ctx context.Context, message *service.ListMembersOptions) (*service.MemberList, error) {
	recs, err := s.Repo.Members.ListMembers(message.Email)
	if err != nil {
		return nil, errorResponse(err, "member")
	}
	return &service.MemberList{
		Members: memberRecordsToMessage(recs),
	}, nil
}

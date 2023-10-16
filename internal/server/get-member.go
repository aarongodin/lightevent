package server

import (
	"context"

	"github.com/aarongodin/spectral/internal/service"
)

func (s *Server) GetMember(ctx context.Context, message *service.GetMemberOptions) (*service.Member, error) {
	rec, err := s.Repo.Members.GetMember(message.Email)
	if err != nil {
		return nil, errorResponse(err, "member")
	}
	return memberRecordToMessage(rec), nil
}

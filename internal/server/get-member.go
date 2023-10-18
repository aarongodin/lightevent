package server

import (
	"context"

	"github.com/aarongodin/lightevent/internal/service"
)

func (s *Server) GetMember(ctx context.Context, message *service.GetMemberOptions) (*service.Member, error) {
	rec, err := s.queries.GetMemberByEmail(ctx, message.Email)
	if err != nil {
		return nil, errorResponse(err, "member")
	}
	return translateMember(rec), nil
}

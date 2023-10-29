package server

import (
	"context"

	"github.com/aarongodin/lightevent/internal/service"
	"github.com/aarongodin/lightevent/internal/storage"
)

func (s *Server) ListMembers(ctx context.Context, message *service.ListMembersOptions) (*service.MemberList, error) {
	var recs []storage.Member
	var err error
	if message.Search != nil {
		recs, err = s.queries.ListMembersBySearch(ctx, *message.Search)
	} else {
		recs, err = s.queries.ListMembers(ctx)
	}
	if err != nil {
		return nil, errorResponse(err, "member")
	}
	members := make([]*service.Member, 0, len(recs))
	for _, rec := range recs {
		members = append(members, translateMember(rec))
	}
	return &service.MemberList{Members: members}, nil
}

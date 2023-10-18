package server

import (
	"context"

	"github.com/aarongodin/lightevent/internal/service"
)

func (s *Server) ListUsers(ctx context.Context, message *service.ListUsersOptions) (*service.UserList, error) {
	recs, err := s.queries.ListUsers(ctx)
	if err != nil {
		return nil, errorResponse(err, "users")
	}
	users := make([]*service.User, 0, len(recs))
	for _, rec := range recs {
		users = append(users, translateUser(rec))
	}
	return &service.UserList{Users: users}, nil
}

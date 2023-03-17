package server

import (
	"context"

	"github.com/aarongodin/spectral/internal/service"
)

func (s *Server) ListUsers(ctx context.Context, message *service.ListUsersOptions) (*service.UserList, error) {
	recs, err := s.Repo.Users.ListUsers()
	if err != nil {
		return nil, errorResponse(err, "users")
	}
	return &service.UserList{Users: userRecordsToMessage(recs)}, nil
}

package server

import (
	"context"

	"github.com/aarongodin/spectral/internal/service"
)

func (s *Server) CreateUser(ctx context.Context, message *service.WriteableUser) (*service.User, error) {
	rec, err := s.Repo.Users.CreateUser(message.Username, message.Password, message.Name)
	if err != nil {
		return nil, errorResponse(err, "user")
	}
	return userRecordToMessage(rec), nil
}

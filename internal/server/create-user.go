package server

import (
	"context"
	"database/sql"

	"github.com/aarongodin/spectral/internal/service"
	"github.com/aarongodin/spectral/internal/storage"
	"github.com/twitchtv/twirp"
	"golang.org/x/crypto/bcrypt"
)

func (s *Server) CreateUser(ctx context.Context, message *service.WriteableUser) (*service.User, error) {
	params := storage.CreateUserParams{
		Username: message.Username,
	}

	passwordHash, err := bcrypt.GenerateFromPassword([]byte(message.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, twirp.InternalErrorWith(err)
	}
	params.PasswordHash = string(passwordHash)

	if message.FirstName != nil {
		params.FirstName = sql.NullString{String: *message.FirstName, Valid: true}
	}
	if message.LastName != nil {
		params.LastName = sql.NullString{String: *message.LastName, Valid: true}
	}

	rec, err := s.queries.CreateUser(ctx, params)
	return translateUser(rec), nil
}

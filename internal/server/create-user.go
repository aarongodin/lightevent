package server

import (
	"context"
	"database/sql"

	"github.com/aarongodin/lightevent/internal/service"
	"github.com/aarongodin/lightevent/internal/storage"
	"github.com/google/uuid"
	"github.com/twitchtv/twirp"
	"golang.org/x/crypto/bcrypt"
)

func (s *Server) CreateUser(ctx context.Context, message *service.WriteableUser) (*service.User, error) {
	params := storage.CreateUserParams{
		Uid:      uuid.New().String(),
		Username: message.Username,
	}
	storage.SetOptionalString(&params.FirstName, message.FirstName)
	storage.SetOptionalString(&params.LastName, message.LastName)
	storage.SetOptionalString(&params.Email, message.Email)

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
	if err != nil {
		return nil, errorResponse(err, "user")
	}
	return translateUser(rec), nil
}

package server

import (
	"context"
	"database/sql"

	"github.com/aarongodin/lightevent/internal/service"
	"github.com/aarongodin/lightevent/internal/storage"
	"github.com/davecgh/go-spew/spew"
	"github.com/twitchtv/twirp"
	"golang.org/x/crypto/bcrypt"
)

func (s *Server) UpdateUser(ctx context.Context, message *service.WriteableUser) (*service.User, error) {
	user, err := s.queries.GetUserByUID(ctx, message.Uid)
	if err != nil {
		return nil, errorResponse(err, "user")
	}

	params := storage.UpdateUserParams{
		ID: user.ID,
	}
	storage.SetOptionalString(&params.Username, &message.Username)
	storage.SetOptionalString(&params.FirstName, message.FirstName)
	storage.SetOptionalString(&params.LastName, message.LastName)
	storage.SetOptionalString(&params.Email, message.Email)

	if message.Password != "" {
		passwordHash, err := bcrypt.GenerateFromPassword([]byte(message.Password), bcrypt.DefaultCost)
		if err != nil {
			return nil, twirp.InternalErrorWith(err)
		}
		params.PasswordHash = sql.NullString{String: string(passwordHash), Valid: true}
	}

	spew.Dump(params)
	rec, err := s.queries.UpdateUser(ctx, params)
	if err != nil {
		spew.Dump(err)
		return nil, errorResponse(err, "user")
	}

	return translateUser(rec), nil
}

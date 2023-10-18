package server

import (
	"context"

	"github.com/aarongodin/lightevent/internal/service"
	"github.com/aarongodin/lightevent/internal/storage"
	gonanoid "github.com/matoous/go-nanoid/v2"
	"github.com/twitchtv/twirp"
)

func (s *Server) CreateAPIKey(ctx context.Context, message *service.WriteableAPIKey) (*service.APIKeyWithSecret, error) {
	secret, err := gonanoid.New(32)
	if err != nil {
		return nil, twirp.InternalErrorWith(err)
	}
	rec, err := s.queries.CreateAPIKey(ctx, storage.CreateAPIKeyParams{
		Name:   message.Name,
		Secret: secret,
	})
	if err != nil {
		return nil, errorResponse(err, "API key")
	}
	return translateAPIKey(rec), nil
}

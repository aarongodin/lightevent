package server

import (
	"context"

	"github.com/aarongodin/lightevent/internal/service"
	"github.com/aarongodin/lightevent/internal/storage"
	"github.com/google/uuid"
)

func (s *Server) CreateAPIKey(ctx context.Context, message *service.WriteableAPIKey) (*service.APIKeyWithSecret, error) {
	rec, err := s.queries.CreateAPIKey(ctx, storage.CreateAPIKeyParams{
		Name:   message.Name,
		Secret: uuid.New().String(),
	})
	if err != nil {
		return nil, errorResponse(err, "API key")
	}
	return translateAPIKey(rec), nil
}

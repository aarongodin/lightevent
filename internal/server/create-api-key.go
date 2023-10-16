package server

import (
	"context"

	"github.com/aarongodin/spectral/internal/service"
)

func (s *Server) CreateAPIKey(ctx context.Context, message *service.WriteableAPIKey) (*service.APIKeyWithSecret, error) {
	rec, err := s.Repo.APIKeys.CreateAPIKey(message.Name)
	if err != nil {
		return nil, errorResponse(err, "API key")
	}
	return apiKeyRecordToMessage(rec), nil
}

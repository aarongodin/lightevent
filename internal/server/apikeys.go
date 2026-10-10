package server

import (
	"context"

	"connectrpc.com/connect"
	lighteventv1 "github.com/aarongodin/lightevent/internal/gen/lightevent/v1"
	"github.com/aarongodin/lightevent/internal/model"
	"github.com/aarongodin/lightevent/internal/secret"
	"github.com/aarongodin/lightevent/internal/storage"
)

// apiKeyPrefix makes LightEvent API keys recognizable (for example by secret scanners).
const apiKeyPrefix = "le_"

func (s *Server) CreateAPIKey(ctx context.Context, req *connect.Request[lighteventv1.CreateAPIKeyRequest]) (*connect.Response[lighteventv1.CreateAPIKeyResponse], error) {
	name, err := model.APIKeyName("name", req.Msg.Name)
	if err != nil {
		return nil, errorResponse(ctx, err, "API key")
	}
	key := apiKeyPrefix + secret.Token(32)
	rec, err := s.q.CreateAPIKey(ctx, storage.CreateAPIKeyParams{
		Uid:        secret.UID(),
		Name:       name,
		Prefix:     key[:len(apiKeyPrefix)+6],
		SecretHash: secret.Hash(key),
		CreatedAt:  s.Now(),
	})
	if err != nil {
		return nil, errorResponse(ctx, err, "API key")
	}
	return connect.NewResponse(&lighteventv1.CreateAPIKeyResponse{ApiKey: translateAPIKey(rec), Secret: key}), nil
}

func (s *Server) ListAPIKeys(ctx context.Context, _ *connect.Request[lighteventv1.ListAPIKeysRequest]) (*connect.Response[lighteventv1.ListAPIKeysResponse], error) {
	recs, err := s.q.ListAPIKeys(ctx)
	if err != nil {
		return nil, errorResponse(ctx, err, "API keys")
	}
	keys := make([]*lighteventv1.APIKey, 0, len(recs))
	for _, rec := range recs {
		keys = append(keys, translateAPIKey(rec))
	}
	return connect.NewResponse(&lighteventv1.ListAPIKeysResponse{ApiKeys: keys}), nil
}

func (s *Server) DeleteAPIKey(ctx context.Context, req *connect.Request[lighteventv1.DeleteAPIKeyRequest]) (*connect.Response[lighteventv1.DeleteAPIKeyResponse], error) {
	rec, err := s.q.GetAPIKeyByUID(ctx, req.Msg.Uid)
	if err != nil {
		return nil, errorResponse(ctx, err, "API key")
	}
	if err := s.q.DeleteAPIKey(ctx, rec.ID); err != nil {
		return nil, errorResponse(ctx, err, "API key")
	}
	return connect.NewResponse(&lighteventv1.DeleteAPIKeyResponse{}), nil
}

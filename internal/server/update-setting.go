package server

import (
	"context"

	"github.com/aarongodin/spectral/internal/service"
	"github.com/twitchtv/twirp"
)

func (s *Server) UpdateBoolSetting(ctx context.Context, message *service.BoolSetting) (*service.BoolSetting, error) {
	if err := s.PersistentConfig.Set(message.Name, message.Value); err != nil {
		return nil, errorResponse(err, "setting")
	}
	value := s.PersistentConfig.GetBool(message.Name)
	if value == nil {
		return nil, twirp.InternalError("failed to save bool setting")
	}
	return &service.BoolSetting{
		Name:  message.Name,
		Value: *value,
	}, nil
}

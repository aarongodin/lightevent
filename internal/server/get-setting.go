package server

import (
	"context"

	"github.com/aarongodin/spectral/internal/service"
	"github.com/twitchtv/twirp"
)

func (s *Server) GetBoolSetting(ctx context.Context, message *service.ByName) (*service.BoolSetting, error) {
	value := s.PersistentConfig.GetBool(message.Name)
	if value == nil {
		return nil, twirp.NotFoundError("bool setting not found")
	}
	return &service.BoolSetting{
		Name:  message.Name,
		Value: *value,
	}, nil
}

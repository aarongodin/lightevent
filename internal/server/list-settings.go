package server

import (
	"context"
	"encoding/json"

	"github.com/aarongodin/lightevent/internal/repository"
	"github.com/aarongodin/lightevent/internal/service"
)

func (s *Server) ListSettings(ctx context.Context, message *service.ListSettingsOptions) (*service.SettingsList, error) {
	list, err := repository.ListSettings(ctx, s.queries, repository.SETTINGS_APP)
	if err != nil {
		return nil, errorResponse(err, "settings")
	}
	settings, err := json.Marshal(list)
	if err != nil {
		return nil, errorResponse(err, "settings")
	}
	return &service.SettingsList{Settings: string(settings)}, nil
}

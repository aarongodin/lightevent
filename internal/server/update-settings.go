package server

import (
	"context"
	"encoding/json"

	"github.com/aarongodin/lightevent/internal/repository"
	"github.com/aarongodin/lightevent/internal/service"
)

func (s *Server) UpdateSettings(ctx context.Context, message *service.UpdateSettingsOptions) (*service.SettingsList, error) {
	list, err := repository.ListSettings(ctx, s.queries, repository.SETTINGS_APP)
	if err != nil {
		return nil, errorResponse(err, "settings")
	}

	// Set the requested settings changes before persisting
	newSettings := make(map[string]any)
	if err := json.Unmarshal([]byte(message.Settings), &newSettings); err != nil {
		return nil, errorResponse(err, "settings")
	}
	for k, v := range newSettings {
		list[k] = v
	}

	if err := repository.UpdateSettings(ctx, s.queries, repository.SETTINGS_APP, list); err != nil {
		return nil, errorResponse(err, "settings")
	}

	newList, err := json.Marshal(&list)
	if err != nil {
		return nil, errorResponse(err, "settings")
	}
	return &service.SettingsList{Settings: string(newList)}, nil
}

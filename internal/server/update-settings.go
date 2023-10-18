package server

import (
	"context"

	"github.com/aarongodin/lightevent/internal/repository"
	"github.com/aarongodin/lightevent/internal/service"
	"google.golang.org/protobuf/types/known/structpb"
)

func (s *Server) UpdateSettings(ctx context.Context, message *service.UpdateSettingsOptions) (*service.SettingsList, error) {
	list, err := repository.ListSettings(ctx, s.queries, repository.SETTINGS_APP)
	if err != nil {
		return nil, errorResponse(err, "settings")
	}

	// Set the requested settings changes before persisting
	for k, v := range message.Settings.AsMap() {
		list[k] = v
	}

	if err := repository.UpdateSettings(ctx, s.queries, repository.SETTINGS_APP, list); err != nil {
		return nil, errorResponse(err, "settings")
	}

	settings, err := structpb.NewStruct(list)
	if err != nil {
		return nil, errorResponse(err, "settings")
	}
	return &service.SettingsList{Settings: settings}, nil
}

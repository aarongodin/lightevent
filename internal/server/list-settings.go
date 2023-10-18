package server

import (
	"context"

	"github.com/aarongodin/lightevent/internal/repository"
	"github.com/aarongodin/lightevent/internal/service"
	"google.golang.org/protobuf/types/known/structpb"
)

func (s *Server) ListSettings(ctx context.Context, message *service.ListSettingsOptions) (*service.SettingsList, error) {
	list, err := repository.ListSettings(ctx, s.queries, repository.SETTINGS_APP)
	if err != nil {
		return nil, errorResponse(err, "settings")
	}
	settings, err := structpb.NewStruct(list)
	if err != nil {
		return nil, errorResponse(err, "settings")
	}
	return &service.SettingsList{Settings: settings}, nil
}

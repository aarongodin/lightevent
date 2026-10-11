package server

import (
	"context"
	"fmt"
	"slices"
	"sync"

	"connectrpc.com/connect"
	lighteventv1 "github.com/aarongodin/lightevent/internal/gen/lightevent/v1"
	"github.com/aarongodin/lightevent/internal/model"
	"github.com/aarongodin/lightevent/internal/storage"
	"github.com/rs/zerolog/log"
	"google.golang.org/protobuf/encoding/protojson"
)

const settingsClient = "client"

// clientSettingsCache holds the client settings in memory, because the allowed origins are checked on every
// cross-origin request. It is filled on first use and replaced when the settings are updated.
type clientSettingsCache struct {
	mu       sync.RWMutex
	settings *lighteventv1.ClientSettings
}

// loadClientSettings reads the client settings, returning defaults when none are stored.
func (s *Server) loadClientSettings(ctx context.Context) (*lighteventv1.ClientSettings, error) {
	s.clientSettings.mu.RLock()
	cached := s.clientSettings.settings
	s.clientSettings.mu.RUnlock()
	if cached != nil {
		return cached, nil
	}

	settings := &lighteventv1.ClientSettings{}
	row, err := s.q.GetSettings(ctx, settingsClient)
	switch {
	case isNoRows(err):
	case err != nil:
		return nil, err
	default:
		if err := (protojson.UnmarshalOptions{DiscardUnknown: true}).Unmarshal([]byte(row.Value), settings); err != nil {
			return nil, err
		}
	}
	s.clientSettings.mu.Lock()
	defer s.clientSettings.mu.Unlock()
	// An update that finished while the row was read has already cached newer settings.
	if s.clientSettings.settings == nil {
		s.clientSettings.settings = settings
	}
	return s.clientSettings.settings, nil
}

// AllowedOrigin reports whether websites on the origin may embed the client app and call the API. The origin
// must be in the client settings or in the CLIENT_ALLOWED_ORIGINS environment variable.
func (s *Server) AllowedOrigin(ctx context.Context, origin string) bool {
	if slices.Contains(s.rc.ClientAllowedOrigins, origin) {
		return true
	}
	settings, err := s.loadClientSettings(ctx)
	if err != nil {
		log.Ctx(ctx).Error().Err(err).Msg("error loading client settings")
		return false
	}
	return slices.Contains(settings.AllowedOrigins, origin)
}

func validateClientSettings(in *lighteventv1.ClientSettings) (*lighteventv1.ClientSettings, error) {
	if in == nil {
		in = &lighteventv1.ClientSettings{}
	}
	if len(in.AllowedOrigins) > model.MaxAllowedOrigins {
		return nil, model.ErrValidationFailed{
			Field: "settings.allowed_origins", Reason: fmt.Sprintf("must have at most %d origins", model.MaxAllowedOrigins),
		}
	}
	out := &lighteventv1.ClientSettings{
		AllowedOrigins:            []string{},
		ShowRemainingSpots:        in.ShowRemainingSpots,
		DisableSeriesRegistration: in.DisableSeriesRegistration,
	}
	for i, o := range in.AllowedOrigins {
		origin, err := model.Origin(fmt.Sprintf("settings.allowed_origins[%d]", i), o)
		if err != nil {
			return nil, err
		}
		if !slices.Contains(out.AllowedOrigins, origin) {
			out.AllowedOrigins = append(out.AllowedOrigins, origin)
		}
	}
	return out, nil
}

func (s *Server) GetClientSettings(ctx context.Context, _ *connect.Request[lighteventv1.GetClientSettingsRequest]) (*connect.Response[lighteventv1.GetClientSettingsResponse], error) {
	settings, err := s.loadClientSettings(ctx)
	if err != nil {
		return nil, errorResponse(ctx, err, "client settings")
	}
	return connect.NewResponse(&lighteventv1.GetClientSettingsResponse{Settings: settings}), nil
}

func (s *Server) UpdateClientSettings(ctx context.Context, req *connect.Request[lighteventv1.UpdateClientSettingsRequest]) (*connect.Response[lighteventv1.UpdateClientSettingsResponse], error) {
	settings, err := validateClientSettings(req.Msg.Settings)
	if err != nil {
		return nil, errorResponse(ctx, err, "client settings")
	}
	value, err := protojson.Marshal(settings)
	if err != nil {
		return nil, errorResponse(ctx, err, "client settings")
	}
	s.clientSettings.mu.Lock()
	defer s.clientSettings.mu.Unlock()
	if err := s.q.UpsertSettings(ctx, storage.UpsertSettingsParams{Name: settingsClient, Value: string(value), UpdatedAt: s.Now()}); err != nil {
		return nil, errorResponse(ctx, err, "client settings")
	}
	s.clientSettings.settings = settings
	return connect.NewResponse(&lighteventv1.UpdateClientSettingsResponse{Settings: settings}), nil
}

func (s *Server) GetClientConfig(ctx context.Context, _ *connect.Request[lighteventv1.GetClientConfigRequest]) (*connect.Response[lighteventv1.GetClientConfigResponse], error) {
	app, err := s.loadSettings(ctx)
	if err != nil {
		return nil, errorResponse(ctx, err, "client config")
	}
	client, err := s.loadClientSettings(ctx)
	if err != nil {
		return nil, errorResponse(ctx, err, "client config")
	}
	tags, err := s.listPublicTags(ctx)
	if err != nil {
		return nil, errorResponse(ctx, err, "client config")
	}
	return connect.NewResponse(&lighteventv1.GetClientConfigResponse{Config: &lighteventv1.ClientConfig{
		OrganizationName:          app.OrganizationName,
		Timezone:                  app.Timezone,
		ShowRemainingSpots:        client.ShowRemainingSpots,
		SeriesRegistrationEnabled: !client.DisableSeriesRegistration,
		Tags:                      tags,
	}}), nil
}

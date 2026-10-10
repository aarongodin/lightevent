package server

import (
	"context"
	"time"

	"connectrpc.com/connect"
	lighteventv1 "github.com/aarongodin/lightevent/internal/gen/lightevent/v1"
	"github.com/aarongodin/lightevent/internal/model"
	"github.com/aarongodin/lightevent/internal/notifications"
	"github.com/aarongodin/lightevent/internal/storage"
	"github.com/rs/zerolog/log"
	"google.golang.org/protobuf/encoding/protojson"
)

const settingsApp = "app"

// loadSettings reads the application settings, returning defaults when none are stored.
func (s *Server) loadSettings(ctx context.Context) (*lighteventv1.AppSettings, error) {
	settings := &lighteventv1.AppSettings{}
	row, err := s.q.GetSettings(ctx, settingsApp)
	if err != nil {
		if isNoRows(err) {
			return settings, nil
		}
		return nil, err
	}
	if err := (protojson.UnmarshalOptions{DiscardUnknown: true}).Unmarshal([]byte(row.Value), settings); err != nil {
		return nil, err
	}
	return settings, nil
}

// branding returns the settings used in emails. Errors fall back to defaults so emails are still sent.
func (s *Server) branding(ctx context.Context) notifications.Branding {
	settings, err := s.loadSettings(ctx)
	if err != nil {
		log.Ctx(ctx).Error().Err(err).Msg("error loading settings for email")
		return notifications.Branding{}
	}
	b := notifications.Branding{OrganizationName: settings.OrganizationName, SupportEmail: settings.SupportEmail}
	if settings.Timezone != "" {
		if loc, err := time.LoadLocation(settings.Timezone); err == nil {
			b.Location = loc
		}
	}
	return b
}

func (s *Server) GetSettings(ctx context.Context, _ *connect.Request[lighteventv1.GetSettingsRequest]) (*connect.Response[lighteventv1.GetSettingsResponse], error) {
	settings, err := s.loadSettings(ctx)
	if err != nil {
		return nil, errorResponse(ctx, err, "settings")
	}
	return connect.NewResponse(&lighteventv1.GetSettingsResponse{Settings: settings}), nil
}

func validateSettings(in *lighteventv1.AppSettings) (*lighteventv1.AppSettings, error) {
	if in == nil {
		in = &lighteventv1.AppSettings{}
	}
	var (
		out lighteventv1.AppSettings
		err error
	)
	if out.OrganizationName, err = model.PersonName("settings.organization_name", in.OrganizationName); err != nil {
		return nil, err
	}
	if out.SupportEmail, err = model.OptionalEmail("settings.support_email", in.SupportEmail); err != nil {
		return nil, err
	}
	if out.Timezone, err = model.Timezone("settings.timezone", in.Timezone); err != nil {
		return nil, err
	}
	return &out, nil
}

func (s *Server) UpdateSettings(ctx context.Context, req *connect.Request[lighteventv1.UpdateSettingsRequest]) (*connect.Response[lighteventv1.UpdateSettingsResponse], error) {
	settings, err := validateSettings(req.Msg.Settings)
	if err != nil {
		return nil, errorResponse(ctx, err, "settings")
	}
	value, err := protojson.Marshal(settings)
	if err != nil {
		return nil, errorResponse(ctx, err, "settings")
	}
	if err := s.q.UpsertSettings(ctx, storage.UpsertSettingsParams{Name: settingsApp, Value: string(value), UpdatedAt: s.Now()}); err != nil {
		return nil, errorResponse(ctx, err, "settings")
	}
	return connect.NewResponse(&lighteventv1.UpdateSettingsResponse{Settings: settings}), nil
}

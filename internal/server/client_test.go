package server

import (
	"context"
	"net/http"
	"testing"

	"connectrpc.com/connect"
	"github.com/aarongodin/lightevent/internal/access"
	lighteventv1 "github.com/aarongodin/lightevent/internal/gen/lightevent/v1"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func (h *harness) updateClientSettings(settings *lighteventv1.ClientSettings) (*lighteventv1.ClientSettings, error) {
	resp, err := h.s.UpdateClientSettings(adminCtx(), connect.NewRequest(&lighteventv1.UpdateClientSettingsRequest{Settings: settings}))
	if err != nil {
		return nil, err
	}
	return resp.Msg.Settings, nil
}

func TestClientSettings(t *testing.T) {
	h := newHarness(t)
	ctx := context.Background()

	resp, err := h.s.GetClientSettings(adminCtx(), connect.NewRequest(&lighteventv1.GetClientSettingsRequest{}))
	require.NoError(t, err)
	assert.Empty(t, resp.Msg.Settings.AllowedOrigins)
	assert.False(t, h.s.AllowedOrigin(ctx, "https://www.example.com"))

	settings, err := h.updateClientSettings(&lighteventv1.ClientSettings{
		AllowedOrigins:     []string{"https://WWW.example.com/", "https://www.example.com", "http://localhost:5600"},
		ShowRemainingSpots: true,
	})
	require.NoError(t, err)
	assert.Equal(t, []string{"https://www.example.com", "http://localhost:5600"}, settings.AllowedOrigins)
	assert.True(t, h.s.AllowedOrigin(ctx, "https://www.example.com"))
	assert.False(t, h.s.AllowedOrigin(ctx, "https://example.com"))

	_, err = h.updateClientSettings(&lighteventv1.ClientSettings{AllowedOrigins: []string{"www.example.com"}})
	assertCode(t, err, connect.CodeInvalidArgument)

	// Settings are read back from storage by a new server.
	fresh := New(h.store, h.rc, h.s.notifier)
	assert.True(t, fresh.AllowedOrigin(ctx, "http://localhost:5600"))

	// Origins from the environment are always allowed.
	h.rc.ClientAllowedOrigins = []string{"https://env.example.com"}
	assert.True(t, h.s.AllowedOrigin(ctx, "https://env.example.com"))
}

func TestClientConfig(t *testing.T) {
	h := newHarness(t)
	_, err := h.s.UpdateSettings(adminCtx(), connect.NewRequest(&lighteventv1.UpdateSettingsRequest{Settings: &lighteventv1.AppSettings{
		OrganizationName: "Sunrise Studio", Timezone: "America/Chicago",
	}}))
	require.NoError(t, err)
	h.createTag("yoga", "Yoga")
	h.createTag("unused", "Unused")
	h.createEvent(&lighteventv1.Event{Name: "flow", Tags: []string{"yoga"}})

	get := func() *lighteventv1.ClientConfig {
		resp, err := h.s.GetClientConfig(anonCtx(), connect.NewRequest(&lighteventv1.GetClientConfigRequest{}))
		require.NoError(t, err)
		return resp.Msg.Config
	}
	config := get()
	assert.Equal(t, "Sunrise Studio", config.OrganizationName)
	assert.Equal(t, "America/Chicago", config.Timezone)
	assert.False(t, config.ShowRemainingSpots)
	assert.True(t, config.SeriesRegistrationEnabled)
	require.Len(t, config.Tags, 1)
	assert.Equal(t, "yoga", config.Tags[0].Name)

	_, err = h.updateClientSettings(&lighteventv1.ClientSettings{ShowRemainingSpots: true, DisableSeriesRegistration: true})
	require.NoError(t, err)
	config = get()
	assert.True(t, config.ShowRemainingSpots)
	assert.False(t, config.SeriesRegistrationEnabled)
}

func TestMemberSessionToken(t *testing.T) {
	h := newHarness(t)
	key, code := h.beginVerification("token@example.com")
	resp, err := h.complete(key, code)
	require.NoError(t, err)
	token := resp.Msg.SessionToken
	require.True(t, len(token) > len(access.MemberTokenPrefix))

	header := http.Header{}
	header.Set("Authorization", "Bearer "+token)
	id, err := access.NewAuthenticator(h.q, h.clock.Now).Authenticate(context.Background(), header, access.AllowMember)
	require.NoError(t, err)
	assert.Equal(t, resp.Msg.Member.Uid, id.SubjectUID)

	profile, err := h.s.GetMyProfile(access.WithIdentity(context.Background(), id), connect.NewRequest(&lighteventv1.GetMyProfileRequest{}))
	require.NoError(t, err)
	assert.Equal(t, "token@example.com", profile.Msg.Member.Email)
	_, err = h.s.GetMyProfile(adminCtx(), connect.NewRequest(&lighteventv1.GetMyProfileRequest{}))
	assertCode(t, err, connect.CodePermissionDenied)

	// Ending the session revokes the token.
	_, err = h.s.EndMemberSession(access.WithIdentity(context.Background(), id), connect.NewRequest(&lighteventv1.EndMemberSessionRequest{}))
	require.NoError(t, err)
	_, err = access.NewAuthenticator(h.q, h.clock.Now).Authenticate(context.Background(), header, access.AllowMember)
	assertCode(t, err, connect.CodeUnauthenticated)
}

func TestSeriesRegistrationCanBeDisabled(t *testing.T) {
	h := newHarness(t)
	e := h.createEvent(&lighteventv1.Event{Name: "flow"})
	m := h.createMember("series@example.com")
	register := func(kind lighteventv1.RegistrationKind, dateUID *string) error {
		_, err := h.s.Register(h.memberCtx(m), connect.NewRequest(&lighteventv1.RegisterRequest{
			Registration: &lighteventv1.RegistrationInput{Kind: kind, EventName: e.Name, EventDateUid: dateUID},
		}))
		return err
	}

	_, err := h.updateClientSettings(&lighteventv1.ClientSettings{DisableSeriesRegistration: true})
	require.NoError(t, err)
	assertCode(t, register(lighteventv1.RegistrationKind_REGISTRATION_KIND_SERIES, nil), connect.CodeFailedPrecondition)
	require.NoError(t, register(lighteventv1.RegistrationKind_REGISTRATION_KIND_ONCE, &e.Dates[0].Uid))

	// Administrators can still register members for every date.
	m2 := h.createMember("series2@example.com")
	_, err = h.register(m2, e.Name, nil)
	require.NoError(t, err)
}

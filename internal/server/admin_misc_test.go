package server

import (
	"context"
	"strings"
	"testing"

	"connectrpc.com/connect"
	"github.com/aarongodin/lightevent/internal/access"
	lighteventv1 "github.com/aarongodin/lightevent/internal/gen/lightevent/v1"
	"github.com/aarongodin/lightevent/internal/secret"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestSessions(t *testing.T) {
	h := newHarness(t)
	ctx := context.Background()
	jane := h.createUser("jane")
	m := h.createMember("a@example.com")
	token, current, err := access.CreateSession(ctx, h.q, access.SessionKindUser, jane.Uid, testNow, h.rc.SessionMaxAge)
	require.NoError(t, err)
	_, memberSession, err := access.CreateSession(ctx, h.q, access.SessionKindMember, m.Uid, testNow, h.rc.SessionMaxAge)
	require.NoError(t, err)
	_, _, err = access.CreateSession(ctx, h.q, access.SessionKindUser, jane.Uid, testNow.Add(-2*h.rc.SessionMaxAge), h.rc.SessionMaxAge)
	require.NoError(t, err)

	list := func(req *lighteventv1.ListSessionsRequest) []*lighteventv1.Session {
		resp, err := h.s.ListSessions(h.userCtx(jane, current.ID), connect.NewRequest(req))
		require.NoError(t, err)
		return resp.Msg.Sessions
	}
	all := list(&lighteventv1.ListSessionsRequest{})
	require.Len(t, all, 2, "expired sessions are excluded")
	for _, s := range all {
		assert.NotContains(t, s.Uid, token, "tokens are never returned")
		if s.Kind == "user" {
			assert.True(t, s.Current)
			assert.Equal(t, "jane", s.SubjectName)
		} else {
			assert.False(t, s.Current)
			assert.Equal(t, "a@example.com", s.SubjectName)
		}
	}
	assert.Len(t, list(&lighteventv1.ListSessionsRequest{Kind: "member"}), 1)
	assert.Len(t, list(&lighteventv1.ListSessionsRequest{SubjectUid: jane.Uid}), 1)

	_, err = h.s.ListSessions(adminCtx(), connect.NewRequest(&lighteventv1.ListSessionsRequest{Kind: "robot"}))
	assertCode(t, err, connect.CodeInvalidArgument)

	_, err = h.s.RevokeSession(adminCtx(), connect.NewRequest(&lighteventv1.RevokeSessionRequest{Uid: memberSession.Uid}))
	require.NoError(t, err)
	assert.Len(t, list(&lighteventv1.ListSessionsRequest{}), 1)
	_, err = h.s.RevokeSession(adminCtx(), connect.NewRequest(&lighteventv1.RevokeSessionRequest{Uid: memberSession.Uid}))
	assertCode(t, err, connect.CodeNotFound)
}

func TestAPIKeys(t *testing.T) {
	h := newHarness(t)
	ctx := context.Background()
	resp, err := h.s.CreateAPIKey(adminCtx(), connect.NewRequest(&lighteventv1.CreateAPIKeyRequest{Name: " zapier "}))
	require.NoError(t, err)
	key := resp.Msg
	assert.True(t, strings.HasPrefix(key.Secret, "le_"))
	assert.Equal(t, "zapier", key.ApiKey.Name)
	assert.True(t, strings.HasPrefix(key.Secret, key.ApiKey.Prefix))
	assert.Len(t, key.ApiKey.Prefix, 9)

	rec, err := h.q.GetAPIKeyBySecretHash(ctx, secret.Hash(key.Secret))
	require.NoError(t, err)
	assert.NotEqual(t, key.Secret, rec.SecretHash, "only the hash is stored")

	_, err = h.s.CreateAPIKey(adminCtx(), connect.NewRequest(&lighteventv1.CreateAPIKeyRequest{Name: "zapier"}))
	assertCode(t, err, connect.CodeAlreadyExists)
	_, err = h.s.CreateAPIKey(adminCtx(), connect.NewRequest(&lighteventv1.CreateAPIKeyRequest{Name: ""}))
	assertCode(t, err, connect.CodeInvalidArgument)

	list, err := h.s.ListAPIKeys(adminCtx(), connect.NewRequest(&lighteventv1.ListAPIKeysRequest{}))
	require.NoError(t, err)
	require.Len(t, list.Msg.ApiKeys, 1)

	_, err = h.s.DeleteAPIKey(adminCtx(), connect.NewRequest(&lighteventv1.DeleteAPIKeyRequest{Uid: key.ApiKey.Uid}))
	require.NoError(t, err)
	_, err = h.s.DeleteAPIKey(adminCtx(), connect.NewRequest(&lighteventv1.DeleteAPIKeyRequest{Uid: key.ApiKey.Uid}))
	assertCode(t, err, connect.CodeNotFound)
}

func TestSettings(t *testing.T) {
	h := newHarness(t)
	got, err := h.s.GetSettings(adminCtx(), connect.NewRequest(&lighteventv1.GetSettingsRequest{}))
	require.NoError(t, err)
	assert.Equal(t, "", got.Msg.Settings.OrganizationName, "defaults when nothing is stored")

	resp, err := h.s.UpdateSettings(adminCtx(), connect.NewRequest(&lighteventv1.UpdateSettingsRequest{Settings: &lighteventv1.AppSettings{
		OrganizationName: " Yoga Co ", SupportEmail: "Help@Yoga.co", Timezone: "America/Chicago",
	}}))
	require.NoError(t, err)
	assert.Equal(t, "Yoga Co", resp.Msg.Settings.OrganizationName)
	assert.Equal(t, "help@yoga.co", resp.Msg.Settings.SupportEmail)

	got, err = h.s.GetSettings(adminCtx(), connect.NewRequest(&lighteventv1.GetSettingsRequest{}))
	require.NoError(t, err)
	assert.Equal(t, "America/Chicago", got.Msg.Settings.Timezone)

	b := h.s.branding(context.Background())
	assert.Equal(t, "Yoga Co", b.OrganizationName)
	require.NotNil(t, b.Location)
	assert.Equal(t, "America/Chicago", b.Location.String())

	for _, bad := range []*lighteventv1.AppSettings{{Timezone: "Mars/Base"}, {SupportEmail: "nope"}} {
		_, err := h.s.UpdateSettings(adminCtx(), connect.NewRequest(&lighteventv1.UpdateSettingsRequest{Settings: bad}))
		assertCode(t, err, connect.CodeInvalidArgument)
	}
	_, err = h.s.UpdateSettings(adminCtx(), connect.NewRequest(&lighteventv1.UpdateSettingsRequest{}))
	assert.NoError(t, err, "nil settings resets to defaults")
}

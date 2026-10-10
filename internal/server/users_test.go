package server

import (
	"context"
	"testing"

	"connectrpc.com/connect"
	"github.com/aarongodin/lightevent/internal/access"
	lighteventv1 "github.com/aarongodin/lightevent/internal/gen/lightevent/v1"
	"github.com/aarongodin/lightevent/internal/storage"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

const testPassword = "correct horse battery"

func (h *harness) createUser(username string) *lighteventv1.User {
	h.t.Helper()
	resp, err := h.s.CreateUser(adminCtx(), connect.NewRequest(&lighteventv1.CreateUserRequest{Username: username, Password: testPassword}))
	require.NoError(h.t, err)
	return resp.Msg.User
}

func TestCreateUser(t *testing.T) {
	h := newHarness(t)
	resp, err := h.s.CreateUser(adminCtx(), connect.NewRequest(&lighteventv1.CreateUserRequest{
		Username: "jane", Password: testPassword, FirstName: "Jane", Email: "Jane@Example.com",
	}))
	require.NoError(t, err)
	u := resp.Msg.User
	assert.Equal(t, "jane", u.Username)
	assert.Equal(t, "jane@example.com", u.Email, "email is returned")

	rec, err := h.q.GetUserByUID(context.Background(), u.Uid)
	require.NoError(t, err)
	assert.True(t, access.CheckPassword(rec.PasswordHash, testPassword))
	assert.NotContains(t, rec.PasswordHash, testPassword)

	for name, req := range map[string]*lighteventv1.CreateUserRequest{
		"duplicate (case-insensitive)": {Username: "JANE", Password: testPassword},
		"empty password":               {Username: "bob", Password: ""},
		"short password":               {Username: "bob", Password: "short"},
		"bad username":                 {Username: "b", Password: testPassword},
		"bad email":                    {Username: "bob", Password: testPassword, Email: "x"},
	} {
		_, err := h.s.CreateUser(adminCtx(), connect.NewRequest(req))
		assert.Error(t, err, name)
	}
}

func TestUpdateUser(t *testing.T) {
	h := newHarness(t)
	u := h.createUser("jane")
	h.createUser("bob")
	resp, err := h.s.UpdateUser(adminCtx(), connect.NewRequest(&lighteventv1.UpdateUserRequest{Uid: u.Uid, FirstName: ptr("Jane"), Email: ptr("j@example.com")}))
	require.NoError(t, err)
	assert.Equal(t, "Jane", resp.Msg.User.FirstName)
	assert.Equal(t, "jane", resp.Msg.User.Username)
	assert.NotEmpty(t, resp.Msg.User.UpdatedAt)

	_, err = h.s.UpdateUser(adminCtx(), connect.NewRequest(&lighteventv1.UpdateUserRequest{Uid: u.Uid, Username: ptr("bob")}))
	assertCode(t, err, connect.CodeAlreadyExists)
	_, err = h.s.UpdateUser(adminCtx(), connect.NewRequest(&lighteventv1.UpdateUserRequest{Uid: u.Uid, Username: ptr("")}))
	assertCode(t, err, connect.CodeInvalidArgument)
	_, err = h.s.UpdateUser(adminCtx(), connect.NewRequest(&lighteventv1.UpdateUserRequest{Uid: "x"}))
	assertCode(t, err, connect.CodeNotFound)
}

func TestSetUserPassword(t *testing.T) {
	h := newHarness(t)
	ctx := context.Background()
	jane := h.createUser("jane")
	bob := h.createUser("bob")

	_, current, err := access.CreateSession(ctx, h.q, access.SessionKindUser, jane.Uid, testNow, h.rc.SessionMaxAge)
	require.NoError(t, err)
	_, _, err = access.CreateSession(ctx, h.q, access.SessionKindUser, jane.Uid, testNow, h.rc.SessionMaxAge)
	require.NoError(t, err)
	_, _, err = access.CreateSession(ctx, h.q, access.SessionKindUser, bob.Uid, testNow, h.rc.SessionMaxAge)
	require.NoError(t, err)
	janeCtx := h.userCtx(jane, current.ID)

	set := func(ctx context.Context, uid, password, currentPassword string) error {
		_, err := h.s.SetUserPassword(ctx, connect.NewRequest(&lighteventv1.SetUserPasswordRequest{Uid: uid, Password: password, CurrentPassword: currentPassword}))
		return err
	}

	// Changing your own password requires the current password.
	assertCode(t, set(janeCtx, jane.Uid, "new password 123", "wrong"), connect.CodeInvalidArgument)
	assertCode(t, set(janeCtx, jane.Uid, "short", testPassword), connect.CodeInvalidArgument)
	require.NoError(t, set(janeCtx, jane.Uid, "new password 123", testPassword))

	sessions, err := h.q.ListActiveSessions(ctx, storage.ListActiveSessionsParams{Now: testNow, SubjectUid: jane.Uid})
	require.NoError(t, err)
	require.Len(t, sessions, 1, "other sessions are signed out")
	assert.Equal(t, current.ID, sessions[0].ID)

	// Another user's password can be reset without the current password; all their sessions end.
	require.NoError(t, set(janeCtx, bob.Uid, "bob password 123", ""))
	sessions, err = h.q.ListActiveSessions(ctx, storage.ListActiveSessionsParams{Now: testNow, SubjectUid: bob.Uid})
	require.NoError(t, err)
	assert.Empty(t, sessions)
	rec, err := h.q.GetUserByUID(ctx, bob.Uid)
	require.NoError(t, err)
	assert.True(t, access.CheckPassword(rec.PasswordHash, "bob password 123"))

	assertCode(t, set(adminCtx(), "missing", "bob password 123", ""), connect.CodeNotFound)
}

func TestDeleteUser(t *testing.T) {
	h := newHarness(t)
	jane := h.createUser("jane")
	janeCtx := h.userCtx(jane, 0)

	del := func(ctx context.Context, uid string) error {
		_, err := h.s.DeleteUser(ctx, connect.NewRequest(&lighteventv1.DeleteUserRequest{Uid: uid}))
		return err
	}
	assertCode(t, del(adminCtx(), jane.Uid), connect.CodeFailedPrecondition) // last user
	bob := h.createUser("bob")
	assertCode(t, del(janeCtx, jane.Uid), connect.CodeFailedPrecondition) // self
	require.NoError(t, del(janeCtx, bob.Uid))
	assertCode(t, del(janeCtx, bob.Uid), connect.CodeNotFound)

	resp, err := h.s.ListUsers(adminCtx(), connect.NewRequest(&lighteventv1.ListUsersRequest{}))
	require.NoError(t, err)
	require.Len(t, resp.Msg.Users, 1)
	assert.Equal(t, "jane", resp.Msg.Users[0].Username)
}

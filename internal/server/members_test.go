package server

import (
	"context"
	"fmt"
	"testing"

	"connectrpc.com/connect"
	"github.com/aarongodin/lightevent/internal/access"
	lighteventv1 "github.com/aarongodin/lightevent/internal/gen/lightevent/v1"
	"github.com/aarongodin/lightevent/internal/storage"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestCreateMember(t *testing.T) {
	h := newHarness(t)
	resp, err := h.s.CreateMember(adminCtx(), connect.NewRequest(&lighteventv1.CreateMemberRequest{
		Email: " Sam@Example.com ", FirstName: " Sam ", LastName: "Lee",
	}))
	require.NoError(t, err)
	m := resp.Msg.Member
	assert.Equal(t, "sam@example.com", m.Email)
	assert.Equal(t, "Sam", m.FirstName)
	assert.True(t, m.Verified)
	assert.NotEmpty(t, m.Uid)
	assert.Empty(t, h.emails(), "no welcome email is sent")

	_, err = h.s.CreateMember(adminCtx(), connect.NewRequest(&lighteventv1.CreateMemberRequest{Email: "SAM@example.com"}))
	assertCode(t, err, connect.CodeAlreadyExists)
	_, err = h.s.CreateMember(adminCtx(), connect.NewRequest(&lighteventv1.CreateMemberRequest{Email: "nope"}))
	assertCode(t, err, connect.CodeInvalidArgument)
	_, err = h.s.CreateMember(adminCtx(), connect.NewRequest(&lighteventv1.CreateMemberRequest{Email: "a@example.com", FirstName: "a\x01"}))
	assertCode(t, err, connect.CodeInvalidArgument)
}

func TestListMembers(t *testing.T) {
	h := newHarness(t)
	for i := 0; i < 5; i++ {
		h.createMember(fmt.Sprintf("member%d@example.com", i))
	}
	_, err := h.s.CreateMember(adminCtx(), connect.NewRequest(&lighteventv1.CreateMemberRequest{Email: "zed@example.com", LastName: "Percy%"}))
	require.NoError(t, err)

	list := func(req *lighteventv1.ListMembersRequest) ([]string, int32) {
		resp, err := h.s.ListMembers(adminCtx(), connect.NewRequest(req))
		require.NoError(t, err)
		emails := []string{}
		for _, m := range resp.Msg.Members {
			emails = append(emails, m.Email)
		}
		return emails, resp.Msg.Total
	}
	emails, total := list(&lighteventv1.ListMembersRequest{Limit: 2, Offset: 1})
	assert.Equal(t, []string{"member1@example.com", "member2@example.com"}, emails)
	assert.Equal(t, int32(6), total)

	emails, total = list(&lighteventv1.ListMembersRequest{Search: "ERCY%"})
	assert.Equal(t, []string{"zed@example.com"}, emails, "search is a literal, case-insensitive substring match")
	assert.Equal(t, int32(1), total)

	emails, _ = list(&lighteventv1.ListMembersRequest{Search: "_"})
	assert.Empty(t, emails, "wildcards are not interpreted")
}

func TestGetAndUpdateMember(t *testing.T) {
	h := newHarness(t)
	m := h.createMember("a@example.com")
	h.createMember("b@example.com")

	got, err := h.s.GetMember(adminCtx(), connect.NewRequest(&lighteventv1.GetMemberRequest{Uid: m.Uid}))
	require.NoError(t, err)
	assert.Equal(t, "a@example.com", got.Msg.Member.Email)
	_, err = h.s.GetMember(adminCtx(), connect.NewRequest(&lighteventv1.GetMemberRequest{Uid: "missing"}))
	assertCode(t, err, connect.CodeNotFound)

	resp, err := h.s.UpdateMember(adminCtx(), connect.NewRequest(&lighteventv1.UpdateMemberRequest{Uid: m.Uid, FirstName: ptr("Ann")}))
	require.NoError(t, err)
	assert.Equal(t, "Ann", resp.Msg.Member.FirstName)
	assert.Equal(t, "a@example.com", resp.Msg.Member.Email, "omitted fields are unchanged")

	resp, err = h.s.UpdateMember(adminCtx(), connect.NewRequest(&lighteventv1.UpdateMemberRequest{Uid: m.Uid, FirstName: ptr(""), Email: ptr("NEW@example.com")}))
	require.NoError(t, err)
	assert.Equal(t, "", resp.Msg.Member.FirstName, "fields can be cleared")
	assert.Equal(t, "new@example.com", resp.Msg.Member.Email)

	_, err = h.s.UpdateMember(adminCtx(), connect.NewRequest(&lighteventv1.UpdateMemberRequest{Uid: m.Uid, Email: ptr("b@example.com")}))
	assertCode(t, err, connect.CodeAlreadyExists)
	_, err = h.s.UpdateMember(adminCtx(), connect.NewRequest(&lighteventv1.UpdateMemberRequest{Uid: m.Uid, Email: ptr("bad")}))
	assertCode(t, err, connect.CodeInvalidArgument)
	_, err = h.s.UpdateMember(adminCtx(), connect.NewRequest(&lighteventv1.UpdateMemberRequest{Uid: "missing"}))
	assertCode(t, err, connect.CodeNotFound)
}

func TestDeleteMember(t *testing.T) {
	h := newHarness(t)
	ev := h.createEvent(&lighteventv1.Event{Name: "yoga"})
	m := h.createMember("a@example.com")
	_, err := h.register(m, "yoga", &ev.Dates[0].Uid)
	require.NoError(t, err)
	_, _, err = access.CreateSession(context.Background(), h.q, access.SessionKindMember, m.Uid, testNow, h.rc.SessionMaxAge)
	require.NoError(t, err)

	_, err = h.s.DeleteMember(adminCtx(), connect.NewRequest(&lighteventv1.DeleteMemberRequest{Uid: m.Uid}))
	require.NoError(t, err)

	_, err = h.s.GetMember(adminCtx(), connect.NewRequest(&lighteventv1.GetMemberRequest{Uid: m.Uid}))
	assertCode(t, err, connect.CodeNotFound)
	sessions, err := h.q.ListActiveSessions(context.Background(), storage.ListActiveSessionsParams{Now: testNow, SubjectUid: m.Uid})
	require.NoError(t, err)
	assert.Empty(t, sessions)
	// The event can now be deleted because no registrations reference it.
	_, err = h.s.DeleteEvent(adminCtx(), connect.NewRequest(&lighteventv1.DeleteEventRequest{Name: "yoga"}))
	assert.NoError(t, err)

	_, err = h.s.DeleteMember(adminCtx(), connect.NewRequest(&lighteventv1.DeleteMemberRequest{Uid: m.Uid}))
	assertCode(t, err, connect.CodeNotFound)
}

func TestListMemberRegistrations(t *testing.T) {
	h := newHarness(t)
	ev := h.createEvent(&lighteventv1.Event{Name: "yoga"})
	h.createEvent(&lighteventv1.Event{Name: "run"})
	m := h.createMember("a@example.com")
	_, err := h.register(m, "yoga", &ev.Dates[0].Uid)
	require.NoError(t, err)
	h.clock.Advance(1e9)
	_, err = h.register(m, "run", nil)
	require.NoError(t, err)

	resp, err := h.s.ListMemberRegistrations(adminCtx(), connect.NewRequest(&lighteventv1.ListMemberRegistrationsRequest{MemberUid: m.Uid}))
	require.NoError(t, err)
	require.Len(t, resp.Msg.Registrations, 2)
	assert.Equal(t, "run", resp.Msg.Registrations[0].EventName, "newest first")
	assert.Equal(t, ev.Dates[0].Uid, resp.Msg.Registrations[1].EventDate.Uid)

	_, err = h.s.ListMemberRegistrations(adminCtx(), connect.NewRequest(&lighteventv1.ListMemberRegistrationsRequest{MemberUid: "x"}))
	assertCode(t, err, connect.CodeNotFound)
}

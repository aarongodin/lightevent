package server

import (
	"context"
	"path/filepath"
	"sync"
	"testing"
	"time"

	"connectrpc.com/connect"
	"github.com/aarongodin/lightevent/internal/access"
	"github.com/aarongodin/lightevent/internal/config"
	lighteventv1 "github.com/aarongodin/lightevent/internal/gen/lightevent/v1"
	"github.com/aarongodin/lightevent/internal/notifications"
	"github.com/aarongodin/lightevent/internal/provider/email"
	"github.com/aarongodin/lightevent/internal/storage"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// testClock is a controllable clock.
type testClock struct {
	mu  sync.Mutex
	now time.Time
}

func (c *testClock) Now() time.Time {
	c.mu.Lock()
	defer c.mu.Unlock()
	return c.now
}

func (c *testClock) Advance(d time.Duration) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.now = c.now.Add(d)
}

type harness struct {
	t      *testing.T
	s      *Server
	store  *storage.Storage
	q      *storage.Queries
	clock  *testClock
	sender *email.LogSender
	rc     *config.RuntimeConfig
}

var testNow = time.Date(2027, 1, 1, 12, 0, 0, 0, time.UTC)

func newHarness(t *testing.T) *harness {
	t.Helper()
	store, err := storage.Open(context.Background(), filepath.Join(t.TempDir(), "test.sqlite3"))
	require.NoError(t, err)
	t.Cleanup(func() { store.Close() })

	sender := &email.LogSender{}
	notifier, err := notifications.New(sender)
	require.NoError(t, err)
	rc := &config.RuntimeConfig{SessionMaxAge: 24 * time.Hour, VerificationTTL: 15 * time.Minute, CookieSecure: true}
	clock := &testClock{now: testNow}
	return &harness{
		t: t, s: New(store, rc, notifier, WithClock(clock.Now)), store: store, q: store.Queries,
		clock: clock, sender: sender, rc: rc,
	}
}

// emails waits for background emails and returns everything sent so far.
func (h *harness) emails() []email.Message {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()
	h.s.notifier.Wait(ctx)
	return h.sender.Messages()
}

func adminCtx() context.Context {
	return access.WithIdentity(context.Background(), access.Identity{Scheme: access.SchemeAPIKey, SubjectID: 1, Name: "test"})
}

func anonCtx() context.Context {
	return access.WithIdentity(context.Background(), access.Identity{Scheme: access.SchemeAnonymous})
}

func (h *harness) memberCtx(m *lighteventv1.Member) context.Context {
	rec, err := h.q.GetMemberByUID(context.Background(), m.Uid)
	require.NoError(h.t, err)
	return access.WithIdentity(context.Background(), access.Identity{
		Scheme: access.SchemeMember, SubjectID: rec.ID, SubjectUID: rec.Uid, Name: rec.Email,
	})
}

func (h *harness) userCtx(u *lighteventv1.User, sessionID int64) context.Context {
	rec, err := h.q.GetUserByUID(context.Background(), u.Uid)
	require.NoError(h.t, err)
	return access.WithIdentity(context.Background(), access.Identity{
		Scheme: access.SchemeUser, SubjectID: rec.ID, SubjectUID: rec.Uid, Name: rec.Username, SessionID: sessionID,
	})
}

// at returns testNow shifted by d, formatted as RFC 3339.
func at(d time.Duration) string {
	return testNow.Add(d).Format(time.RFC3339)
}

const day = 24 * time.Hour

func (h *harness) createEvent(e *lighteventv1.Event) *lighteventv1.Event {
	h.t.Helper()
	if len(e.Dates) == 0 {
		e.Dates = []*lighteventv1.EventDate{{Value: at(day)}, {Value: at(2 * day)}}
	}
	if e.Title == "" {
		e.Title = e.Name
	}
	resp, err := h.s.CreateEvent(adminCtx(), connect.NewRequest(&lighteventv1.CreateEventRequest{Event: e}))
	require.NoError(h.t, err)
	return resp.Msg.Event
}

func (h *harness) createMember(addr string) *lighteventv1.Member {
	h.t.Helper()
	resp, err := h.s.CreateMember(adminCtx(), connect.NewRequest(&lighteventv1.CreateMemberRequest{Email: addr}))
	require.NoError(h.t, err)
	return resp.Msg.Member
}

func (h *harness) register(m *lighteventv1.Member, eventName string, dateUID *string) (*lighteventv1.Registration, error) {
	kind := lighteventv1.RegistrationKind_REGISTRATION_KIND_SERIES
	if dateUID != nil {
		kind = lighteventv1.RegistrationKind_REGISTRATION_KIND_ONCE
	}
	resp, err := h.s.CreateRegistration(adminCtx(), connect.NewRequest(&lighteventv1.CreateRegistrationRequest{
		MemberUid:    m.Uid,
		Registration: &lighteventv1.RegistrationInput{Kind: kind, EventName: eventName, EventDateUid: dateUID},
	}))
	if err != nil {
		return nil, err
	}
	return resp.Msg.Registration, nil
}

func ptr[T any](v T) *T { return &v }

func assertCode(t *testing.T, err error, code connect.Code) {
	t.Helper()
	require.Error(t, err)
	assert.Equal(t, code, connect.CodeOf(err), "error: %v", err)
}

func TestErrorResponse(t *testing.T) {
	ctx := context.Background()
	assert.NoError(t, errorResponse(ctx, nil, "x"))
	assert.Equal(t, connect.CodeInternal, connect.CodeOf(errorResponse(ctx, assert.AnError, "x")))
	assert.NotContains(t, errorResponse(ctx, assert.AnError, "x").Error(), assert.AnError.Error(), "internal details are hidden")
	assert.Equal(t, connect.CodeCanceled, connect.CodeOf(errorResponse(ctx, context.Canceled, "x")))
	orig := newError(connect.CodeAborted, "a")
	assert.Equal(t, connect.CodeAborted, connect.CodeOf(errorResponse(ctx, orig, "x")))
}

func TestPageHelpers(t *testing.T) {
	assert.Equal(t, int64(50), pageLimit(0, 50, 200))
	assert.Equal(t, int64(200), pageLimit(500, 50, 200))
	assert.Equal(t, int64(10), pageLimit(10, 50, 200))
	assert.Equal(t, int64(0), pageOffset(-3))
	assert.Equal(t, int64(4), pageOffset(4))
}

func TestPing(t *testing.T) {
	h := newHarness(t)
	resp, err := h.s.Ping(adminCtx(), connect.NewRequest(&lighteventv1.PingRequest{}))
	require.NoError(t, err)
	assert.Equal(t, "api-key", resp.Msg.Scheme)
	assert.Equal(t, "test", resp.Msg.DisplayName)
}

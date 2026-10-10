package server

import (
	"context"
	"net/http"
	"regexp"
	"strings"
	"testing"
	"time"

	"connectrpc.com/connect"
	"github.com/aarongodin/lightevent/internal/access"
	lighteventv1 "github.com/aarongodin/lightevent/internal/gen/lightevent/v1"
	"github.com/aarongodin/lightevent/internal/notifications"
	"github.com/aarongodin/lightevent/internal/provider/email"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

var emailedCode = regexp.MustCompile(`([0-9A-Z]{4})-([0-9A-Z]{4})`)

func (h *harness) beginVerification(addr string) (string, string) {
	h.t.Helper()
	before := len(h.sender.Messages())
	resp, err := h.s.BeginVerification(anonCtx(), connect.NewRequest(&lighteventv1.BeginVerificationRequest{Email: addr}))
	require.NoError(h.t, err)
	msgs := h.sender.Messages()
	require.Len(h.t, msgs, before+1)
	match := emailedCode.FindStringSubmatch(msgs[len(msgs)-1].Text)
	require.NotNil(h.t, match)
	return resp.Msg.Key, match[1] + match[2]
}

func (h *harness) complete(key, code string) (*connect.Response[lighteventv1.CompleteVerificationResponse], error) {
	return h.s.CompleteVerification(anonCtx(), connect.NewRequest(&lighteventv1.CompleteVerificationRequest{Key: key, Code: code}))
}

func TestVerificationCreatesMemberAndSession(t *testing.T) {
	h := newHarness(t)
	key, code := h.beginVerification(" New@Example.com ")
	assert.Equal(t, "new@example.com", h.sender.Messages()[0].To)

	resp, err := h.complete(key, strings.ToLower(code[:4])+"-"+code[4:])
	require.NoError(t, err)
	m := resp.Msg.Member
	assert.Equal(t, "new@example.com", m.Email)
	assert.True(t, m.Verified)
	assert.NotEmpty(t, m.Uid)

	cookies, err := http.ParseSetCookie(resp.Header().Get("Set-Cookie"))
	require.NoError(t, err)
	assert.Equal(t, access.CookieMemberSession, cookies.Name)
	assert.True(t, cookies.HttpOnly)
	assert.True(t, cookies.Secure)

	// The session cookie authenticates as the member.
	header := http.Header{}
	header.Add("Cookie", cookies.Name+"="+cookies.Value)
	id, err := access.NewAuthenticator(h.q, h.clock.Now).Authenticate(context.Background(), header, access.AllowMember)
	require.NoError(t, err)
	assert.Equal(t, m.Uid, id.SubjectUID)

	// The key cannot be reused.
	_, err = h.complete(key, code)
	assertCode(t, err, connect.CodeInvalidArgument)

	// Verifying again reuses the existing member.
	key, code = h.beginVerification("new@example.com")
	resp, err = h.complete(key, code)
	require.NoError(t, err)
	assert.Equal(t, m.Uid, resp.Msg.Member.Uid)
}

func TestVerificationMarksExistingMemberVerified(t *testing.T) {
	h := newHarness(t)
	ctx := context.Background()
	m := h.createMember("a@example.com")
	rec, err := h.q.GetMemberByUID(ctx, m.Uid)
	require.NoError(t, err)
	_, err = h.store.DB.ExecContext(ctx, "UPDATE members SET verified = 0 WHERE id = ?", rec.ID)
	require.NoError(t, err)

	key, code := h.beginVerification("a@example.com")
	resp, err := h.complete(key, code)
	require.NoError(t, err)
	assert.True(t, resp.Msg.Member.Verified)
	assert.Equal(t, m.Uid, resp.Msg.Member.Uid)
}

func TestVerificationAttemptsAreLimited(t *testing.T) {
	h := newHarness(t)
	key, code := h.beginVerification("a@example.com")
	for i := 0; i < maxVerificationAttempts; i++ {
		_, err := h.complete(key, "WRONG123")
		assertCode(t, err, connect.CodeInvalidArgument)
	}
	_, err := h.complete(key, code)
	assertCode(t, err, connect.CodeInvalidArgument)
}

func TestVerificationExpires(t *testing.T) {
	h := newHarness(t)
	key, code := h.beginVerification("a@example.com")
	h.clock.Advance(h.rc.VerificationTTL)
	_, err := h.complete(key, code)
	assertCode(t, err, connect.CodeInvalidArgument)
}

func TestVerificationInvalidInput(t *testing.T) {
	h := newHarness(t)
	_, err := h.complete("", "")
	assertCode(t, err, connect.CodeInvalidArgument)
	_, err = h.complete("unknown", "ABCD1234")
	assertCode(t, err, connect.CodeInvalidArgument)
	_, err = h.s.BeginVerification(anonCtx(), connect.NewRequest(&lighteventv1.BeginVerificationRequest{Email: "nope"}))
	assertCode(t, err, connect.CodeInvalidArgument)
}

func TestBeginVerificationAlwaysIssuesNewKey(t *testing.T) {
	h := newHarness(t)
	k1, c1 := h.beginVerification("a@example.com")
	k2, c2 := h.beginVerification("a@example.com")
	assert.NotEqual(t, k1, k2)
	assert.NotEqual(t, c1, c2)
}

func TestBeginVerificationRateLimitPerEmail(t *testing.T) {
	h := newHarness(t)
	for i := 0; i < maxVerificationsPerEmail; i++ {
		h.beginVerification("a@example.com")
	}
	_, err := h.s.BeginVerification(anonCtx(), connect.NewRequest(&lighteventv1.BeginVerificationRequest{Email: "a@example.com"}))
	assertCode(t, err, connect.CodeResourceExhausted)
	h.beginVerification("b@example.com")

	h.clock.Advance(verificationWindow + time.Second)
	h.beginVerification("a@example.com")
}

func TestBeginVerificationEmailFailure(t *testing.T) {
	h := newHarness(t)
	notifier, err := notifications.New(email.DisabledSender{})
	require.NoError(t, err)
	h.s.notifier = notifier
	_, err = h.s.BeginVerification(anonCtx(), connect.NewRequest(&lighteventv1.BeginVerificationRequest{Email: "a@example.com"}))
	assertCode(t, err, connect.CodeUnavailable)
}

func TestBeginVerificationRateLimitPerIP(t *testing.T) {
	h := newHarness(t)
	h.s.verifyIPLimit = h.s.verifyIPLimit.WithClock(h.clock.Now)
	var lastErr error
	for i := 0; i < 40; i++ {
		_, lastErr = h.s.BeginVerification(anonCtx(), connect.NewRequest(&lighteventv1.BeginVerificationRequest{Email: string(rune('a'+i%26)) + "x@example.com"}))
	}
	assertCode(t, lastErr, connect.CodeResourceExhausted)
}

func memberWithSession(t *testing.T, h *harness, addr string) (*lighteventv1.Member, context.Context) {
	t.Helper()
	key, code := h.beginVerification(addr)
	resp, err := h.complete(key, code)
	require.NoError(t, err)
	return resp.Msg.Member, h.memberCtx(resp.Msg.Member)
}

func registerSelf(ctx context.Context, h *harness, eventName string, dateUID *string) (*lighteventv1.Registration, error) {
	kind := lighteventv1.RegistrationKind_REGISTRATION_KIND_SERIES
	if dateUID != nil {
		kind = lighteventv1.RegistrationKind_REGISTRATION_KIND_ONCE
	}
	resp, err := h.s.Register(ctx, connect.NewRequest(&lighteventv1.RegisterRequest{
		Registration: &lighteventv1.RegistrationInput{Kind: kind, EventName: eventName, EventDateUid: dateUID},
	}))
	if err != nil {
		return nil, err
	}
	return resp.Msg.Registration, nil
}

func TestRegisterSelfService(t *testing.T) {
	h := newHarness(t)
	ev := h.createEvent(&lighteventv1.Event{Name: "yoga", Title: "Yoga", Dates: []*lighteventv1.EventDate{{Value: at(-day)}, {Value: at(day)}}})
	h.createEvent(&lighteventv1.Event{Name: "hidden", Hidden: true})
	h.createEvent(&lighteventv1.Event{Name: "closed", Closed: true})
	_, ctx := memberWithSession(t, h, "a@example.com")

	resp, err := h.s.Register(ctx, connect.NewRequest(&lighteventv1.RegisterRequest{
		Registration: &lighteventv1.RegistrationInput{Kind: lighteventv1.RegistrationKind_REGISTRATION_KIND_ONCE, EventName: "yoga", EventDateUid: &ev.Dates[1].Uid},
		FirstName:    ptr("Ann"),
		LastName:     ptr("Lee"),
	}))
	require.NoError(t, err)
	assert.Equal(t, "Ann", resp.Msg.Registration.Member.FirstName)

	msgs := h.emails()
	last := msgs[len(msgs)-1]
	assert.Equal(t, "Registration confirmed: Yoga", last.Subject)
	assert.Contains(t, last.Text, "Hi Ann Lee")

	_, err = registerSelf(ctx, h, "yoga", &ev.Dates[0].Uid)
	assertCode(t, err, connect.CodeFailedPrecondition) // past date
	_, err = registerSelf(ctx, h, "hidden", nil)
	assertCode(t, err, connect.CodeNotFound)
	_, err = registerSelf(ctx, h, "closed", nil)
	assertCode(t, err, connect.CodeFailedPrecondition)

	// Non-member identities are rejected by the handler as well as the access policy.
	_, err = registerSelf(adminCtx(), h, "yoga", nil)
	assertCode(t, err, connect.CodePermissionDenied)

	_, err = h.s.Register(ctx, connect.NewRequest(&lighteventv1.RegisterRequest{FirstName: ptr("a\x00")}))
	assertCode(t, err, connect.CodeInvalidArgument)
}

func TestRegisterSeriesOnlyChecksUpcomingDates(t *testing.T) {
	h := newHarness(t)
	ev := h.createEvent(&lighteventv1.Event{Name: "mixed", Capacity: 1, Dates: []*lighteventv1.EventDate{{Value: at(-day)}, {Value: at(day)}}})
	// The past date is full, but members only register for upcoming dates so the series is accepted.
	_, err := h.register(h.createMember("z@example.com"), "mixed", &ev.Dates[0].Uid)
	require.NoError(t, err)
	_, ctx := memberWithSession(t, h, "a@example.com")
	_, err = registerSelf(ctx, h, "mixed", nil)
	require.NoError(t, err)
}

func TestMyRegistrations(t *testing.T) {
	h := newHarness(t)
	ev := h.createEvent(&lighteventv1.Event{Name: "yoga", Dates: []*lighteventv1.EventDate{{Value: at(day)}, {Value: at(3 * day)}}})
	_, a := memberWithSession(t, h, "a@example.com")
	bm, b := memberWithSession(t, h, "b@example.com")

	reg, err := registerSelf(a, h, "yoga", &ev.Dates[0].Uid)
	require.NoError(t, err)
	_, err = registerSelf(b, h, "yoga", nil)
	require.NoError(t, err)

	list, err := h.s.ListMyRegistrations(a, connect.NewRequest(&lighteventv1.ListMyRegistrationsRequest{}))
	require.NoError(t, err)
	require.Len(t, list.Msg.Registrations, 1)
	assert.Equal(t, reg.ConfCode, list.Msg.Registrations[0].ConfCode)

	cancel := func(ctx context.Context, code string) error {
		_, err := h.s.CancelMyRegistration(ctx, connect.NewRequest(&lighteventv1.CancelMyRegistrationRequest{ConfCode: code}))
		return err
	}
	assertCode(t, cancel(b, reg.ConfCode), connect.CodeNotFound) // another member's registration
	require.NoError(t, cancel(a, reg.ConfCode))
	assertCode(t, cancel(a, reg.ConfCode), connect.CodeNotFound)
	msgs := h.emails()
	assert.Equal(t, "Registration cancelled: yoga", msgs[len(msgs)-1].Subject)

	// Registrations for dates that have passed cannot be cancelled by members.
	reg, err = registerSelf(a, h, "yoga", &ev.Dates[1].Uid)
	require.NoError(t, err)
	h.clock.Advance(4 * day)
	assertCode(t, cancel(a, reg.ConfCode), connect.CodeFailedPrecondition)

	bList, err := h.s.ListMemberRegistrations(adminCtx(), connect.NewRequest(&lighteventv1.ListMemberRegistrationsRequest{MemberUid: bm.Uid}))
	require.NoError(t, err)
	assert.Len(t, bList.Msg.Registrations, 1)
}

func TestEndMemberSession(t *testing.T) {
	h := newHarness(t)
	key, code := h.beginVerification("a@example.com")
	resp, err := h.complete(key, code)
	require.NoError(t, err)
	cookie, err := http.ParseSetCookie(resp.Header().Get("Set-Cookie"))
	require.NoError(t, err)

	header := http.Header{}
	header.Add("Cookie", cookie.Name+"="+cookie.Value)
	auth := access.NewAuthenticator(h.q, h.clock.Now)
	id, err := auth.Authenticate(context.Background(), header, access.AllowMember)
	require.NoError(t, err)

	end, err := h.s.EndMemberSession(access.WithIdentity(context.Background(), id), connect.NewRequest(&lighteventv1.EndMemberSessionRequest{}))
	require.NoError(t, err)
	cleared, err := http.ParseSetCookie(end.Header().Get("Set-Cookie"))
	require.NoError(t, err)
	assert.Equal(t, -1, cleared.MaxAge)

	_, err = auth.Authenticate(context.Background(), header, access.AllowMember)
	assertCode(t, err, connect.CodeUnauthenticated)
}

func TestUnverifiedMemberCannotSelfRegister(t *testing.T) {
	h := newHarness(t)
	h.createEvent(&lighteventv1.Event{Name: "yoga"})
	m := h.createMember("a@example.com")
	rec, err := h.q.GetMemberByUID(context.Background(), m.Uid)
	require.NoError(t, err)
	_, err = h.store.DB.ExecContext(context.Background(), "UPDATE members SET verified = 0 WHERE id = ?", rec.ID)
	require.NoError(t, err)
	_, err = registerSelf(h.memberCtx(m), h, "yoga", nil)
	assertCode(t, err, connect.CodePermissionDenied)
}

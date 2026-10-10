package server

import (
	"context"
	"regexp"
	"sync"
	"testing"

	"connectrpc.com/connect"
	lighteventv1 "github.com/aarongodin/lightevent/internal/gen/lightevent/v1"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

var confCodePattern = regexp.MustCompile(`^[0-9A-HJKMNP-TV-Z]{8}$`)

func TestCreateRegistrationOnce(t *testing.T) {
	h := newHarness(t)
	ev := h.createEvent(&lighteventv1.Event{Name: "yoga", Title: "Yoga"})
	m := h.createMember("a@example.com")

	reg, err := h.register(m, "yoga", &ev.Dates[0].Uid)
	require.NoError(t, err)
	assert.Regexp(t, confCodePattern, reg.ConfCode)
	assert.Equal(t, lighteventv1.RegistrationKind_REGISTRATION_KIND_ONCE, reg.Kind)
	assert.Equal(t, "Yoga", reg.EventTitle)
	assert.Equal(t, ev.Dates[0].Uid, reg.EventDate.Uid)
	assert.Equal(t, m.Uid, reg.Member.Uid)

	// Duplicate registration for the same date.
	_, err = h.register(m, "yoga", &ev.Dates[0].Uid)
	assertCode(t, err, connect.CodeAlreadyExists)

	// No email unless requested.
	assert.Empty(t, h.emails())
}

func TestCreateRegistrationValidation(t *testing.T) {
	h := newHarness(t)
	ev := h.createEvent(&lighteventv1.Event{Name: "yoga"})
	other := h.createEvent(&lighteventv1.Event{Name: "other"})
	m := h.createMember("a@example.com")

	// A date that belongs to a different event is rejected.
	_, err := h.register(m, "yoga", &other.Dates[0].Uid)
	assertCode(t, err, connect.CodeInvalidArgument)
	_, err = h.register(m, "yoga", ptr("missing"))
	assertCode(t, err, connect.CodeInvalidArgument)
	_, err = h.register(m, "yoga", ptr(""))
	assertCode(t, err, connect.CodeInvalidArgument)
	_, err = h.register(m, "missing", nil)
	assertCode(t, err, connect.CodeNotFound)

	_, err = h.s.CreateRegistration(adminCtx(), connect.NewRequest(&lighteventv1.CreateRegistrationRequest{
		MemberUid: m.Uid, Registration: &lighteventv1.RegistrationInput{EventName: "yoga"},
	}))
	assertCode(t, err, connect.CodeInvalidArgument)
	_, err = h.s.CreateRegistration(adminCtx(), connect.NewRequest(&lighteventv1.CreateRegistrationRequest{MemberUid: m.Uid}))
	assertCode(t, err, connect.CodeInvalidArgument)
	_, err = h.s.CreateRegistration(adminCtx(), connect.NewRequest(&lighteventv1.CreateRegistrationRequest{MemberUid: "missing"}))
	assertCode(t, err, connect.CodeNotFound)

	// Cancelled dates do not accept registrations.
	_, err = h.s.CancelEventDate(adminCtx(), connect.NewRequest(&lighteventv1.CancelEventDateRequest{EventDateUid: ev.Dates[0].Uid}))
	require.NoError(t, err)
	_, err = h.register(m, "yoga", &ev.Dates[0].Uid)
	assertCode(t, err, connect.CodeFailedPrecondition)

	// Archived events do not accept registrations, even from administrators.
	_, err = h.s.SetEventArchived(adminCtx(), connect.NewRequest(&lighteventv1.SetEventArchivedRequest{Name: "yoga", Archived: true}))
	require.NoError(t, err)
	_, err = h.register(m, "yoga", &ev.Dates[1].Uid)
	assertCode(t, err, connect.CodeFailedPrecondition)
}

func TestAdminMayRegisterForClosedHiddenAndPast(t *testing.T) {
	h := newHarness(t)
	ev := h.createEvent(&lighteventv1.Event{Name: "yoga", Hidden: true, Closed: true, Dates: []*lighteventv1.EventDate{{Value: at(-day)}}})
	m := h.createMember("a@example.com")
	_, err := h.register(m, "yoga", &ev.Dates[0].Uid)
	assert.NoError(t, err)
}

func TestSeriesAndOnceConflicts(t *testing.T) {
	h := newHarness(t)
	ev := h.createEvent(&lighteventv1.Event{Name: "yoga"})
	a, b := h.createMember("a@example.com"), h.createMember("b@example.com")

	_, err := h.register(a, "yoga", nil)
	require.NoError(t, err)
	_, err = h.register(a, "yoga", nil)
	assertCode(t, err, connect.CodeAlreadyExists)
	_, err = h.register(a, "yoga", &ev.Dates[0].Uid)
	assertCode(t, err, connect.CodeAlreadyExists)

	_, err = h.register(b, "yoga", &ev.Dates[0].Uid)
	require.NoError(t, err)
	_, err = h.register(b, "yoga", nil)
	assertCode(t, err, connect.CodeAlreadyExists)
}

func TestRegisterAgainAfterCancelling(t *testing.T) {
	h := newHarness(t)
	ev := h.createEvent(&lighteventv1.Event{Name: "yoga"})
	m := h.createMember("a@example.com")
	for i := 0; i < 2; i++ {
		reg, err := h.register(m, "yoga", &ev.Dates[0].Uid)
		require.NoError(t, err)
		_, err = h.s.DeleteRegistration(adminCtx(), connect.NewRequest(&lighteventv1.DeleteRegistrationRequest{ConfCode: reg.ConfCode}))
		require.NoError(t, err)
	}
	for i := 0; i < 2; i++ {
		reg, err := h.register(m, "yoga", nil)
		require.NoError(t, err)
		_, err = h.s.DeleteRegistration(adminCtx(), connect.NewRequest(&lighteventv1.DeleteRegistrationRequest{ConfCode: reg.ConfCode}))
		require.NoError(t, err)
	}
}

func TestCapacity(t *testing.T) {
	h := newHarness(t)
	ev := h.createEvent(&lighteventv1.Event{Name: "yoga", Capacity: 2})
	a, b, c, d := h.createMember("a@example.com"), h.createMember("b@example.com"), h.createMember("c@example.com"), h.createMember("d@example.com")

	// A series registration counts against every date.
	_, err := h.register(a, "yoga", nil)
	require.NoError(t, err)
	_, err = h.register(b, "yoga", &ev.Dates[0].Uid)
	require.NoError(t, err)
	_, err = h.register(c, "yoga", &ev.Dates[0].Uid)
	assertCode(t, err, connect.CodeResourceExhausted)
	_, err = h.register(c, "yoga", &ev.Dates[1].Uid)
	require.NoError(t, err)

	// Both dates are now full, so another series registration is rejected.
	_, err = h.register(d, "yoga", nil)
	assertCode(t, err, connect.CodeResourceExhausted)

	got, err := h.s.GetEvent(adminCtx(), connect.NewRequest(&lighteventv1.GetEventRequest{Name: "yoga"}))
	require.NoError(t, err)
	assert.Equal(t, int32(2), got.Msg.Event.Dates[0].RegistrationCount)
	assert.Equal(t, int32(2), got.Msg.Event.Dates[1].RegistrationCount)
}

func TestCapacityUnderConcurrency(t *testing.T) {
	h := newHarness(t)
	ev := h.createEvent(&lighteventv1.Event{Name: "yoga", Capacity: 3})
	members := make([]*lighteventv1.Member, 10)
	for i := range members {
		members[i] = h.createMember(string(rune('a'+i)) + "@example.com")
	}
	var wg sync.WaitGroup
	var mu sync.Mutex
	ok := 0
	for _, m := range members {
		wg.Add(1)
		go func(m *lighteventv1.Member) {
			defer wg.Done()
			if _, err := h.register(m, "yoga", &ev.Dates[0].Uid); err == nil {
				mu.Lock()
				ok++
				mu.Unlock()
			}
		}(m)
	}
	wg.Wait()
	assert.Equal(t, 3, ok)
}

func TestSeriesRequiresUpcomingDates(t *testing.T) {
	h := newHarness(t)
	ev := h.createEvent(&lighteventv1.Event{Name: "yoga", Dates: []*lighteventv1.EventDate{{Value: at(day)}}})
	_, err := h.s.CancelEventDate(adminCtx(), connect.NewRequest(&lighteventv1.CancelEventDateRequest{EventDateUid: ev.Dates[0].Uid}))
	require.NoError(t, err)
	_, err = h.register(h.createMember("a@example.com"), "yoga", nil)
	assertCode(t, err, connect.CodeFailedPrecondition)
}

func TestNotifyMember(t *testing.T) {
	h := newHarness(t)
	ev := h.createEvent(&lighteventv1.Event{Name: "yoga", Title: "Yoga"})
	m := h.createMember("a@example.com")
	resp, err := h.s.CreateRegistration(adminCtx(), connect.NewRequest(&lighteventv1.CreateRegistrationRequest{
		MemberUid:    m.Uid,
		NotifyMember: true,
		Registration: &lighteventv1.RegistrationInput{Kind: lighteventv1.RegistrationKind_REGISTRATION_KIND_ONCE, EventName: "yoga", EventDateUid: &ev.Dates[0].Uid},
	}))
	require.NoError(t, err)
	_, err = h.s.DeleteRegistration(adminCtx(), connect.NewRequest(&lighteventv1.DeleteRegistrationRequest{ConfCode: resp.Msg.Registration.ConfCode, NotifyMember: true}))
	require.NoError(t, err)

	msgs := h.emails()
	require.Len(t, msgs, 2)
	subjects := []string{msgs[0].Subject, msgs[1].Subject}
	assert.ElementsMatch(t, []string{"Registration confirmed: Yoga", "Registration cancelled: Yoga"}, subjects)
	assert.Equal(t, "a@example.com", msgs[0].To)
}

func TestDeleteRegistration(t *testing.T) {
	h := newHarness(t)
	ev := h.createEvent(&lighteventv1.Event{Name: "yoga"})
	reg, err := h.register(h.createMember("a@example.com"), "yoga", &ev.Dates[0].Uid)
	require.NoError(t, err)

	del := func(code string) error {
		_, err := h.s.DeleteRegistration(adminCtx(), connect.NewRequest(&lighteventv1.DeleteRegistrationRequest{ConfCode: code}))
		return err
	}
	assertCode(t, del("NOPE1234"), connect.CodeNotFound)
	// Conf codes are accepted in formatted, lower case form.
	formatted := reg.ConfCode[:4] + "-" + reg.ConfCode[4:]
	require.NoError(t, del(formatted))
	assertCode(t, del(reg.ConfCode), connect.CodeNotFound)

	list, err := h.s.ListEventRegistrations(adminCtx(), connect.NewRequest(&lighteventv1.ListEventRegistrationsRequest{EventName: "yoga"}))
	require.NoError(t, err)
	assert.Empty(t, list.Msg.Registrations)
}

func TestListEventRegistrations(t *testing.T) {
	h := newHarness(t)
	ev := h.createEvent(&lighteventv1.Event{Name: "yoga"})
	a, b := h.createMember("a@example.com"), h.createMember("b@example.com")
	_, err := h.register(a, "yoga", nil)
	require.NoError(t, err)
	_, err = h.register(b, "yoga", &ev.Dates[1].Uid)
	require.NoError(t, err)

	resp, err := h.s.ListEventRegistrations(adminCtx(), connect.NewRequest(&lighteventv1.ListEventRegistrationsRequest{EventName: "yoga"}))
	require.NoError(t, err)
	regs := resp.Msg.Registrations
	require.Len(t, regs, 2)
	assert.Equal(t, "a@example.com", regs[0].Member.Email)
	assert.Nil(t, regs[0].EventDate)
	assert.Equal(t, ev.Dates[1].Uid, regs[1].EventDate.Uid)

	_, err = h.s.ListEventRegistrations(adminCtx(), connect.NewRequest(&lighteventv1.ListEventRegistrationsRequest{EventName: "missing"}))
	assertCode(t, err, connect.CodeNotFound)
}

func TestGetRegistrationOwnership(t *testing.T) {
	h := newHarness(t)
	ev := h.createEvent(&lighteventv1.Event{Name: "yoga"})
	a, b := h.createMember("a@example.com"), h.createMember("b@example.com")
	reg, err := h.register(a, "yoga", &ev.Dates[0].Uid)
	require.NoError(t, err)

	get := func(ctx context.Context) error {
		_, err := h.s.GetRegistration(ctx, connect.NewRequest(&lighteventv1.GetRegistrationRequest{ConfCode: reg.ConfCode}))
		return err
	}
	assert.NoError(t, get(adminCtx()))
	assert.NoError(t, get(h.memberCtx(a)))
	assertCode(t, get(h.memberCtx(b)), connect.CodeNotFound)
}

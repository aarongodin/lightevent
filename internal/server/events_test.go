package server

import (
	"context"
	"testing"

	"connectrpc.com/connect"
	lighteventv1 "github.com/aarongodin/lightevent/internal/gen/lightevent/v1"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestCreateEvent(t *testing.T) {
	h := newHarness(t)
	ev := h.createEvent(&lighteventv1.Event{
		Name: "Yoga", Title: " Yoga ", Description: "Stretch", Capacity: 5,
		Dates: []*lighteventv1.EventDate{{Value: at(2 * day)}, {Value: at(day)}},
	})
	assert.Equal(t, "yoga", ev.Name)
	assert.Equal(t, "Yoga", ev.Title)
	assert.Equal(t, int32(5), ev.Capacity)
	require.Len(t, ev.Dates, 2)
	assert.Equal(t, at(day), ev.Dates[0].Value, "dates are sorted ascending")
	assert.NotEmpty(t, ev.Dates[0].Uid)
	assert.NotEmpty(t, ev.CreatedAt)

	_, err := h.s.CreateEvent(adminCtx(), connect.NewRequest(&lighteventv1.CreateEventRequest{Event: &lighteventv1.Event{
		Name: "yoga", Title: "Again", Dates: []*lighteventv1.EventDate{{Value: at(day)}},
	}}))
	assertCode(t, err, connect.CodeAlreadyExists)

	_, err = h.s.CreateEvent(adminCtx(), connect.NewRequest(&lighteventv1.CreateEventRequest{Event: &lighteventv1.Event{
		Name: "other", Title: "Other", Dates: []*lighteventv1.EventDate{{Uid: "x", Value: at(day)}},
	}}))
	assertCode(t, err, connect.CodeInvalidArgument)

	_, err = h.s.CreateEvent(adminCtx(), connect.NewRequest(&lighteventv1.CreateEventRequest{}))
	assertCode(t, err, connect.CodeInvalidArgument)
}

func TestGetEventVisibility(t *testing.T) {
	h := newHarness(t)
	h.createEvent(&lighteventv1.Event{Name: "hidden", Hidden: true})
	h.createEvent(&lighteventv1.Event{Name: "visible"})

	get := func(ctx context.Context, name string) error {
		_, err := h.s.GetEvent(ctx, connect.NewRequest(&lighteventv1.GetEventRequest{Name: name}))
		return err
	}
	assert.NoError(t, get(adminCtx(), "hidden"))
	assertCode(t, get(anonCtx(), "hidden"), connect.CodeNotFound)
	assert.NoError(t, get(anonCtx(), "visible"))
	assertCode(t, get(anonCtx(), "missing"), connect.CodeNotFound)

	_, err := h.s.SetEventArchived(adminCtx(), connect.NewRequest(&lighteventv1.SetEventArchivedRequest{Name: "visible", Archived: true}))
	require.NoError(t, err)
	assertCode(t, get(anonCtx(), "visible"), connect.CodeNotFound)
	assert.NoError(t, get(adminCtx(), "visible"))
}

func listEvents(t *testing.T, h *harness, ctx context.Context, req *lighteventv1.ListEventsRequest) ([]string, int32) {
	t.Helper()
	resp, err := h.s.ListEvents(ctx, connect.NewRequest(req))
	require.NoError(t, err)
	names := []string{}
	for _, e := range resp.Msg.Events {
		names = append(names, e.Name)
	}
	return names, resp.Msg.Total
}

func TestListEvents(t *testing.T) {
	h := newHarness(t)
	h.createEvent(&lighteventv1.Event{Name: "later", Title: "Later Class", Dates: []*lighteventv1.EventDate{{Value: at(10 * day)}}})
	h.createEvent(&lighteventv1.Event{Name: "soon", Title: "Soon Class", Dates: []*lighteventv1.EventDate{{Value: at(day)}}})
	h.createEvent(&lighteventv1.Event{Name: "past", Dates: []*lighteventv1.EventDate{{Value: at(-day)}}})
	h.createEvent(&lighteventv1.Event{Name: "hidden", Hidden: true})
	h.createEvent(&lighteventv1.Event{Name: "archived"})
	_, err := h.s.SetEventArchived(adminCtx(), connect.NewRequest(&lighteventv1.SetEventArchivedRequest{Name: "archived", Archived: true}))
	require.NoError(t, err)
	cancelledOnly := h.createEvent(&lighteventv1.Event{Name: "cancelled", Dates: []*lighteventv1.EventDate{{Value: at(day)}}})
	_, err = h.s.CancelEventDate(adminCtx(), connect.NewRequest(&lighteventv1.CancelEventDateRequest{EventDateUid: cancelledOnly.Dates[0].Uid}))
	require.NoError(t, err)

	names, total := listEvents(t, h, adminCtx(), &lighteventv1.ListEventsRequest{})
	assert.Equal(t, []string{"cancelled", "hidden", "soon", "later"}, names, "upcoming, ordered by next date then newest first")
	assert.Equal(t, int32(4), total)

	names, _ = listEvents(t, h, adminCtx(), &lighteventv1.ListEventsRequest{Filter: lighteventv1.EventFilter_EVENT_FILTER_PAST})
	assert.Equal(t, []string{"past"}, names)
	names, _ = listEvents(t, h, adminCtx(), &lighteventv1.ListEventsRequest{Filter: lighteventv1.EventFilter_EVENT_FILTER_ARCHIVED})
	assert.Equal(t, []string{"archived"}, names)
	_, total = listEvents(t, h, adminCtx(), &lighteventv1.ListEventsRequest{Filter: lighteventv1.EventFilter_EVENT_FILTER_ALL})
	assert.Equal(t, int32(5), total)

	names, total = listEvents(t, h, adminCtx(), &lighteventv1.ListEventsRequest{Search: "CLASS"})
	assert.ElementsMatch(t, []string{"soon", "later"}, names)
	assert.Equal(t, int32(2), total)

	names, total = listEvents(t, h, adminCtx(), &lighteventv1.ListEventsRequest{Limit: 1, Offset: 1})
	assert.Equal(t, []string{"hidden"}, names)
	assert.Equal(t, int32(4), total)

	// Members and anonymous visitors only see visible events with an upcoming, non-cancelled date.
	names, total = listEvents(t, h, anonCtx(), &lighteventv1.ListEventsRequest{Filter: lighteventv1.EventFilter_EVENT_FILTER_ALL})
	assert.Equal(t, []string{"soon", "later"}, names)
	assert.Equal(t, int32(2), total)
}

func TestUpdateEvent(t *testing.T) {
	h := newHarness(t)
	ev := h.createEvent(&lighteventv1.Event{Name: "yoga", Dates: []*lighteventv1.EventDate{
		{Value: at(day)}, {Value: at(2 * day)}, {Value: at(3 * day)},
	}})
	m := h.createMember("a@example.com")

	// Date 0 has an active single-date registration, date 1 only a cancelled one.
	_, err := h.register(m, "yoga", &ev.Dates[0].Uid)
	require.NoError(t, err)
	reg, err := h.register(m, "yoga", &ev.Dates[1].Uid)
	require.NoError(t, err)
	_, err = h.s.DeleteRegistration(adminCtx(), connect.NewRequest(&lighteventv1.DeleteRegistrationRequest{ConfCode: reg.ConfCode}))
	require.NoError(t, err)

	update := func(dates []*lighteventv1.EventDate) (*lighteventv1.Event, error) {
		resp, err := h.s.UpdateEvent(adminCtx(), connect.NewRequest(&lighteventv1.UpdateEventRequest{Event: &lighteventv1.Event{
			Name: "yoga", Title: "Yoga 2", Description: "New", Hidden: true, Closed: true, Capacity: 3, Dates: dates,
		}}))
		if err != nil {
			return nil, err
		}
		return resp.Msg.Event, nil
	}

	// Removing a date with an active registration is rejected and nothing changes.
	_, err = update([]*lighteventv1.EventDate{{Uid: ev.Dates[1].Uid, Value: ev.Dates[1].Value}})
	assertCode(t, err, connect.CodeFailedPrecondition)
	got, err := h.s.GetEvent(adminCtx(), connect.NewRequest(&lighteventv1.GetEventRequest{Name: "yoga"}))
	require.NoError(t, err)
	assert.Equal(t, "yoga", got.Msg.Event.Title, "transaction rolled back")
	assert.Len(t, got.Msg.Event.Dates, 3)

	// Keep date 0, move date 0's neighbour, drop dates 1 (cancelled registration only) and 2, add a new date
	// reusing date 2's value.
	updated, err := update([]*lighteventv1.EventDate{
		{Uid: ev.Dates[0].Uid, Value: at(day + 1800e9)},
		{Value: at(3 * day)},
	})
	require.NoError(t, err)
	assert.Equal(t, "Yoga 2", updated.Title)
	assert.True(t, updated.Hidden)
	assert.True(t, updated.Closed)
	assert.Equal(t, int32(3), updated.Capacity)
	require.Len(t, updated.Dates, 2)
	assert.Equal(t, ev.Dates[0].Uid, updated.Dates[0].Uid)
	assert.Equal(t, at(day+1800e9), updated.Dates[0].Value)
	assert.Equal(t, int32(1), updated.Dates[0].RegistrationCount)
	assert.NotEqual(t, ev.Dates[2].Uid, updated.Dates[1].Uid)

	// A date uid from another event is rejected.
	other := h.createEvent(&lighteventv1.Event{Name: "other"})
	_, err = update([]*lighteventv1.EventDate{{Uid: other.Dates[0].Uid, Value: other.Dates[0].Value}})
	assertCode(t, err, connect.CodeInvalidArgument)

	_, err = h.s.UpdateEvent(adminCtx(), connect.NewRequest(&lighteventv1.UpdateEventRequest{Event: &lighteventv1.Event{
		Name: "missing", Title: "x", Dates: []*lighteventv1.EventDate{{Value: at(day)}},
	}}))
	assertCode(t, err, connect.CodeNotFound)
}

func TestUpdateEventPreservesCancellation(t *testing.T) {
	h := newHarness(t)
	ev := h.createEvent(&lighteventv1.Event{Name: "yoga"})
	_, err := h.s.CancelEventDate(adminCtx(), connect.NewRequest(&lighteventv1.CancelEventDateRequest{EventDateUid: ev.Dates[0].Uid}))
	require.NoError(t, err)
	ev.Dates[0].Cancelled = false
	resp, err := h.s.UpdateEvent(adminCtx(), connect.NewRequest(&lighteventv1.UpdateEventRequest{Event: ev}))
	require.NoError(t, err)
	assert.True(t, resp.Msg.Event.Dates[0].Cancelled, "cancellation cannot be undone through UpdateEvent")
}

func TestArchiveAndDeleteEvent(t *testing.T) {
	h := newHarness(t)
	h.createEvent(&lighteventv1.Event{Name: "empty"})
	ev := h.createEvent(&lighteventv1.Event{Name: "used"})
	m := h.createMember("a@example.com")
	reg, err := h.register(m, "used", &ev.Dates[0].Uid)
	require.NoError(t, err)
	_, err = h.s.DeleteRegistration(adminCtx(), connect.NewRequest(&lighteventv1.DeleteRegistrationRequest{ConfCode: reg.ConfCode}))
	require.NoError(t, err)

	_, err = h.s.DeleteEvent(adminCtx(), connect.NewRequest(&lighteventv1.DeleteEventRequest{Name: "used"}))
	assertCode(t, err, connect.CodeFailedPrecondition)

	_, err = h.s.DeleteEvent(adminCtx(), connect.NewRequest(&lighteventv1.DeleteEventRequest{Name: "empty"}))
	require.NoError(t, err)
	_, err = h.s.GetEvent(adminCtx(), connect.NewRequest(&lighteventv1.GetEventRequest{Name: "empty"}))
	assertCode(t, err, connect.CodeNotFound)

	resp, err := h.s.SetEventArchived(adminCtx(), connect.NewRequest(&lighteventv1.SetEventArchivedRequest{Name: "used", Archived: true}))
	require.NoError(t, err)
	assert.True(t, resp.Msg.Event.Archived)
	resp, err = h.s.SetEventArchived(adminCtx(), connect.NewRequest(&lighteventv1.SetEventArchivedRequest{Name: "used", Archived: false}))
	require.NoError(t, err)
	assert.False(t, resp.Msg.Event.Archived)

	_, err = h.s.SetEventArchived(adminCtx(), connect.NewRequest(&lighteventv1.SetEventArchivedRequest{Name: "nope"}))
	assertCode(t, err, connect.CodeNotFound)
}

func TestCancelEventDate(t *testing.T) {
	h := newHarness(t)
	ev := h.createEvent(&lighteventv1.Event{Name: "yoga"})
	for i := 0; i < 2; i++ {
		resp, err := h.s.CancelEventDate(adminCtx(), connect.NewRequest(&lighteventv1.CancelEventDateRequest{EventDateUid: ev.Dates[0].Uid}))
		require.NoError(t, err)
		assert.True(t, resp.Msg.EventDate.Cancelled)
	}
	_, err := h.s.CancelEventDate(adminCtx(), connect.NewRequest(&lighteventv1.CancelEventDateRequest{EventDateUid: "missing"}))
	assertCode(t, err, connect.CodeNotFound)
}

func TestListUpcomingEventDates(t *testing.T) {
	h := newHarness(t)
	yoga := h.createEvent(&lighteventv1.Event{Name: "yoga", Dates: []*lighteventv1.EventDate{{Value: at(day)}, {Value: at(3 * day)}, {Value: at(-day)}}})
	h.createEvent(&lighteventv1.Event{Name: "run", Dates: []*lighteventv1.EventDate{{Value: at(2 * day)}}})
	h.createEvent(&lighteventv1.Event{Name: "old"})
	_, err := h.s.SetEventArchived(adminCtx(), connect.NewRequest(&lighteventv1.SetEventArchivedRequest{Name: "old", Archived: true}))
	require.NoError(t, err)

	a, b := h.createMember("a@example.com"), h.createMember("b@example.com")
	_, err = h.register(a, "yoga", nil)
	require.NoError(t, err)
	_, err = h.register(b, "yoga", &yoga.Dates[2].Uid) // dates are sorted: -1d, 1d, 3d
	require.NoError(t, err)

	resp, err := h.s.ListUpcomingEventDates(adminCtx(), connect.NewRequest(&lighteventv1.ListUpcomingEventDatesRequest{}))
	require.NoError(t, err)
	got := resp.Msg.EventDates
	require.Len(t, got, 3)
	assert.Equal(t, "yoga", got[0].Event.Name)
	assert.Equal(t, int32(0), got[0].OnceCount)
	assert.Equal(t, int32(1), got[0].SeriesCount)
	assert.Equal(t, "run", got[1].Event.Name)
	assert.Equal(t, int32(0), got[1].SeriesCount)
	assert.Equal(t, int32(1), got[2].OnceCount)
	assert.Equal(t, int32(2), got[2].EventDate.RegistrationCount)

	resp, err = h.s.ListUpcomingEventDates(adminCtx(), connect.NewRequest(&lighteventv1.ListUpcomingEventDatesRequest{Limit: 1}))
	require.NoError(t, err)
	assert.Len(t, resp.Msg.EventDates, 1)
}

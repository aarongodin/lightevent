package server

import (
	"context"
	"testing"

	"connectrpc.com/connect"
	lighteventv1 "github.com/aarongodin/lightevent/internal/gen/lightevent/v1"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func (h *harness) createTag(name, label string) *lighteventv1.Tag {
	h.t.Helper()
	resp, err := h.s.CreateTag(adminCtx(), connect.NewRequest(&lighteventv1.CreateTagRequest{Tag: &lighteventv1.Tag{Name: name, Label: label}}))
	require.NoError(h.t, err)
	return resp.Msg.Tag
}

func (h *harness) listEvents(ctx context.Context, tags ...string) []string {
	h.t.Helper()
	resp, err := h.s.ListEvents(ctx, connect.NewRequest(&lighteventv1.ListEventsRequest{Tags: tags}))
	require.NoError(h.t, err)
	names := []string{}
	for _, e := range resp.Msg.Events {
		names = append(names, e.Name)
	}
	assert.Equal(h.t, int32(len(names)), resp.Msg.Total)
	return names
}

func TestTagLifecycle(t *testing.T) {
	h := newHarness(t)
	tag := h.createTag(" Vinyasa ", "Vinyasa Yoga")
	assert.Equal(t, "vinyasa", tag.Name)
	assert.Equal(t, "Vinyasa Yoga", tag.Label)

	_, err := h.s.CreateTag(adminCtx(), connect.NewRequest(&lighteventv1.CreateTagRequest{Tag: &lighteventv1.Tag{Name: "vinyasa", Label: "Again"}}))
	assertCode(t, err, connect.CodeAlreadyExists)
	_, err = h.s.CreateTag(adminCtx(), connect.NewRequest(&lighteventv1.CreateTagRequest{Tag: &lighteventv1.Tag{Name: "bad name", Label: "x"}}))
	assertCode(t, err, connect.CodeInvalidArgument)
	_, err = h.s.CreateTag(adminCtx(), connect.NewRequest(&lighteventv1.CreateTagRequest{Tag: &lighteventv1.Tag{Name: "ok"}}))
	assertCode(t, err, connect.CodeInvalidArgument)

	updated, err := h.s.UpdateTag(adminCtx(), connect.NewRequest(&lighteventv1.UpdateTagRequest{Tag: &lighteventv1.Tag{Name: "vinyasa", Label: "Vinyasa Flow"}}))
	require.NoError(t, err)
	assert.Equal(t, "Vinyasa Flow", updated.Msg.Tag.Label)
	_, err = h.s.UpdateTag(adminCtx(), connect.NewRequest(&lighteventv1.UpdateTagRequest{Tag: &lighteventv1.Tag{Name: "missing", Label: "x"}}))
	assertCode(t, err, connect.CodeNotFound)

	h.createEvent(&lighteventv1.Event{Name: "flow", Tags: []string{"vinyasa"}})
	list, err := h.s.ListTags(adminCtx(), connect.NewRequest(&lighteventv1.ListTagsRequest{}))
	require.NoError(t, err)
	require.Len(t, list.Msg.Tags, 1)
	assert.Equal(t, int32(1), list.Msg.Tags[0].EventCount)

	// Deleting a tag removes it from events.
	_, err = h.s.DeleteTag(adminCtx(), connect.NewRequest(&lighteventv1.DeleteTagRequest{Name: "vinyasa"}))
	require.NoError(t, err)
	event, err := h.s.GetEvent(adminCtx(), connect.NewRequest(&lighteventv1.GetEventRequest{Name: "flow"}))
	require.NoError(t, err)
	assert.Empty(t, event.Msg.Event.Tags)
	_, err = h.s.DeleteTag(adminCtx(), connect.NewRequest(&lighteventv1.DeleteTagRequest{Name: "vinyasa"}))
	assertCode(t, err, connect.CodeNotFound)
}

func TestEventTags(t *testing.T) {
	h := newHarness(t)
	h.createTag("yoga", "Yoga")
	h.createTag("beginner", "Beginner")
	h.createTag("unused", "Unused")

	e := h.createEvent(&lighteventv1.Event{Name: "flow", Tags: []string{"yoga", "Beginner", "yoga"}})
	assert.Equal(t, []string{"beginner", "yoga"}, e.Tags)
	h.createEvent(&lighteventv1.Event{Name: "hiit", Tags: []string{"beginner"}})
	h.createEvent(&lighteventv1.Event{Name: "plain"})
	h.createEvent(&lighteventv1.Event{Name: "secret", Hidden: true, Tags: []string{"unused"}})

	_, err := h.s.CreateEvent(adminCtx(), connect.NewRequest(&lighteventv1.CreateEventRequest{Event: &lighteventv1.Event{
		Name: "x", Title: "x", Dates: []*lighteventv1.EventDate{{Value: at(day)}}, Tags: []string{"missing"},
	}}))
	assertCode(t, err, connect.CodeInvalidArgument)

	// Updating replaces the tags.
	e.Tags = []string{"yoga"}
	updated, err := h.s.UpdateEvent(adminCtx(), connect.NewRequest(&lighteventv1.UpdateEventRequest{Event: e}))
	require.NoError(t, err)
	assert.Equal(t, []string{"yoga"}, updated.Msg.Event.Tags)

	// Events can be filtered by tags, for administrators and the public.
	assert.ElementsMatch(t, []string{"flow", "hiit", "plain"}, h.listEvents(anonCtx()))
	assert.Equal(t, []string{"flow"}, h.listEvents(anonCtx(), "yoga"))
	assert.ElementsMatch(t, []string{"flow", "hiit"}, h.listEvents(anonCtx(), "yoga", "beginner"))
	assert.Empty(t, h.listEvents(anonCtx(), "unused"))
	assert.Equal(t, []string{"secret"}, h.listEvents(adminCtx(), "unused"))
	_, err = h.s.ListEvents(anonCtx(), connect.NewRequest(&lighteventv1.ListEventsRequest{Tags: []string{"not valid"}}))
	assertCode(t, err, connect.CodeInvalidArgument)

	// The public only sees tags of visible events.
	list, err := h.s.ListTags(anonCtx(), connect.NewRequest(&lighteventv1.ListTagsRequest{}))
	require.NoError(t, err)
	names := []string{}
	for _, tag := range list.Msg.Tags {
		names = append(names, tag.Name)
		assert.Zero(t, tag.EventCount)
	}
	assert.Equal(t, []string{"beginner", "yoga"}, names)
}

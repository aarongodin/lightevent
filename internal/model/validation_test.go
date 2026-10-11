package model

import (
	"strings"
	"testing"
	"time"

	lighteventv1 "github.com/aarongodin/lightevent/internal/gen/lightevent/v1"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestEventName(t *testing.T) {
	for in, want := range map[string]string{
		"yoga":         "yoga",
		" Yoga-Class ": "yoga-class",
		"spring_2027":  "spring_2027",
		"a1-b2_c3":     "a1-b2_c3",
	} {
		got, err := EventName("name", in)
		require.NoError(t, err, in)
		assert.Equal(t, want, got)
	}
	for _, in := range []string{"", "  ", "-yoga", "yoga-", "yo--ga", "yo ga", "yoga/1", "über", strings.Repeat("a", 65)} {
		_, err := EventName("name", in)
		assert.Error(t, err, in)
	}
}

func TestTitle(t *testing.T) {
	v, err := Title("title", "  Hello ")
	require.NoError(t, err)
	assert.Equal(t, "Hello", v)
	_, err = Title("title", "")
	assert.ErrorContains(t, err, "blank")
	_, err = Title("title", strings.Repeat("é", 101))
	assert.ErrorContains(t, err, "at most 100")
	_, err = Title("title", "a\nb")
	assert.ErrorContains(t, err, "single line")
	_, err = Title("title", strings.Repeat("é", 100))
	assert.NoError(t, err)
}

func TestDescription(t *testing.T) {
	v, err := Description("d", "  multi\nline  ")
	require.NoError(t, err)
	assert.Equal(t, "multi\nline", v)
	_, err = Description("d", strings.Repeat("a", MaxDescriptionLength+1))
	assert.Error(t, err)
}

func TestCapacity(t *testing.T) {
	v, err := Capacity("c", 0)
	require.NoError(t, err)
	assert.Equal(t, int64(0), v)
	_, err = Capacity("c", -1)
	assert.Error(t, err)
	_, err = Capacity("c", MaxCapacity+1)
	assert.Error(t, err)
}

func TestEmail(t *testing.T) {
	v, err := Email("email", "  Person@Example.COM ")
	require.NoError(t, err)
	assert.Equal(t, "person@example.com", v)
	for _, in := range []string{"", "nope", "a@b", "Name <a@b.com>", "a@b.com, c@d.com", strings.Repeat("a", 250) + "@b.com"} {
		_, err := Email("email", in)
		assert.Error(t, err, in)
	}
	v, err = OptionalEmail("email", " ")
	require.NoError(t, err)
	assert.Equal(t, "", v)
}

func TestPersonName(t *testing.T) {
	v, err := PersonName("n", "  Zoë ")
	require.NoError(t, err)
	assert.Equal(t, "Zoë", v)
	_, err = PersonName("n", "a\x00b")
	assert.Error(t, err)
	_, err = PersonName("n", strings.Repeat("a", 101))
	assert.Error(t, err)
}

func TestUsernameAndPassword(t *testing.T) {
	_, err := Username("u", "jo")
	assert.Error(t, err)
	v, err := Username("u", " jane.doe ")
	require.NoError(t, err)
	assert.Equal(t, "jane.doe", v)

	_, err = Password("p", "short")
	assert.ErrorContains(t, err, "at least 12")
	_, err = Password("p", strings.Repeat("a", 73))
	assert.ErrorContains(t, err, "72 bytes")
	_, err = Password("p", "correct horse battery")
	assert.NoError(t, err)
}

func TestTimezoneAndTimestamp(t *testing.T) {
	v, err := Timezone("tz", "America/Chicago")
	require.NoError(t, err)
	assert.Equal(t, "America/Chicago", v)
	_, err = Timezone("tz", "Mars/Olympus")
	assert.Error(t, err)
	v, err = Timezone("tz", "")
	require.NoError(t, err)
	assert.Equal(t, "", v)

	ts, err := Timestamp("v", "2027-01-01T12:00:00.9-06:00")
	require.NoError(t, err)
	assert.Equal(t, time.Date(2027, 1, 1, 18, 0, 0, 0, time.UTC), ts)
	assert.Equal(t, time.UTC, ts.Location())
	_, err = Timestamp("v", "tomorrow")
	assert.Error(t, err)
}

func TestAPIKeyNameAndRequired(t *testing.T) {
	_, err := APIKeyName("n", " ")
	assert.Error(t, err)
	v, err := APIKeyName("n", " zapier ")
	require.NoError(t, err)
	assert.Equal(t, "zapier", v)
	_, err = Required("uid", "")
	assert.ErrorContains(t, err, "required")
}

func TestErrValidationFailed(t *testing.T) {
	err := ErrValidationFailed{Field: "a", Reason: "b"}
	assert.Equal(t, "a: b", err.Error())
}

func TestEvent(t *testing.T) {
	valid := func() *lighteventv1.Event {
		return &lighteventv1.Event{
			Name:     "Yoga",
			Title:    "Yoga",
			Capacity: 10,
			Dates: []*lighteventv1.EventDate{
				{Value: "2027-01-01T18:00:00Z"},
				{Uid: "u1", Value: "2027-01-08T18:00:00Z"},
			},
		}
	}

	in, err := Event(valid())
	require.NoError(t, err)
	assert.Equal(t, "yoga", in.Name)
	assert.Equal(t, int64(10), in.Capacity)
	require.Len(t, in.Dates, 2)
	assert.Equal(t, "", in.Dates[0].UID)
	assert.Equal(t, "u1", in.Dates[1].UID)

	tests := map[string]func(e *lighteventv1.Event){
		"nil dates":       func(e *lighteventv1.Event) { e.Dates = nil },
		"duplicate value": func(e *lighteventv1.Event) { e.Dates[1].Value = e.Dates[0].Value },
		"duplicate uid": func(e *lighteventv1.Event) {
			e.Dates[0].Uid = "u1"
		},
		"bad value":    func(e *lighteventv1.Event) { e.Dates[0].Value = "x" },
		"nil date":     func(e *lighteventv1.Event) { e.Dates[0] = nil },
		"bad name":     func(e *lighteventv1.Event) { e.Name = "a b" },
		"bad title":    func(e *lighteventv1.Event) { e.Title = "" },
		"bad capacity": func(e *lighteventv1.Event) { e.Capacity = -5 },
		"too many dates": func(e *lighteventv1.Event) {
			e.Dates = nil
			base := time.Date(2027, 1, 1, 0, 0, 0, 0, time.UTC)
			for i := 0; i <= MaxEventDates; i++ {
				e.Dates = append(e.Dates, &lighteventv1.EventDate{Value: base.Add(time.Duration(i) * time.Hour).Format(time.RFC3339)})
			}
		},
	}
	for name, mutate := range tests {
		t.Run(name, func(t *testing.T) {
			e := valid()
			mutate(e)
			_, err := Event(e)
			var verr ErrValidationFailed
			assert.ErrorAs(t, err, &verr)
		})
	}

	_, err = Event(nil)
	assert.Error(t, err)
}

func TestOrigin(t *testing.T) {
	for in, want := range map[string]string{
		"https://www.example.com":       "https://www.example.com",
		" https://WWW.Example.com/ ":    "https://www.example.com",
		"https://example.com:443":       "https://example.com",
		"http://example.com:80":         "http://example.com",
		"http://localhost:5600":         "http://localhost:5600",
		"http://[::1]:8080":             "http://[::1]:8080",
		"https://example.com:8443/":     "https://example.com:8443",
		"https://xn--bcher-kva.example": "https://xn--bcher-kva.example",
	} {
		got, err := Origin("origin", in)
		require.NoError(t, err, in)
		assert.Equal(t, want, got, in)
	}
	for _, in := range []string{"", "example.com", "ftp://example.com", "https://example.com/path", "https://example.com?q=1",
		"https://user@example.com", "https://", "javascript:alert(1)", "https://example.com#x"} {
		_, err := Origin("origin", in)
		assert.Error(t, err, in)
	}
}

func TestTagLabel(t *testing.T) {
	v, err := TagLabel("label", "  Vinyasa Yoga ")
	require.NoError(t, err)
	assert.Equal(t, "Vinyasa Yoga", v)
	_, err = TagLabel("label", "")
	assert.Error(t, err)
	_, err = TagLabel("label", strings.Repeat("a", MaxTagLabelLength+1))
	assert.Error(t, err)
}

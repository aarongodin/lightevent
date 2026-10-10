package notifications

import (
	"context"
	"testing"
	"time"

	"github.com/aarongodin/lightevent/internal/provider/email"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func newTest(t *testing.T) (*Notifier, *email.LogSender) {
	sender := &email.LogSender{}
	n, err := New(sender)
	require.NoError(t, err)
	return n, sender
}

func TestSendVerificationCode(t *testing.T) {
	n, sender := newTest(t)
	err := n.SendVerificationCode(context.Background(), Branding{OrganizationName: "Yoga Co", SupportEmail: "help@yoga.co"},
		"m@example.com", "ABCD2345", 15*time.Minute)
	require.NoError(t, err)
	msgs := sender.Messages()
	require.Len(t, msgs, 1)
	assert.Equal(t, "m@example.com", msgs[0].To)
	assert.Equal(t, "Your Yoga Co verification code", msgs[0].Subject)
	assert.Contains(t, msgs[0].Text, "ABCD-2345")
	assert.Contains(t, msgs[0].Text, "15 minutes")
	assert.Contains(t, msgs[0].HTML, "ABCD-2345")
	assert.Contains(t, msgs[0].HTML, "mailto:help@yoga.co")
}

func TestVerificationErrorsPropagate(t *testing.T) {
	n, err := New(email.DisabledSender{})
	require.NoError(t, err)
	err = n.SendVerificationCode(context.Background(), Branding{}, "m@example.com", "ABCD2345", time.Minute)
	assert.ErrorIs(t, err, email.ErrDisabled)
}

func TestRegistrationEmailsAreAsyncAndEscaped(t *testing.T) {
	n, sender := newTest(t)
	chicago, err := time.LoadLocation("America/Chicago")
	require.NoError(t, err)
	date := time.Date(2027, 1, 1, 18, 0, 0, 0, time.UTC)
	b := Branding{OrganizationName: "Org", Location: chicago}

	n.RegistrationConfirmed(b, Registration{To: "m@example.com", Name: "<b>Sam</b>", EventTitle: "Yoga", ConfCode: "ABCD2345", Date: &date})
	n.RegistrationCancelled(b, Registration{To: "m@example.com", EventTitle: "Series", ConfCode: "WXYZ6789"})
	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()
	n.Wait(ctx)

	msgs := sender.Messages()
	require.Len(t, msgs, 2)
	var confirmed, cancelled email.Message
	for _, m := range msgs {
		if m.Subject == "Registration confirmed: Yoga" {
			confirmed = m
		} else {
			cancelled = m
		}
	}
	assert.Contains(t, confirmed.Text, "Friday, January 1, 2027 at 12:00 PM CST")
	assert.Contains(t, confirmed.HTML, "&lt;b&gt;Sam&lt;/b&gt;", "html is escaped")
	assert.Contains(t, confirmed.Text, "ABCD-2345")
	assert.Equal(t, "Registration cancelled: Series", cancelled.Subject)
	assert.Contains(t, cancelled.Text, "All dates of this event")
	assert.Contains(t, cancelled.Text, "Hello,")
}

func TestFormatHelpers(t *testing.T) {
	assert.Equal(t, "ABCD-EFGH", FormatCode("ABCDEFGH"))
	assert.Equal(t, "ABC", FormatCode("ABC"))
	assert.Equal(t, "1 minute", formatDuration(time.Minute))
	assert.Equal(t, "15 minutes", formatDuration(15*time.Minute))
	assert.Equal(t, "1 hour", formatDuration(time.Hour))
	assert.Equal(t, "2 hours", formatDuration(2*time.Hour))
	assert.Equal(t, "90 minutes", formatDuration(90*time.Minute))
	assert.Equal(t, "LightEvent", Branding{}.org())
}

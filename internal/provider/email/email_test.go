package email

import (
	"bytes"
	"context"
	"testing"

	"github.com/aarongodin/lightevent/internal/config"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestNewSelectsProvider(t *testing.T) {
	assert.IsType(t, DisabledSender{}, New(&config.RuntimeConfig{}))
	assert.IsType(t, &LogSender{}, New(&config.RuntimeConfig{EmailProvider: "log"}))
	assert.IsType(t, &SMTP{}, New(&config.RuntimeConfig{
		EmailProvider: "smtp", EmailSMTPHost: "localhost", EmailSMTPPort: 587, EmailSMTPSender: "a@example.com",
	}))
}

func TestDisabledSender(t *testing.T) {
	assert.ErrorIs(t, DisabledSender{}.Send(context.Background(), Message{}), ErrDisabled)
}

func TestLogSenderRecords(t *testing.T) {
	s := &LogSender{}
	require.NoError(t, s.Send(context.Background(), Message{To: "a@example.com", Subject: "Hi"}))
	msgs := s.Messages()
	require.Len(t, msgs, 1)
	assert.Equal(t, "Hi", msgs[0].Subject)
}

func TestBuildMessage(t *testing.T) {
	m, err := buildMessage("LightEvent <noreply@example.com>", Message{
		To: "member@example.com", Subject: "Your code", Text: "Code: 1234", HTML: "<p>Code: 1234</p>",
	})
	require.NoError(t, err)
	var buf bytes.Buffer
	_, err = m.WriteTo(&buf)
	require.NoError(t, err)
	out := buf.String()
	assert.Contains(t, out, "Subject: Your code")
	assert.Contains(t, out, "To: <member@example.com>")
	assert.Contains(t, out, "text/plain")
	assert.Contains(t, out, "text/html")

	_, err = buildMessage("not an address", Message{To: "member@example.com"})
	assert.Error(t, err)
	_, err = buildMessage("noreply@example.com", Message{To: "bad"})
	assert.Error(t, err)
}

func TestSMTPOptions(t *testing.T) {
	for _, tlsMode := range []string{"starttls", "tls", "none"} {
		s := NewSMTP(&config.RuntimeConfig{EmailSMTPHost: "h", EmailSMTPPort: 25, EmailSMTPTLS: tlsMode, EmailSMTPUsername: "u"})
		assert.NotEmpty(t, s.options)
	}
}

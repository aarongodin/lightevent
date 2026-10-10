// Package email sends email through a configured provider.
package email

import (
	"context"
	"errors"
	"sync"

	"github.com/aarongodin/lightevent/internal/config"
	"github.com/rs/zerolog/log"
)

// ErrDisabled is returned when no email provider is configured.
var ErrDisabled = errors.New("email provider is not configured")

// Message is a single email to one recipient.
type Message struct {
	To      string
	Subject string
	Text    string
	HTML    string
}

// Sender delivers email messages.
type Sender interface {
	Send(ctx context.Context, msg Message) error
}

// New returns the Sender selected by the runtime config.
func New(rc *config.RuntimeConfig) Sender {
	switch rc.EmailProvider {
	case "smtp":
		log.Info().Str("provider", "smtp").Str("host", rc.EmailSMTPHost).Msg("email provider selected")
		return NewSMTP(rc)
	case "log":
		log.Warn().Msg("email provider \"log\" writes emails (including verification codes) to the log; use only for development")
		return &LogSender{}
	default:
		log.Warn().Msg("email provider not set; member verification and notification emails are disabled. Set EMAIL_PROVIDER.")
		return DisabledSender{}
	}
}

// DisabledSender fails every send with ErrDisabled.
type DisabledSender struct{}

func (DisabledSender) Send(context.Context, Message) error { return ErrDisabled }

// LogSender writes messages to the log instead of sending them. It also records them for tests.
type LogSender struct {
	mu   sync.Mutex
	Sent []Message
}

func (s *LogSender) Send(_ context.Context, msg Message) error {
	s.mu.Lock()
	s.Sent = append(s.Sent, msg)
	s.mu.Unlock()
	log.Info().Str("to", msg.To).Str("subject", msg.Subject).Str("text", msg.Text).Msg("email (log provider)")
	return nil
}

// Messages returns a copy of the recorded messages.
func (s *LogSender) Messages() []Message {
	s.mu.Lock()
	defer s.mu.Unlock()
	return append([]Message(nil), s.Sent...)
}

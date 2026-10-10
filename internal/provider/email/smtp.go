package email

import (
	"context"
	"fmt"
	"time"

	"github.com/aarongodin/lightevent/internal/config"
	"github.com/wneessen/go-mail"
)

// SMTP sends email through an SMTP server.
type SMTP struct {
	host    string
	sender  string
	options []mail.Option
}

// NewSMTP builds an SMTP sender from the runtime config.
func NewSMTP(rc *config.RuntimeConfig) *SMTP {
	opts := []mail.Option{
		mail.WithPort(rc.EmailSMTPPort),
		mail.WithTimeout(15 * time.Second),
	}
	switch rc.EmailSMTPTLS {
	case "tls":
		opts = append(opts, mail.WithSSL())
	case "none":
		opts = append(opts, mail.WithTLSPolicy(mail.NoTLS))
	default:
		opts = append(opts, mail.WithTLSPolicy(mail.TLSMandatory))
	}
	if rc.EmailSMTPUsername != "" {
		opts = append(opts,
			mail.WithSMTPAuth(mail.SMTPAuthAutoDiscover),
			mail.WithUsername(rc.EmailSMTPUsername),
			mail.WithPassword(rc.EmailSMTPPassword),
		)
	}
	return &SMTP{host: rc.EmailSMTPHost, sender: rc.EmailSMTPSender, options: opts}
}

// buildMessage converts a Message into a MIME message with text and optional HTML parts.
func buildMessage(sender string, msg Message) (*mail.Msg, error) {
	m := mail.NewMsg()
	if err := m.From(sender); err != nil {
		return nil, fmt.Errorf("invalid sender: %w", err)
	}
	if err := m.To(msg.To); err != nil {
		return nil, fmt.Errorf("invalid recipient: %w", err)
	}
	m.Subject(msg.Subject)
	m.SetDate()
	m.SetMessageID()
	m.SetBodyString(mail.TypeTextPlain, msg.Text)
	if msg.HTML != "" {
		m.AddAlternativeString(mail.TypeTextHTML, msg.HTML)
	}
	return m, nil
}

func (s *SMTP) Send(ctx context.Context, msg Message) error {
	m, err := buildMessage(s.sender, msg)
	if err != nil {
		return err
	}
	client, err := mail.NewClient(s.host, s.options...)
	if err != nil {
		return fmt.Errorf("error creating smtp client: %w", err)
	}
	if err := client.DialAndSendWithContext(ctx, m); err != nil {
		return fmt.Errorf("error sending smtp email: %w", err)
	}
	return nil
}

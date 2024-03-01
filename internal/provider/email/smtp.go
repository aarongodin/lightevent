package email

import (
	"fmt"

	"github.com/aarongodin/lightevent/internal/config"
	"gopkg.in/gomail.v2"
)

type EmailProviderSMTP struct {
	dialer *gomail.Dialer
	sender string
}

func NewEmailProviderSMTP(rc *config.RuntimeConfig) EmailProviderSMTP {
	return EmailProviderSMTP{
		dialer: gomail.NewDialer(rc.EmailSMTPHost, rc.EmailSMTPPort, rc.EmailSMTPUsername, rc.EmailSMTPPassword),
		sender: rc.EmailSMTPUsername,
	}
}

func (p EmailProviderSMTP) Send(recipient string, subject string, body string) error {
	m := gomail.NewMessage()
	m.SetHeader("From", p.sender)
	m.SetHeader("To", recipient)
	m.SetHeader("Subject", subject)
	m.SetBody("text/html", body)
	if err := p.dialer.DialAndSend(m); err != nil {
		return fmt.Errorf("error sending smtp email: %w", err)
	}
	return nil
}

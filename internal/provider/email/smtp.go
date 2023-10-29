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
	p := EmailProviderSMTP{
		dialer: gomail.NewDialer(rc.EmailSMTPHost, rc.EmailSMTPPort, rc.EmailSMTPUsername, rc.EmailSMTPPassword),
		sender: rc.EmailSMTPSender,
	}
	if p.sender == "" {
		p.sender = rc.EmailSMTPUsername
	}
	return p
}

func (p EmailProviderSMTP) Send(recipient string, subject string, body EmailBody) error {
	m := gomail.NewMessage()
	m.SetHeader("From", p.sender)
	m.SetHeader("To", recipient)
	m.SetHeader("Subject", subject)
	content, err := body.Render()
	if err != nil {
		return fmt.Errorf("error rendering email send request: %w", err)
	}
	m.SetBody("text/html", content)
	if err := p.dialer.DialAndSend(m); err != nil {
		return fmt.Errorf("error sending smtp email: %w", err)
	}
	return nil
}

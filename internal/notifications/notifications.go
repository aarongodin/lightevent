// Package notifications renders and sends emails to members.
package notifications

import (
	"bytes"
	"context"
	"embed"
	"fmt"
	htmltemplate "html/template"
	"sync"
	texttemplate "text/template"
	"time"

	"github.com/aarongodin/lightevent/internal/provider/email"
	"github.com/rs/zerolog/log"
)

//go:embed templates/*.tmpl
var templateFS embed.FS

// Branding holds organization settings used in every email.
type Branding struct {
	OrganizationName string
	SupportEmail     string
	// Location is used to format dates. Nil means UTC.
	Location *time.Location
}

func (b Branding) org() string {
	if b.OrganizationName == "" {
		return "LightEvent"
	}
	return b.OrganizationName
}

func (b Branding) loc() *time.Location {
	if b.Location == nil {
		return time.UTC
	}
	return b.Location
}

// Registration describes a registration for confirmation and cancellation emails.
type Registration struct {
	To         string
	Name       string
	EventTitle string
	ConfCode   string
	// Date is the date of a single-date registration; nil for series registrations.
	Date *time.Time
}

type templates struct {
	text *texttemplate.Template
	html *htmltemplate.Template
}

// Notifier sends emails. Notifications other than verification codes are sent in the background so they
// never block or fail the request that triggered them.
type Notifier struct {
	sender    email.Sender
	templates map[string]templates
	wg        sync.WaitGroup
	timeout   time.Duration
}

// New parses the email templates and returns a Notifier.
func New(sender email.Sender) (*Notifier, error) {
	n := &Notifier{sender: sender, templates: map[string]templates{}, timeout: 30 * time.Second}
	for _, name := range []string{"verification", "registration_confirmed", "registration_cancelled"} {
		text, err := texttemplate.ParseFS(templateFS, "templates/"+name+".txt.tmpl")
		if err != nil {
			return nil, err
		}
		html, err := htmltemplate.ParseFS(templateFS, "templates/layout.html.tmpl", "templates/"+name+".html.tmpl")
		if err != nil {
			return nil, err
		}
		n.templates[name] = templates{text: text, html: html}
	}
	return n, nil
}

func (n *Notifier) render(name, to, subject string, data any) (email.Message, error) {
	t := n.templates[name]
	var text, html bytes.Buffer
	if err := t.text.Execute(&text, data); err != nil {
		return email.Message{}, fmt.Errorf("error rendering %s text: %w", name, err)
	}
	if err := t.html.ExecuteTemplate(&html, "layout", data); err != nil {
		return email.Message{}, fmt.Errorf("error rendering %s html: %w", name, err)
	}
	return email.Message{To: to, Subject: subject, Text: text.String(), HTML: html.String()}, nil
}

// SendVerificationCode synchronously emails a verification code; callers report failures to the client.
func (n *Notifier) SendVerificationCode(ctx context.Context, b Branding, to, code string, ttl time.Duration) error {
	msg, err := n.render("verification", to, fmt.Sprintf("Your %s verification code", b.org()), map[string]any{
		"Org":          b.org(),
		"SupportEmail": b.SupportEmail,
		"Code":         FormatCode(code),
		"ExpiresIn":    formatDuration(ttl),
	})
	if err != nil {
		return err
	}
	return n.sender.Send(ctx, msg)
}

// RegistrationConfirmed emails a registration confirmation in the background.
func (n *Notifier) RegistrationConfirmed(b Branding, r Registration) {
	n.sendAsync("registration_confirmed", r.To, "Registration confirmed: "+r.EventTitle, registrationData(b, r))
}

// RegistrationCancelled emails a cancellation notice in the background.
func (n *Notifier) RegistrationCancelled(b Branding, r Registration) {
	n.sendAsync("registration_cancelled", r.To, "Registration cancelled: "+r.EventTitle, registrationData(b, r))
}

func registrationData(b Branding, r Registration) map[string]any {
	when := "All dates of this event"
	if r.Date != nil {
		when = r.Date.In(b.loc()).Format("Monday, January 2, 2006 at 3:04 PM MST")
	}
	return map[string]any{
		"Org":          b.org(),
		"SupportEmail": b.SupportEmail,
		"Name":         r.Name,
		"EventTitle":   r.EventTitle,
		"ConfCode":     FormatCode(r.ConfCode),
		"When":         when,
	}
}

func (n *Notifier) sendAsync(name, to, subject string, data any) {
	msg, err := n.render(name, to, subject, data)
	if err != nil {
		log.Err(err).Str("template", name).Msg("error rendering email")
		return
	}
	n.wg.Add(1)
	go func() {
		defer n.wg.Done()
		ctx, cancel := context.WithTimeout(context.Background(), n.timeout)
		defer cancel()
		if err := n.sender.Send(ctx, msg); err != nil {
			log.Err(err).Str("template", name).Msg("error sending email")
		}
	}()
}

// Wait blocks until background emails are sent or ctx is done.
func (n *Notifier) Wait(ctx context.Context) {
	done := make(chan struct{})
	go func() {
		n.wg.Wait()
		close(done)
	}()
	select {
	case <-done:
	case <-ctx.Done():
	}
}

// FormatCode splits an 8 character code into two groups for readability (ABCD-EFGH).
func FormatCode(code string) string {
	if len(code) == 8 {
		return code[:4] + "-" + code[4:]
	}
	return code
}

func formatDuration(d time.Duration) string {
	if d >= time.Hour && d%time.Hour == 0 {
		h := int(d / time.Hour)
		if h == 1 {
			return "1 hour"
		}
		return fmt.Sprintf("%d hours", h)
	}
	m := int(d.Round(time.Minute) / time.Minute)
	if m == 1 {
		return "1 minute"
	}
	return fmt.Sprintf("%d minutes", m)
}

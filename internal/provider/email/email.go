package email

import (
	"github.com/aarongodin/lightevent/internal/config"
	"github.com/rs/zerolog/log"
)

type EmailProvider interface {
	Send(recipient string, subject string, body string) error
}

type nilEmailProvider struct{}

func (p nilEmailProvider) Send(_ string, _ string, _ string) error {
	log.Warn().Msg("send email: email provider not set")
	return nil
}

func EmailProviderFromConfig(rc *config.RuntimeConfig) EmailProvider {
	switch rc.EmailProvider {
	case "smtp":
		log.Info().Str("provider", rc.EmailProvider).Msg("email provider selected")
		return NewEmailProviderSMTP(rc)
	default:
		log.Warn().Msg("Email provider not set. Refer to the documentation for selecting and configuring an email provider.")
		return nilEmailProvider{}
	}
}

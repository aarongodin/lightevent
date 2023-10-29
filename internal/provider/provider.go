package provider

import (
	"github.com/aarongodin/lightevent/internal/config"
	"github.com/aarongodin/lightevent/internal/provider/email"
	"github.com/aarongodin/lightevent/internal/provider/payments"
)

type Providers struct {
	Email    email.EmailProvider
	Payments payments.PaymentsProvider
}

func New(rc *config.RuntimeConfig) (*Providers, error) {
	return &Providers{
		Email:    email.EmailProviderFromConfig(rc),
		Payments: payments.PaymentsProviderFromConfig(rc),
	}, nil
}

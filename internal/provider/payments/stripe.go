package payments

import "github.com/aarongodin/lightevent/internal/config"

type PaymentsProviderStripe struct {
	apiKey string
}

func NewPaymentsProviderStripe(rc *config.RuntimeConfig) PaymentsProviderStripe {
	return PaymentsProviderStripe{
		apiKey: rc.PaymentsStripeAPIKey,
	}
}

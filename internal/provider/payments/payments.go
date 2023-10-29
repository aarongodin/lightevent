package payments

import (
	"github.com/aarongodin/lightevent/internal/config"
	"github.com/rs/zerolog/log"
)

type PaymentsProvider interface {
}

type nilPaymentsProvider struct{}

func PaymentsProviderFromConfig(rc *config.RuntimeConfig) PaymentsProvider {
	switch rc.PaymentsProvider {
	case "stripe":
		return NewPaymentsProviderStripe(rc)
	default:
		log.Warn().Msg("Payments provider not set. Refer to the documentation for selecting and configuring a payments provider.")
		return nilPaymentsProvider{}
	}
}

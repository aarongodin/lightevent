package config

import (
	"github.com/caarlos0/env/v7"
	"github.com/rs/zerolog/log"
)

func NewRuntimeConfig() (*RuntimeConfig, error) {
	rc := RuntimeConfig{}
	if err := env.Parse(&rc); err != nil {
		log.Err(err).Msg("error parsing runtime config")
		return nil, err
	}
	return &rc, nil
}

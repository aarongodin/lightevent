package config

import (
	"github.com/caarlos0/env/v7"
)

// NewRuntimeConfig creates a new RuntimeConfig and parses env variables.
func NewRuntimeConfig() (*RuntimeConfig, error) {
	rc := RuntimeConfig{}
	if err := env.Parse(&rc); err != nil {
		return nil, err
	}
	return &rc, nil
}

package config

import (
	"github.com/asdine/storm/v3"
	"github.com/caarlos0/env/v7"
	"golang.org/x/exp/slog"
)

func NewRuntimeConfig() (*RuntimeConfig, error) {
	rc := RuntimeConfig{}
	if err := env.Parse(&rc); err != nil {
		slog.Error("error parsing runtime config from environment", err)
		return nil, err
	}
	return &rc, nil
}

func NewPersistentConfig(db *storm.DB) PersistentConfig {
	config := &persistentConfig{db: db}
	config.initData()
	return config
}

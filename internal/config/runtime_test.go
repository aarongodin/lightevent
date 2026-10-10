package config

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func validConfig() RuntimeConfig {
	return RuntimeConfig{
		Host:            "127.0.0.1",
		Port:            8080,
		LogFormat:       "json",
		DatabaseFile:    "test.sqlite3",
		SessionMaxAge:   time.Hour,
		VerificationTTL: 15 * time.Minute,
		EmailSMTPTLS:    "starttls",
	}
}

func TestNewRuntimeConfigDefaults(t *testing.T) {
	t.Setenv("BOOTSTRAP_USERNAME", "")
	t.Setenv("BOOTSTRAP_PASSWORD", "")
	t.Setenv("EMAIL_PROVIDER", "")
	rc, err := NewRuntimeConfig()
	require.NoError(t, err)
	assert.Equal(t, 8080, rc.Port)
	assert.True(t, rc.CookieSecure)
	assert.Equal(t, 168*time.Hour, rc.SessionMaxAge)
	assert.Equal(t, "0.0.0.0:8080", rc.ServerAddr())
}

func TestValidate(t *testing.T) {
	tests := []struct {
		name    string
		mutate  func(*RuntimeConfig)
		wantErr string
	}{
		{"valid", func(*RuntimeConfig) {}, ""},
		{"bad port", func(c *RuntimeConfig) { c.Port = 0 }, "PORT"},
		{"bad log format", func(c *RuntimeConfig) { c.LogFormat = "xml" }, "LOG_FORMAT"},
		{"missing db", func(c *RuntimeConfig) { c.DatabaseFile = "" }, "DATABASE_FILE"},
		{"short session", func(c *RuntimeConfig) { c.SessionMaxAge = time.Second }, "SESSION_MAX_AGE"},
		{"bootstrap username only", func(c *RuntimeConfig) { c.BootstrapUsername = "root" }, "must be set together"},
		{"bootstrap short password", func(c *RuntimeConfig) {
			c.BootstrapUsername = "root"
			c.BootstrapPassword = "short"
		}, "at least 12"},
		{"bootstrap ok", func(c *RuntimeConfig) {
			c.BootstrapUsername = "root"
			c.BootstrapPassword = "a-long-enough-password"
		}, ""},
		{"smtp missing host", func(c *RuntimeConfig) {
			c.EmailProvider = "smtp"
			c.EmailSMTPSender = "noreply@example.com"
		}, "EMAIL_SMTP_HOST"},
		{"smtp bad tls", func(c *RuntimeConfig) {
			c.EmailProvider = "smtp"
			c.EmailSMTPHost = "smtp.example.com"
			c.EmailSMTPSender = "noreply@example.com"
			c.EmailSMTPTLS = "maybe"
		}, "EMAIL_SMTP_TLS"},
		{"unknown email provider", func(c *RuntimeConfig) { c.EmailProvider = "pigeon" }, "EMAIL_PROVIDER"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			cfg := validConfig()
			tt.mutate(&cfg)
			err := cfg.Validate()
			if tt.wantErr == "" {
				assert.NoError(t, err)
			} else {
				assert.ErrorContains(t, err, tt.wantErr)
			}
		})
	}
}

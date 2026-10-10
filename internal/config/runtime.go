// Package config reads the runtime configuration of LightEvent from environment variables.
package config

import (
	"errors"
	"fmt"
	"net"
	"strconv"
	"time"

	"github.com/caarlos0/env/v11"
)

// MinPasswordLength is the minimum length for user passwords, including the bootstrap password.
const MinPasswordLength = 12

// RuntimeConfig is the set of configurable options that are read when the program starts.
type RuntimeConfig struct {
	Host         string `env:"HOST" envDefault:"0.0.0.0"`
	Port         int    `env:"PORT" envDefault:"8080"`
	Debug        bool   `env:"DEBUG" envDefault:"false"`
	LogFormat    string `env:"LOG_FORMAT" envDefault:"json"`
	DatabaseFile string `env:"DATABASE_FILE" envDefault:"lightevent.sqlite3"`

	// SessionMaxAge is how long user and member sessions remain valid after login.
	SessionMaxAge time.Duration `env:"SESSION_MAX_AGE" envDefault:"168h"`
	// CookieSecure sets the Secure attribute on session cookies. Only disable it for local development over plain http.
	CookieSecure bool `env:"COOKIE_SECURE" envDefault:"true"`
	// TrustProxyHeaders uses X-Forwarded-For / X-Real-IP to determine the client IP for rate limiting.
	// Only enable it when LightEvent runs behind a reverse proxy that sets these headers.
	TrustProxyHeaders bool `env:"TRUST_PROXY_HEADERS" envDefault:"false"`

	// BootstrapUsername and BootstrapPassword create the first user when no users exist yet.
	BootstrapUsername string `env:"BOOTSTRAP_USERNAME"`
	BootstrapPassword string `env:"BOOTSTRAP_PASSWORD"`

	// VerificationTTL is how long an emailed member verification code remains valid.
	VerificationTTL time.Duration `env:"VERIFICATION_TTL" envDefault:"15m"`

	// EmailProvider is one of "smtp", "log" (development only: writes emails to the log) or empty (disabled).
	EmailProvider     string `env:"EMAIL_PROVIDER"`
	EmailSMTPHost     string `env:"EMAIL_SMTP_HOST"`
	EmailSMTPPort     int    `env:"EMAIL_SMTP_PORT" envDefault:"587"`
	EmailSMTPUsername string `env:"EMAIL_SMTP_USERNAME"`
	EmailSMTPPassword string `env:"EMAIL_SMTP_PASSWORD"`
	// EmailSMTPSender is the From address of emails.
	EmailSMTPSender string `env:"EMAIL_SMTP_SENDER"`
	// EmailSMTPTLS is one of "starttls" (default), "tls" (implicit TLS, usually port 465) or "none".
	EmailSMTPTLS string `env:"EMAIL_SMTP_TLS" envDefault:"starttls"`

	PaymentsProvider     string `env:"PAYMENTS_PROVIDER"`
	PaymentsStripeAPIKey string `env:"PAYMENTS_STRIPE_API_KEY"`
}

// NewRuntimeConfig creates a new RuntimeConfig from environment variables and validates it.
func NewRuntimeConfig() (*RuntimeConfig, error) {
	rc := RuntimeConfig{}
	if err := env.Parse(&rc); err != nil {
		return nil, err
	}
	if err := rc.Validate(); err != nil {
		return nil, err
	}
	return &rc, nil
}

// Validate checks the configuration for invalid or incomplete values.
func (cfg RuntimeConfig) Validate() error {
	var errs []error
	if cfg.Port < 1 || cfg.Port > 65535 {
		errs = append(errs, fmt.Errorf("PORT must be between 1 and 65535"))
	}
	if cfg.LogFormat != "json" && cfg.LogFormat != "console" {
		errs = append(errs, fmt.Errorf("LOG_FORMAT must be \"json\" or \"console\""))
	}
	if cfg.DatabaseFile == "" {
		errs = append(errs, fmt.Errorf("DATABASE_FILE is required"))
	}
	if cfg.SessionMaxAge < time.Minute {
		errs = append(errs, fmt.Errorf("SESSION_MAX_AGE must be at least 1m"))
	}
	if cfg.VerificationTTL < time.Minute {
		errs = append(errs, fmt.Errorf("VERIFICATION_TTL must be at least 1m"))
	}
	if (cfg.BootstrapUsername == "") != (cfg.BootstrapPassword == "") {
		errs = append(errs, fmt.Errorf("BOOTSTRAP_USERNAME and BOOTSTRAP_PASSWORD must be set together"))
	}
	if cfg.BootstrapPassword != "" && len(cfg.BootstrapPassword) < MinPasswordLength {
		errs = append(errs, fmt.Errorf("BOOTSTRAP_PASSWORD must be at least %d characters", MinPasswordLength))
	}
	switch cfg.EmailProvider {
	case "", "log":
	case "smtp":
		if cfg.EmailSMTPHost == "" {
			errs = append(errs, fmt.Errorf("EMAIL_SMTP_HOST is required when EMAIL_PROVIDER=smtp"))
		}
		if cfg.EmailSMTPSender == "" {
			errs = append(errs, fmt.Errorf("EMAIL_SMTP_SENDER is required when EMAIL_PROVIDER=smtp"))
		}
		switch cfg.EmailSMTPTLS {
		case "starttls", "tls", "none":
		default:
			errs = append(errs, fmt.Errorf("EMAIL_SMTP_TLS must be one of starttls, tls, none"))
		}
	default:
		errs = append(errs, fmt.Errorf("EMAIL_PROVIDER must be one of smtp, log or empty"))
	}
	return errors.Join(errs...)
}

// ServerAddr returns the address the http server listens on.
func (cfg RuntimeConfig) ServerAddr() string {
	return net.JoinHostPort(cfg.Host, strconv.Itoa(cfg.Port))
}

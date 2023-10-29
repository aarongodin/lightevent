package config

import (
	"fmt"
	"time"
)

// RuntimeConfig is the set of configurable options that are read when the program starts.
type RuntimeConfig struct {
	Host                 string        `env:"HOST" envDefault:"0.0.0.0"`
	Port                 int           `env:"PORT" envDefault:"8080"`
	Debug                bool          `env:"DEBUG" envDefault:"false"`
	LogFormat            string        `env:"LOG_FORMAT" envDefault:"json"`
	DatabaseFile         string        `env:"DATABASE_FILE" envDefault:"lightevent.sqlite3"`
	SessionMaxAge        time.Duration `env:"SESSION_MAX_AGE" envDefault:"168h"`
	CookieHMACSecret     string        `env:"COOKIE_HMAC_SECRET"`
	AllowAdminUser       bool          `env:"ALLOW_ADMIN_USER" envDefault:"false"`
	AdminUserPassword    string        `env:"ADMIN_USER_PASSWORD" envDefault:"admin"`
	EmailProvider        string        `env:"EMAIL_PROVIDER"`
	EmailSMTPUsername    string        `env:"EMAIL_SMTP_USERNAME"`
	EmailSMTPPassword    string        `env:"EMAIL_SMTP_PASSWORD"`
	EmailSMTPSender      string        `env:"EMAIL_SMTP_SENDER"`
	EmailSMTPHost        string        `env:"EMAIL_SMTP_HOST"`
	EmailSMTPPort        int           `env:"EMAIL_SMTP_PORT"`
	PaymentsProvider     string        `env:"PAYMENTS_PROVIDER"`
	PaymentsStripeAPIKey string        `env:"PAYMENTS_STRIPE_API_KEY"`
}

// ServerAddr returns the concatenated hostname with port.
func (cfg RuntimeConfig) ServerAddr() string {
	return fmt.Sprintf("%s:%d", cfg.Host, cfg.Port)
}

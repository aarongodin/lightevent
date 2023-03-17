package config

import "time"

type RuntimeConfig struct {
	Port              int           `env:"PORT" envDefault:"8080"`
	Debug             bool          `env:"DEBUG"`
	DatabasePath      string        `env:"DATABASE_PATH" envDefault:"spectral.db"`
	SessionMaxAge     time.Duration `env:"SESSION_MAX_AGE" envDefault:"168h"`
	CookieHMACSecret  string        `env:"COOKIE_HMAC_SECRET"`
	AllowAdminUser    bool          `env:"ALLOW_ADMIN_USER" envDefault:"false"`
	AdminUserPassword string        `env:"ADMIN_USER_PASSWORD" envDefault:"admin"`

	SMTP SMTPConfig
}

type SMTPConfig struct {
	Fullname string `env:"SMTP_FULLNAME"`
	Username string `env:"SMTP_USERNAME"`
	Password string `env:"SMTP_PASSWORD"`
}

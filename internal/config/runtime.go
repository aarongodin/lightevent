package config

import (
	"fmt"
	"time"
)

type RuntimeConfig struct {
	Host              string        `env:"HOST" envDefault:"0.0.0.0"`
	Port              int           `env:"PORT" envDefault:"8080"`
	Debug             bool          `env:"DEBUG" envDefault:"false"`
	LogFormat         string        `env:"LOG_FORMAT" envDefault:"json"`
	DatabaseFile      string        `env:"DATABASE_FILE" envDefault:"spectral.sqlite3"`
	SessionMaxAge     time.Duration `env:"SESSION_MAX_AGE" envDefault:"168h"`
	CookieHMACSecret  string        `env:"COOKIE_HMAC_SECRET"`
	AllowAdminUser    bool          `env:"ALLOW_ADMIN_USER" envDefault:"false"`
	AdminUserPassword string        `env:"ADMIN_USER_PASSWORD" envDefault:"admin"`
}

func (cfg RuntimeConfig) ServerAddr() string {
	return fmt.Sprintf("%s:%d", cfg.Host, cfg.Port)
}

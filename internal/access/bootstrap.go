package access

import (
	"context"
	"fmt"
	"time"

	"github.com/aarongodin/lightevent/internal/config"
	"github.com/aarongodin/lightevent/internal/model"
	"github.com/aarongodin/lightevent/internal/secret"
	"github.com/aarongodin/lightevent/internal/storage"
	"github.com/rs/zerolog/log"
)

// Bootstrap creates the first user from BOOTSTRAP_USERNAME and BOOTSTRAP_PASSWORD when no users exist.
// It reports whether a user was created.
func Bootstrap(ctx context.Context, q *storage.Queries, rc *config.RuntimeConfig, now time.Time) (bool, error) {
	count, err := q.CountUsers(ctx)
	if err != nil {
		return false, fmt.Errorf("error counting users: %w", err)
	}
	if count > 0 {
		if rc.BootstrapUsername != "" {
			log.Info().Msg("users exist; BOOTSTRAP_USERNAME and BOOTSTRAP_PASSWORD are ignored and can be removed")
		}
		return false, nil
	}
	if rc.BootstrapUsername == "" {
		log.Warn().Msg("no users exist; set BOOTSTRAP_USERNAME and BOOTSTRAP_PASSWORD and restart to create the first user")
		return false, nil
	}

	username, err := model.Username("BOOTSTRAP_USERNAME", rc.BootstrapUsername)
	if err != nil {
		return false, err
	}
	password, err := model.Password("BOOTSTRAP_PASSWORD", rc.BootstrapPassword)
	if err != nil {
		return false, err
	}
	hash, err := HashPassword(password)
	if err != nil {
		return false, err
	}
	if _, err := q.CreateUser(ctx, storage.CreateUserParams{
		Uid:          secret.UID(),
		Username:     username,
		PasswordHash: hash,
		CreatedAt:    now,
	}); err != nil {
		return false, fmt.Errorf("error creating bootstrap user: %w", err)
	}
	log.Info().Str("username", username).Msg("created bootstrap user; remove BOOTSTRAP_PASSWORD from the environment")
	return true, nil
}

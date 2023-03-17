package server

import (
	"errors"
	"fmt"

	"github.com/aarongodin/spectral/internal/server/config"
	"github.com/aarongodin/spectral/internal/server/repository"
	"github.com/asdine/storm/v3"
	"github.com/twitchtv/twirp"
)

type Server struct {
	Repo             *repository.Repository
	PersistentConfig config.PersistentConfig
}

// errorResponse is a centralized wrapper for coercing known error cases to
// the appropriate twirp errors.
func errorResponse(err error, entity string) error {
	if errors.Is(err, storm.ErrNotFound) {
		return twirp.NotFoundError(fmt.Sprintf("%s not found", entity))
	}

	return err
}

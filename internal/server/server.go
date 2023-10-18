package server

import (
	"database/sql"
	"errors"
	"fmt"

	"github.com/aarongodin/spectral/internal/config"
	"github.com/aarongodin/spectral/internal/storage"
	"github.com/twitchtv/twirp"
)

type Server struct {
	db      *sql.DB
	queries *storage.Queries
	rc      *config.RuntimeConfig
}

func NewServer(db *sql.DB, queries *storage.Queries, rc *config.RuntimeConfig) *Server {
	return &Server{
		db:      db,
		queries: queries,
		rc:      rc,
	}
}

// errorResponse is a centralized wrapper for coercing known error cases to
// the appropriate twirp errors.
func errorResponse(err error, entity string) error {
	if errors.Is(err, sql.ErrNoRows) {
		return twirp.NotFoundError(fmt.Sprintf("%s not found", entity))
	}

	// if errors.Is(err, storm.ErrAlreadyExists) {
	// 	return twirp.AlreadyExists.Error(fmt.Sprintf("%s already exists", entity))
	// }

	// if verr, ok := err.(repository.ErrValidationFailed); ok {
	// 	return twirp.InvalidArgumentError(verr.Argument, verr.Reason)
	// }

	return err
}

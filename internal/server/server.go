package server

import (
	"database/sql"
	"errors"
	"fmt"

	"github.com/aarongodin/lightevent/internal/config"
	"github.com/aarongodin/lightevent/internal/model"
	"github.com/aarongodin/lightevent/internal/provider"
	"github.com/aarongodin/lightevent/internal/storage"
	"github.com/mattn/go-sqlite3"
	"github.com/twitchtv/twirp"
)

type Server struct {
	db        *sql.DB
	queries   *storage.Queries
	rc        *config.RuntimeConfig
	providers *provider.Providers
}

func NewServer(db *sql.DB, queries *storage.Queries, rc *config.RuntimeConfig, p *provider.Providers) *Server {
	return &Server{
		db:        db,
		queries:   queries,
		rc:        rc,
		providers: p,
	}
}

// errorResponse is a centralized wrapper for coercing known error cases to
// the appropriate twirp errors.
func errorResponse(err error, entity string) error {
	if errors.Is(err, sql.ErrNoRows) {
		return twirp.NotFoundError(fmt.Sprintf("%s not found", entity))
	}

	if verr, ok := err.(model.ErrValidationFailed); ok {
		return twirp.InvalidArgumentError(verr.Argument, verr.Reason)
	}

	if sqliteErr, ok := err.(sqlite3.Error); ok {
		if sqliteErr.ExtendedCode == sqlite3.ErrConstraintUnique {
			return twirp.AlreadyExists.Error(fmt.Sprintf("%s already exists", entity))
		}
	}

	return err
}

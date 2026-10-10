// Package server implements the LightEventService RPCs.
package server

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"connectrpc.com/connect"
	"github.com/aarongodin/lightevent/internal/access"
	"github.com/aarongodin/lightevent/internal/config"
	"github.com/aarongodin/lightevent/internal/gen/lightevent/v1/lighteventv1connect"
	"github.com/aarongodin/lightevent/internal/model"
	"github.com/aarongodin/lightevent/internal/notifications"
	"github.com/aarongodin/lightevent/internal/ratelimit"
	"github.com/aarongodin/lightevent/internal/storage"
	"github.com/rs/zerolog/log"
)

// Server implements lighteventv1connect.LightEventServiceHandler.
type Server struct {
	store    *storage.Storage
	q        *storage.Queries
	rc       *config.RuntimeConfig
	notifier *notifications.Notifier
	now      func() time.Time

	// verifyIPLimit limits verification requests per client IP.
	verifyIPLimit *ratelimit.Limiter
}

var _ lighteventv1connect.LightEventServiceHandler = (*Server)(nil)

// Option configures a Server.
type Option func(*Server)

// WithClock overrides the server clock; intended for tests.
func WithClock(now func() time.Time) Option {
	return func(s *Server) { s.now = now }
}

// New returns a Server.
func New(store *storage.Storage, rc *config.RuntimeConfig, notifier *notifications.Notifier, opts ...Option) *Server {
	s := &Server{
		store:         store,
		q:             store.Queries,
		rc:            rc,
		notifier:      notifier,
		now:           func() time.Time { return time.Now().UTC() },
		verifyIPLimit: ratelimit.New(30, 15*time.Minute),
	}
	for _, opt := range opts {
		opt(s)
	}
	return s
}

// Now returns the current time in UTC, truncated to milliseconds for stable storage round trips.
func (s *Server) Now() time.Time {
	return s.now().UTC().Truncate(time.Millisecond)
}

func newError(code connect.Code, msg string) error {
	return connect.NewError(code, errors.New(msg))
}

func notFound(entity string) error {
	return newError(connect.CodeNotFound, entity+" not found")
}

// errorResponse converts known error cases into connect errors. Unknown errors are logged and returned as a
// generic internal error so that internal details are not exposed to clients.
func errorResponse(ctx context.Context, err error, entity string) error {
	if err == nil {
		return nil
	}
	var cerr *connect.Error
	if errors.As(err, &cerr) {
		return cerr
	}
	if errors.Is(err, sql.ErrNoRows) {
		return notFound(entity)
	}
	var verr model.ErrValidationFailed
	if errors.As(err, &verr) {
		return newError(connect.CodeInvalidArgument, verr.Error())
	}
	if storage.IsUniqueViolation(err) {
		return newError(connect.CodeAlreadyExists, entity+" already exists")
	}
	if errors.Is(err, context.Canceled) {
		return connect.NewError(connect.CodeCanceled, err)
	}
	log.Ctx(ctx).Error().Err(err).Str("entity", entity).Msg("internal error")
	return newError(connect.CodeInternal, "internal error")
}

func identity(ctx context.Context) access.Identity {
	return access.IdentityFrom(ctx)
}

// pageLimit normalizes a requested page size.
func pageLimit(requested, def, max int32) int64 {
	if requested <= 0 {
		return int64(def)
	}
	if requested > max {
		return int64(max)
	}
	return int64(requested)
}

func pageOffset(requested int32) int64 {
	if requested < 0 {
		return 0
	}
	return int64(requested)
}

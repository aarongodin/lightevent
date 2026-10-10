// Package app wires storage, services and HTTP handlers into a runnable application.
package app

import (
	"context"
	"fmt"
	"io/fs"
	"net/http"
	"time"

	"connectrpc.com/connect"
	"github.com/aarongodin/lightevent/internal/access"
	"github.com/aarongodin/lightevent/internal/config"
	"github.com/aarongodin/lightevent/internal/gen/lightevent/v1/lighteventv1connect"
	"github.com/aarongodin/lightevent/internal/notifications"
	"github.com/aarongodin/lightevent/internal/provider/email"
	"github.com/aarongodin/lightevent/internal/server"
	"github.com/aarongodin/lightevent/internal/storage"
	"github.com/aarongodin/lightevent/internal/web"
	"github.com/rs/zerolog/log"
)

// maxRequestBytes limits API and form request bodies.
const maxRequestBytes = 1 << 20

// App is a configured LightEvent instance.
type App struct {
	rc       *config.RuntimeConfig
	Store    *storage.Storage
	Notifier *notifications.Notifier
	Server   *server.Server
	handler  http.Handler
	now      func() time.Time
}

// Options customizes an App; zero values use production defaults.
type Options struct {
	// Sender overrides the email sender selected from the runtime config.
	Sender email.Sender
	// AdminUI is the file system of the built admin UI.
	AdminUI fs.FS
	// Now overrides the clock.
	Now func() time.Time
}

// New opens storage, creates the bootstrap user if needed and builds the HTTP handler.
func New(ctx context.Context, rc *config.RuntimeConfig, opts Options) (*App, error) {
	now := opts.Now
	if now == nil {
		now = func() time.Time { return time.Now().UTC() }
	}

	store, err := storage.Open(ctx, rc.DatabaseFile)
	if err != nil {
		return nil, fmt.Errorf("failed to open storage: %w", err)
	}
	if _, err := access.Bootstrap(ctx, store.Queries, rc, now()); err != nil {
		store.Close()
		return nil, fmt.Errorf("failed to bootstrap user: %w", err)
	}

	sender := opts.Sender
	if sender == nil {
		sender = email.New(rc)
	}
	notifier, err := notifications.New(sender)
	if err != nil {
		store.Close()
		return nil, fmt.Errorf("failed to load email templates: %w", err)
	}

	a := &App{
		rc:       rc,
		Store:    store,
		Notifier: notifier,
		Server:   server.New(store, rc, notifier, server.WithClock(now)),
		now:      now,
	}
	if a.handler, err = a.buildHandler(opts.AdminUI); err != nil {
		store.Close()
		return nil, err
	}
	return a, nil
}

// Handler returns the root HTTP handler.
func (a *App) Handler() http.Handler {
	return a.handler
}

func (a *App) buildHandler(adminUI fs.FS) (http.Handler, error) {
	mux := http.NewServeMux()

	auth := access.NewAuthenticator(a.Store.Queries, a.now)
	rpcPath, rpcHandler := lighteventv1connect.NewLightEventServiceHandler(
		a.Server,
		connect.WithInterceptors(access.NewInterceptor(auth, access.Policy), server.NewLoggingInterceptor()),
		connect.WithReadMaxBytes(maxRequestBytes),
	)
	mux.Handle("/rpc"+rpcPath, http.StripPrefix("/rpc", rpcHandler))

	routes, err := access.NewRoutes(a.Store.Queries, a.rc, a.now)
	if err != nil {
		return nil, err
	}
	routes.Register(mux)

	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, r *http.Request) {
		if err := a.Store.DB.PingContext(r.Context()); err != nil {
			http.Error(w, "database unavailable", http.StatusServiceUnavailable)
			return
		}
		w.Write([]byte("ok")) //nolint:errcheck
	})

	if adminUI != nil {
		mux.Handle("/", web.SPA(adminUI))
	}

	// Rejects cross-origin state-changing browser requests (CSRF) using Sec-Fetch-Site / Origin.
	var h http.Handler = http.NewCrossOriginProtection().Handler(mux)
	h = web.MaxBodyBytes(maxRequestBytes, h)
	h = access.ClientIPMiddleware(a.rc.TrustProxyHeaders, h)
	h = web.SecurityHeaders(a.rc.CookieSecure, h)
	h = web.RequestLogger(h)
	return h, nil
}

// RunMaintenance periodically deletes expired sessions and verifications until ctx is done.
func (a *App) RunMaintenance(ctx context.Context, interval time.Duration) {
	ticker := time.NewTicker(interval)
	defer ticker.Stop()
	for {
		a.Cleanup(ctx)
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
		}
	}
}

// Cleanup deletes expired sessions and verifications once.
func (a *App) Cleanup(ctx context.Context) {
	now := a.now()
	if err := a.Store.Queries.DeleteExpiredSessions(ctx, now); err != nil {
		log.Err(err).Msg("error deleting expired sessions")
	}
	// Keep expired verifications for a day so per-email rate limits remain effective.
	if err := a.Store.Queries.DeleteExpiredVerifications(ctx, now.Add(-24*time.Hour)); err != nil {
		log.Err(err).Msg("error deleting expired verifications")
	}
}

// Close waits for background emails (bounded by ctx) and closes storage.
func (a *App) Close(ctx context.Context) error {
	a.Notifier.Wait(ctx)
	return a.Store.Close()
}

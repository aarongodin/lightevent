package main

import (
	"context"
	"errors"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	_ "time/tzdata" // embed timezone data so the single binary works without system tzdata

	"github.com/aarongodin/lightevent"
	"github.com/aarongodin/lightevent/admin"
	"github.com/aarongodin/lightevent/internal/app"
	"github.com/aarongodin/lightevent/internal/config"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

func main() {
	os.Exit(run())
}

func run() int {
	zerolog.SetGlobalLevel(zerolog.InfoLevel)
	zerolog.DefaultContextLogger = &log.Logger

	rc, err := config.NewRuntimeConfig()
	if err != nil {
		log.Error().Err(err).Msg("invalid configuration")
		return 2
	}
	if rc.LogFormat == "console" {
		log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})
		zerolog.DefaultContextLogger = &log.Logger
	}
	if rc.Debug {
		zerolog.SetGlobalLevel(zerolog.DebugLevel)
	}
	log.Info().Str("version", lightevent.VERSION).Msg("LightEvent")
	if !rc.CookieSecure {
		log.Warn().Msg("COOKIE_SECURE is disabled; session cookies will be sent over plain http")
	}

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	a, err := app.New(ctx, rc, app.Options{AdminUI: admin.Dist()})
	if err != nil {
		log.Error().Err(err).Msg("failed to start")
		return 1
	}

	go a.RunMaintenance(ctx, time.Hour)

	httpServer := &http.Server{
		Addr:              rc.ServerAddr(),
		Handler:           a.Handler(),
		ReadHeaderTimeout: 10 * time.Second,
		ReadTimeout:       30 * time.Second,
		WriteTimeout:      60 * time.Second,
		IdleTimeout:       120 * time.Second,
	}

	errCh := make(chan error, 1)
	go func() {
		log.Info().Str("addr", rc.ServerAddr()).Msg("started http server")
		if err := httpServer.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			errCh <- err
		}
		close(errCh)
	}()

	exitCode := 0
	select {
	case <-ctx.Done():
		log.Info().Msg("shutting down")
	case err := <-errCh:
		if err != nil {
			log.Error().Err(err).Msg("http server failed")
			exitCode = 1
		}
	}

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	if err := httpServer.Shutdown(shutdownCtx); err != nil {
		log.Error().Err(err).Msg("failed to shut down http server")
		exitCode = 1
	}
	if err := a.Close(shutdownCtx); err != nil {
		log.Error().Err(err).Msg("failed to close storage")
		exitCode = 1
	}
	log.Info().Msg("shutdown complete")
	return exitCode
}

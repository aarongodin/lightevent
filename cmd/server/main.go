package main

import (
	"context"
	"encoding/gob"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/aarongodin/lightevent"
	"github.com/aarongodin/lightevent/internal/config"
	"github.com/aarongodin/lightevent/internal/events"
	"github.com/aarongodin/lightevent/internal/middleware"
	"github.com/aarongodin/lightevent/internal/notifications"
	"github.com/aarongodin/lightevent/internal/provider"
	"github.com/aarongodin/lightevent/internal/server"
	"github.com/aarongodin/lightevent/internal/server/access"
	"github.com/aarongodin/lightevent/internal/server/client"
	"github.com/aarongodin/lightevent/internal/service"
	"github.com/aarongodin/lightevent/internal/storage"
	"github.com/julienschmidt/httprouter"
	"github.com/twitchtv/twirp"
	"github.com/urfave/negroni"

	_ "embed"

	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

func main() {
	// Globally register gob-encoding for types permissible on the settings map
	gob.Register([]any{})
	gob.Register(map[string]any{})

	runtimeConfig, err := config.NewRuntimeConfig()
	if err != nil {
		log.Err(err).Msg("error parsing runtime config")
		return
	}

	zerolog.SetGlobalLevel(zerolog.InfoLevel)
	if runtimeConfig.LogFormat == "console" {
		log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})
	}
	log.Info().Str("version", lightevent.VERSION).Msg("LightEvent")
	if runtimeConfig.Debug {
		zerolog.SetGlobalLevel(zerolog.DebugLevel)
	}
	log.Info().Str("lvl", zerolog.GlobalLevel().String()).Str("format", runtimeConfig.LogFormat).Msg("logging config")

	store, err := storage.Init(context.Background(), runtimeConfig)
	if err != nil {
		log.Err(err).Msg("failed to init storage")
	}
	queries := storage.New(store.DB)

	providers, err := provider.New(runtimeConfig)
	if err != nil {
		log.Err(err).Msg("failed to init providers")
	}

	notifications.Init(events.Default, providers.Email)

	s := server.NewServer(store.DB, queries, runtimeConfig, providers)
	twirpHandler := service.NewLightEventServer(s, twirp.WithServerPathPrefix("/rpc"), twirp.WithServerHooks(server.NewLoggingHooks()))

	router := httprouter.New()
	if err := access.Register(router, queries, runtimeConfig); err != nil {
		log.Err(err).Msg("failed to register access routes")
		return
	}
	access.InitCookies(runtimeConfig)

	if err := client.Register(router, queries, runtimeConfig); err != nil {
		log.Err(err).Msg("failed to register client routes")
	}

	mux := http.NewServeMux()
	mux.Handle(
		twirpHandler.PathPrefix(),
		access.WithAuthorization(twirpHandler, queries, runtimeConfig, access.GetAllowedSchemes()),
	)
	mux.Handle("/", router)

	mw := negroni.New()
	mw.Use(middleware.NewLoggingMiddleware())
	mw.UseHandler(mux)

	httpServer := &http.Server{
		Addr:    runtimeConfig.ServerAddr(),
		Handler: mw,
	}

	done := make(chan os.Signal, 1)
	signal.Notify(done, os.Interrupt, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		if err := httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal().Err(err).Msg("failed to start http server")
		}
	}()
	log.Info().Int("port", runtimeConfig.Port).Str("host", runtimeConfig.Host).Msg("started http server")

	<-done
	log.Debug().Msg("starting graceful shutdown")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer func() {
		if err := store.DB.Close(); err != nil {
			log.Err(err).Msg("failed to close DB")
		}
		cancel()
	}()

	if err := httpServer.Shutdown(ctx); err != nil {
		log.Err(err).Msg("failed to shutdown http server")
	}

	log.Debug().Msg("shutdown complete")
}

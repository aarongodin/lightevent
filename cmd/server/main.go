package main

import (
	"context"
	"encoding/gob"
	"net/http"
	"os"

	"github.com/aarongodin/lightevent"
	"github.com/aarongodin/lightevent/internal/config"
	"github.com/aarongodin/lightevent/internal/server"
	"github.com/aarongodin/lightevent/internal/server/access"
	"github.com/aarongodin/lightevent/internal/service"
	"github.com/aarongodin/lightevent/internal/storage"
	"github.com/julienschmidt/httprouter"
	"github.com/twitchtv/twirp"

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
		os.Exit(server.EXIT_STARTUP_ERR)
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

	s := server.NewServer(store.DB, queries, runtimeConfig)
	twirpHandler := service.NewLightEventServer(s, twirp.WithServerPathPrefix("/rpc"), twirp.WithServerHooks(server.NewLoggingHooks()))

	authHandler := httprouter.New()
	if err := access.Register(authHandler, queries, runtimeConfig); err != nil {
		log.Err(err).Msg("failed to register access routes")
		os.Exit(server.EXIT_STARTUP_ERR)
	}
	access.InitCookies(runtimeConfig)

	mux := http.NewServeMux()
	mux.Handle(
		twirpHandler.PathPrefix(),
		access.WithAuthorization(twirpHandler, queries, runtimeConfig, access.GetAllowedSchemes()),
	)
	mux.Handle("/", authHandler)

	log.Info().Int("port", runtimeConfig.Port).Str("host", runtimeConfig.Host).Msg("starting http server")
	if err := http.ListenAndServe(runtimeConfig.ServerAddr(), mux); err != nil {
		log.Err(err).Msg("failed to start http server")
	}
}

package main

import (
	"net/http"
	"os"

	"github.com/aarongodin/spectral/internal/server"
	"github.com/aarongodin/spectral/internal/server/access"
	"github.com/aarongodin/spectral/internal/server/config"
	"github.com/aarongodin/spectral/internal/server/repository"
	"github.com/aarongodin/spectral/internal/service"
	"github.com/asdine/storm/v3"
	"github.com/julienschmidt/httprouter"
	"github.com/twitchtv/twirp"
	"golang.org/x/exp/slog"
)

func main() {
	// Configuration
	runtimeConfig, err := config.NewRuntimeConfig()
	if err != nil {
		os.Exit(server.EXIT_STARTUP_ERR)
	}

	// Logging config
	logOptions := slog.HandlerOptions{}
	if runtimeConfig.Debug {
		logOptions.Level = slog.LevelDebug
	}
	logger := slog.New(logOptions.NewJSONHandler(os.Stdout))
	slog.SetDefault(logger)

	// DB connection
	db, err := storm.Open(runtimeConfig.DatabasePath)
	if err != nil {
		logger.Error("failed to open db", slog.Any("err", err))
		os.Exit(server.EXIT_STARTUP_ERR)
	}
	defer db.Close()

	persistentConfig := config.NewPersistentConfig(db)
	repo := repository.New(db, runtimeConfig)

	s := &server.Server{
		Repo:             repo,
		PersistentConfig: persistentConfig,
	}
	twirpHandler := service.NewSpectralServer(s, twirp.WithServerPathPrefix("/rpc"), twirp.WithServerHooks(server.NewLoggingHooks()))

	authHandler := httprouter.New()
	if err := access.Register(authHandler, repo, runtimeConfig); err != nil {
		logger.Error("failed to register access routes", slog.Any("err", err))
		os.Exit(server.EXIT_STARTUP_ERR)
	}
	access.InitCookies(runtimeConfig)

	mux := http.NewServeMux()
	mux.Handle(twirpHandler.PathPrefix(), access.WithAuthorization(twirpHandler, repo, access.GetAllowedSchemes()))
	mux.Handle("/", authHandler)

	logger.Info("starting http server")
	if err := http.ListenAndServe(":8080", mux); err != nil {
		logger.Error("failed to start http server", slog.Any("err", err))
	}
}

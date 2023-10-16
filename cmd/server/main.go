package main

import (
	"net/http"
	"os"
	"time"

	"github.com/aarongodin/spectral/internal/server"
	"github.com/aarongodin/spectral/internal/server/access"
	"github.com/aarongodin/spectral/internal/server/config"
	"github.com/aarongodin/spectral/internal/server/repository"
	"github.com/aarongodin/spectral/internal/service"
	"github.com/asdine/storm/v3"
	"github.com/julienschmidt/httprouter"
	"github.com/justinas/alice"
	"github.com/twitchtv/twirp"
	"golang.org/x/exp/slog"
)

func timeoutHandler(h http.Handler) http.Handler {
	return http.TimeoutHandler(h, 5*time.Second, "timed out")
}

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
	mux.Handle(twirpHandler.PathPrefix(), access.WithAuthorization(twirpHandler, repo, runtimeConfig, access.GetAllowedSchemes()))
	mux.Handle("/", authHandler)

	// Add global middleware
	chain := alice.New(timeoutHandler).Then(mux)

	logger.Info("starting http server")
	if err := http.ListenAndServe(runtimeConfig.ServerAddr(), chain); err != nil {
		logger.Error("failed to start http server", slog.Any("err", err))
	}
}

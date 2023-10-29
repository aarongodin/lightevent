package middleware

import (
	"net/http"
	"time"

	"github.com/rs/zerolog/log"
)

type httpLogger struct{}

func (l httpLogger) ServeHTTP(rw http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	log.Info().Fields(map[string]any{
		"path":   r.URL.Path,
		"method": r.Method,
	}).Msg("request received")

	start := time.Now()
	next(rw, r)

	log.Info().Fields(map[string]any{
		"path":     r.URL.Path,
		"method":   r.Method,
		"duration": float64(time.Since(start).Microseconds()) / 1000,
	}).Msg("request complete")
}

func NewLoggingMiddleware() *httpLogger {
	return &httpLogger{}
}

// Package web contains HTTP middleware and static file serving.
package web

import (
	"net/http"
	"runtime/debug"
	"time"

	"github.com/aarongodin/lightevent/internal/secret"
	"github.com/rs/zerolog/log"
)

// contentSecurityPolicy only allows resources from the same origin. The admin UI and login page are built
// so that no inline scripts or styles are required.
const contentSecurityPolicy = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; " +
	"font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'"

// SecurityHeaders sets defensive headers on every response. hsts enables Strict-Transport-Security, which
// should only be sent when the site is served over https.
func SecurityHeaders(hsts bool, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		h := w.Header()
		h.Set("Content-Security-Policy", contentSecurityPolicy)
		h.Set("X-Content-Type-Options", "nosniff")
		h.Set("X-Frame-Options", "DENY")
		h.Set("Referrer-Policy", "same-origin")
		h.Set("Cross-Origin-Opener-Policy", "same-origin")
		if hsts {
			h.Set("Strict-Transport-Security", "max-age=31536000")
		}
		next.ServeHTTP(w, r)
	})
}

// MaxBodyBytes limits the size of request bodies.
func MaxBodyBytes(limit int64, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Body != nil {
			r.Body = http.MaxBytesReader(w, r.Body, limit)
		}
		next.ServeHTTP(w, r)
	})
}

type statusRecorder struct {
	http.ResponseWriter
	status int
}

func (r *statusRecorder) WriteHeader(code int) {
	r.status = code
	r.ResponseWriter.WriteHeader(code)
}

func (r *statusRecorder) Unwrap() http.ResponseWriter {
	return r.ResponseWriter
}

func (r *statusRecorder) Flush() {
	if f, ok := r.ResponseWriter.(http.Flusher); ok {
		f.Flush()
	}
}

// RequestLogger attaches a request-scoped logger (with a request id) to the context, logs each request
// and recovers from panics.
func RequestLogger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		requestID := secret.Token(9)
		logger := log.With().Str("request_id", requestID).Logger()
		ctx := logger.WithContext(r.Context())
		rec := &statusRecorder{ResponseWriter: w, status: http.StatusOK}

		defer func() {
			if v := recover(); v != nil {
				if v == http.ErrAbortHandler {
					panic(v)
				}
				logger.Error().Interface("panic", v).Bytes("stack", debug.Stack()).Msg("panic serving request")
				http.Error(rec, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
			}
			logger.Info().
				Str("method", r.Method).
				Str("path", r.URL.Path).
				Int("status", rec.status).
				Float64("duration_ms", float64(time.Since(start).Microseconds())/1000).
				Msg("request")
		}()

		next.ServeHTTP(rec, r.WithContext(ctx))
	})
}

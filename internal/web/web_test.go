package web

import (
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"testing/fstest"

	"github.com/rs/zerolog"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func init() {
	zerolog.SetGlobalLevel(zerolog.Disabled)
}

func serve(h http.Handler, method, path string) *httptest.ResponseRecorder {
	w := httptest.NewRecorder()
	h.ServeHTTP(w, httptest.NewRequest(method, path, nil))
	return w
}

func TestSPA(t *testing.T) {
	fsys := fstest.MapFS{
		"index.html":      {Data: []byte("<html>app</html>")},
		"assets/app-1.js": {Data: []byte("console.log(1)")},
		"favicon.svg":     {Data: []byte("<svg/>")},
	}
	h := SPA(fsys)

	w := serve(h, http.MethodGet, "/")
	assert.Equal(t, http.StatusOK, w.Code)
	assert.Equal(t, "<html>app</html>", w.Body.String())
	assert.Equal(t, "no-cache", w.Header().Get("Cache-Control"))

	w = serve(h, http.MethodGet, "/events/yoga/_edit")
	assert.Equal(t, "<html>app</html>", w.Body.String(), "client routes fall back to index.html")

	w = serve(h, http.MethodGet, "/assets/app-1.js")
	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, w.Header().Get("Cache-Control"), "immutable")

	w = serve(h, http.MethodGet, "/favicon.svg")
	assert.Equal(t, http.StatusOK, w.Code)
	assert.Empty(t, w.Header().Get("Cache-Control"))

	assert.Equal(t, http.StatusNotFound, serve(h, http.MethodGet, "/assets/missing.js").Code)
	assert.Equal(t, http.StatusMethodNotAllowed, serve(h, http.MethodPost, "/").Code)
	assert.Equal(t, http.StatusOK, serve(h, http.MethodGet, "/index.html").Code)

	w = serve(SPA(fstest.MapFS{}), http.MethodGet, "/")
	assert.Equal(t, http.StatusServiceUnavailable, w.Code)
	assert.Contains(t, w.Body.String(), "make build-admin")
}

func TestSecurityHeaders(t *testing.T) {
	ok := http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {})
	w := serve(SecurityHeaders(true, ok), http.MethodGet, "/")
	assert.Contains(t, w.Header().Get("Content-Security-Policy"), "frame-ancestors 'none'")
	assert.Equal(t, "nosniff", w.Header().Get("X-Content-Type-Options"))
	assert.Equal(t, "DENY", w.Header().Get("X-Frame-Options"))
	assert.NotEmpty(t, w.Header().Get("Strict-Transport-Security"))

	w = serve(SecurityHeaders(false, ok), http.MethodGet, "/")
	assert.Empty(t, w.Header().Get("Strict-Transport-Security"))
}

func TestMaxBodyBytes(t *testing.T) {
	var readErr error
	h := MaxBodyBytes(4, http.HandlerFunc(func(_ http.ResponseWriter, r *http.Request) {
		_, readErr = io.ReadAll(r.Body)
	}))
	h.ServeHTTP(httptest.NewRecorder(), httptest.NewRequest(http.MethodPost, "/", strings.NewReader("123456")))
	require.Error(t, readErr)
	h.ServeHTTP(httptest.NewRecorder(), httptest.NewRequest(http.MethodPost, "/", strings.NewReader("123")))
	assert.NoError(t, readErr)
}

func TestRequestLoggerRecoversPanics(t *testing.T) {
	h := RequestLogger(http.HandlerFunc(func(http.ResponseWriter, *http.Request) { panic("boom") }))
	w := serve(h, http.MethodGet, "/")
	assert.Equal(t, http.StatusInternalServerError, w.Code)

	h = RequestLogger(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) { w.WriteHeader(http.StatusTeapot) }))
	assert.Equal(t, http.StatusTeapot, serve(h, http.MethodGet, "/").Code)

	assert.Panics(t, func() {
		RequestLogger(http.HandlerFunc(func(http.ResponseWriter, *http.Request) { panic(http.ErrAbortHandler) })).
			ServeHTTP(httptest.NewRecorder(), httptest.NewRequest(http.MethodGet, "/", nil))
	})
}

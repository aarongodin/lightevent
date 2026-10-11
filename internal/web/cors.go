package web

import (
	"context"
	"net/http"
	"strings"
)

// corsAllowHeaders are the request headers the client app sends with Connect requests.
const corsAllowHeaders = "Authorization, Content-Type, Connect-Protocol-Version, Connect-Timeout-Ms"

// CORS lets websites on allowed origins call the API under /rpc/ from the browser, which is how the embedded
// client app talks to the server. Requests from allowed origins go to trusted, which skips the cross-origin
// (CSRF) protection applied by other: the client app authenticates with bearer tokens, never cookies, because
// credentialed requests are not allowed. Every other request goes to other.
func CORS(allowed func(ctx context.Context, origin string) bool, trusted, other http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !strings.HasPrefix(r.URL.Path, "/rpc/") {
			other.ServeHTTP(w, r)
			return
		}
		h := w.Header()
		h.Add("Vary", "Origin")
		origin := r.Header.Get("Origin")
		if origin == "" || !allowed(r.Context(), origin) {
			other.ServeHTTP(w, r)
			return
		}

		h.Set("Access-Control-Allow-Origin", origin)
		if r.Method == http.MethodOptions && r.Header.Get("Access-Control-Request-Method") != "" {
			h.Set("Access-Control-Allow-Methods", "GET, POST")
			h.Set("Access-Control-Allow-Headers", corsAllowHeaders)
			h.Set("Access-Control-Max-Age", "7200")
			w.WriteHeader(http.StatusNoContent)
			return
		}
		trusted.ServeHTTP(w, r)
	})
}

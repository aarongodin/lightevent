package access

import (
	"context"
	"net"
	"net/http"
	"strings"
)

type clientIPKey struct{}

// ClientIPMiddleware stores the client IP on the request context. When trustProxy is true the first address
// in X-Forwarded-For (or X-Real-IP) is used; only enable it behind a proxy that overwrites these headers.
func ClientIPMiddleware(trustProxy bool, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx := context.WithValue(r.Context(), clientIPKey{}, clientIP(r, trustProxy))
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func clientIP(r *http.Request, trustProxy bool) string {
	if trustProxy {
		if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
			first, _, _ := strings.Cut(xff, ",")
			if ip := strings.TrimSpace(first); ip != "" {
				return ip
			}
		}
		if ip := strings.TrimSpace(r.Header.Get("X-Real-IP")); ip != "" {
			return ip
		}
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}

// ClientIP returns the client IP stored by ClientIPMiddleware, or "unknown".
func ClientIP(ctx context.Context) string {
	if ip, ok := ctx.Value(clientIPKey{}).(string); ok && ip != "" {
		return ip
	}
	return "unknown"
}

package server

import (
	"context"
	"path"
	"time"

	"connectrpc.com/connect"
	"github.com/aarongodin/lightevent/internal/access"
	"github.com/rs/zerolog/log"
)

// NewLoggingInterceptor logs every RPC with the authenticated identity and the result code. It must run
// after the access interceptor so the identity is available.
func NewLoggingInterceptor() connect.UnaryInterceptorFunc {
	return func(next connect.UnaryFunc) connect.UnaryFunc {
		return func(ctx context.Context, req connect.AnyRequest) (connect.AnyResponse, error) {
			start := time.Now()
			resp, err := next(ctx, req)
			id := access.IdentityFrom(ctx)
			ev := log.Ctx(ctx).Info()
			code := "ok"
			if err != nil {
				code = connect.CodeOf(err).String()
				if connect.CodeOf(err) == connect.CodeInternal || connect.CodeOf(err) == connect.CodeUnknown {
					ev = log.Ctx(ctx).Error().Err(err)
				}
			}
			ev.Str("rpc", path.Base(req.Spec().Procedure)).
				Str("scheme", string(id.Scheme)).
				Str("sub", id.Name).
				Str("code", code).
				Float64("duration_ms", float64(time.Since(start).Microseconds())/1000).
				Msg("rpc")
			return resp, err
		}
	}
}

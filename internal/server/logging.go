package server

import (
	"context"

	"github.com/aarongodin/spectral/internal/server/access"
	"github.com/twitchtv/twirp"
	"golang.org/x/exp/slog"
)

func NewLoggingHooks() *twirp.ServerHooks {
	return &twirp.ServerHooks{
		RequestRouted: func(ctx context.Context) (context.Context, error) {
			method, _ := twirp.MethodName(ctx)
			slog.Info("request_routed",
				slog.String("rpc", method),
				slog.String("sub", access.GetSubject(ctx)),
			)
			return ctx, nil
		},
		Error: func(ctx context.Context, twerr twirp.Error) context.Context {
			metaMap := twerr.MetaMap()
			attrs := make([]any, 0, len(metaMap)+1)
			attrs = append(attrs, slog.String("code", string(twerr.Code())))
			for m, v := range metaMap {
				attrs = append(attrs, slog.String(m, v))
			}
			slog.Error(twerr.Msg(), attrs...)
			return ctx
		},
	}
}

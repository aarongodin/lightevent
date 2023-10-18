package server

import (
	"context"

	"github.com/aarongodin/spectral/internal/server/access"
	"github.com/rs/zerolog/log"
	"github.com/twitchtv/twirp"
)

func NewLoggingHooks() *twirp.ServerHooks {
	return &twirp.ServerHooks{
		RequestRouted: func(ctx context.Context) (context.Context, error) {
			method, _ := twirp.MethodName(ctx)
			log.Info().
				Str("rpc", method).
				Str("sub", access.GetSubject(ctx)).
				Msg("request routed")
			return ctx, nil
		},
		Error: func(ctx context.Context, twerr twirp.Error) context.Context {
			metaMap := twerr.MetaMap()
			errLog := log.Error().Str("code", string(twerr.Code()))
			for m, v := range metaMap {
				errLog = errLog.Str(m, v)
			}
			errLog.Msg(twerr.Msg())
			return ctx
		},
	}
}

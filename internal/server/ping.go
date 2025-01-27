package server

import (
	"context"

	"github.com/aarongodin/lightevent/internal/server/access"
	"github.com/aarongodin/lightevent/internal/service"
)

func (s *Server) Ping(ctx context.Context, message *service.PingOptions) (*service.PingResult, error) {
	subject := access.GetSubject(ctx)
	return &service.PingResult{Sub: subject}, nil
}

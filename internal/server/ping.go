package server

import (
	"context"

	"connectrpc.com/connect"
	lighteventv1 "github.com/aarongodin/lightevent/internal/gen/lightevent/v1"
)

func (s *Server) Ping(ctx context.Context, _ *connect.Request[lighteventv1.PingRequest]) (*connect.Response[lighteventv1.PingResponse], error) {
	id := identity(ctx)
	return connect.NewResponse(&lighteventv1.PingResponse{
		SubjectUid:  id.SubjectUID,
		Scheme:      string(id.Scheme),
		DisplayName: id.Name,
	}), nil
}

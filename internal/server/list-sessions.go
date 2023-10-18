package server

import (
	"context"
	"time"

	"github.com/aarongodin/lightevent/internal/service"
)

func (s *Server) ListSessions(ctx context.Context, message *service.ListSessionsOptions) (*service.SessionList, error) {
	recs, err := s.queries.ListSessions(ctx, time.Now().Add(-s.rc.SessionMaxAge))
	if err != nil {
		return nil, errorResponse(err, "session")
	}
	sessions := make([]*service.Session, 0, len(recs))
	for _, rec := range recs {
		sessions = append(sessions, translateSession(rec))
	}
	return &service.SessionList{Sessions: sessions}, nil
}

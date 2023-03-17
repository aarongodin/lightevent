package server

import (
	"context"

	"github.com/aarongodin/spectral/internal/service"
)

func (s *Server) ListSessions(ctx context.Context, message *service.ListSessionsOptions) (*service.SessionList, error) {
	recs, err := s.Repo.Sessions.ListSessions()
	if err != nil {
		return nil, errorResponse(err, "session")
	}
	return &service.SessionList{Sessions: sessionRecordsToMessage(recs)}, nil
}

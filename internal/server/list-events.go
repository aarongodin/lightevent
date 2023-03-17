package server

import (
	"context"

	"github.com/aarongodin/spectral/internal/service"
)

func (s *Server) ListEvents(ctx context.Context, message *service.ListEventsOptions) (*service.EventList, error) {
	recs, err := s.Repo.Events.ListEvents()
	if err != nil {
		return nil, errorResponse(err, "event")
	}
	return &service.EventList{
		Events: eventRecordsToMessage(recs),
	}, nil
}

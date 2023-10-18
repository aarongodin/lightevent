package server

import (
	"context"

	"github.com/aarongodin/spectral/internal/service"
)

func (s *Server) ListEvents(ctx context.Context, message *service.ListEventsOptions) (*service.EventList, error) {
	recs, err := s.queries.ListEvents(ctx)
	if err != nil {
		return nil, errorResponse(err, "event")
	}

	events := make([]*service.Event, 0, len(recs))
	for _, rec := range recs {
		eventDates, err := s.queries.ListEventDates(ctx, rec.ID)
		if err != nil {
			return nil, errorResponse(err, "event")
		}
		event := translateEvent(rec)
		for _, eventDate := range eventDates {
			event.Dates = append(event.Dates, translateEventDate(eventDate))
		}
		events = append(events, event)
	}

	return &service.EventList{
		Events: events,
	}, nil
}

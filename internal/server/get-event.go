package server

import (
	"context"

	"github.com/aarongodin/spectral/internal/service"
)

func (s *Server) GetEvent(ctx context.Context, message *service.ByName) (*service.Event, error) {
	rec, err := s.queries.GetEventByName(ctx, message.Name)
	if err != nil {
		return nil, errorResponse(err, "event")
	}
	event := translateEvent(rec)
	eventDates, err := s.queries.ListEventDates(ctx, rec.ID)
	if err != nil {
		return nil, errorResponse(err, "event")
	}
	for _, eventDate := range eventDates {
		event.Dates = append(event.Dates, translateEventDate(eventDate))
	}
	return event, nil
}

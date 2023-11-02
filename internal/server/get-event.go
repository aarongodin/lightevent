package server

import (
	"context"

	"github.com/aarongodin/lightevent/internal/server/access"
	"github.com/aarongodin/lightevent/internal/service"
	"github.com/twitchtv/twirp"
)

func (s *Server) GetEvent(ctx context.Context, message *service.ByName) (*service.Event, error) {
	authScheme := access.GetScheme(ctx)
	rec, err := s.queries.GetEventByName(ctx, message.Name)
	if err != nil {
		return nil, errorResponse(err, "event")
	}

	if rec.Hidden == 1 && authScheme != access.AUTHZ_SCHEME_USER && authScheme != access.AUTHZ_SCHEME_API_KEY {
		return nil, twirp.NotFoundError("event not found")
	}

	event := translateEvent(rec)
	eventDates, err := s.queries.ListEventDatesByEventID(ctx, rec.ID)
	if err != nil {
		return nil, errorResponse(err, "event")
	}
	for _, eventDate := range eventDates {
		event.Dates = append(event.Dates, translateEventDate(eventDate))
	}
	return event, nil
}

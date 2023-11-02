package server

import (
	"context"

	"github.com/aarongodin/lightevent/internal/server/access"
	"github.com/aarongodin/lightevent/internal/service"
	"github.com/aarongodin/lightevent/internal/storage"
)

func (s *Server) ListEvents(ctx context.Context, message *service.ListEventsOptions) (*service.EventList, error) {
	authScheme := access.GetScheme(ctx)
	var recs []storage.Event
	var err error

	if authScheme == access.AUTHZ_SCHEME_ANONYMOUS || authScheme == access.AUTHZ_SCHEME_MEMBER {
		recs, err = s.queries.ListVisibleEvents(ctx)
	} else {
		recs, err = s.queries.ListEvents(ctx)
	}
	if err != nil {
		return nil, errorResponse(err, "events")
	}

	events := make([]*service.Event, 0, len(recs))
	for _, rec := range recs {
		eventDates, err := s.queries.ListEventDatesByEventID(ctx, rec.ID)
		if err != nil {
			return nil, errorResponse(err, "event dates")
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

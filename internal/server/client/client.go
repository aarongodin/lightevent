package client

import (
	"embed"
	"html/template"
	"net/http"

	"github.com/aarongodin/lightevent/internal/config"
	"github.com/aarongodin/lightevent/internal/storage"
	"github.com/julienschmidt/httprouter"
)

//go:embed static/*.html
var staticHTML embed.FS

type clientRoutes struct {
	queries *storage.Queries
	rc      *config.RuntimeConfig
	tmpl    *template.Template
}

type listEventsData struct {
	Events []storage.Event
}

type getEventData struct {
	Event storage.Event
}

func (cr clientRoutes) handleListEvents(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	events, err := cr.queries.ListVisibleEvents(r.Context())
	if err != nil {
		// todo
		return
	}
	if err := cr.tmpl.ExecuteTemplate(w, "list-events.html", listEventsData{Events: events}); err != nil {
		// todo
		return
	}
	w.Header().Add("content-type", "text/html")
	w.WriteHeader(http.StatusOK)
}

func (cr clientRoutes) handleGetEvent(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
	event, err := cr.queries.GetEventByName(r.Context(), p.ByName("name"))
	if err != nil {
		// todo
		return
	}
	if err := cr.tmpl.ExecuteTemplate(w, "get-event.html", getEventData{Event: event}); err != nil {
		// todo
		return
	}
	w.Header().Add("content-type", "text/html")
	w.WriteHeader(http.StatusOK)
}

func Register(router *httprouter.Router, queries *storage.Queries, rc *config.RuntimeConfig) error {
	tmpl, err := template.ParseFS(staticHTML, "static/*.html")
	if err != nil {
		return err
	}

	routes := &clientRoutes{
		queries: queries,
		rc:      rc,
		tmpl:    tmpl,
	}

	router.GET("/client/events", routes.handleListEvents)
	router.GET("/client/event/:name", routes.handleGetEvent)

	return nil
}

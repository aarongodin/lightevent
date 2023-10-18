package access

import (
	_ "embed"
	"fmt"
	"html/template"
	"net/http"
	"net/url"

	"github.com/aarongodin/lightevent/internal/config"
	"github.com/aarongodin/lightevent/internal/storage"
	"github.com/julienschmidt/httprouter"
	"github.com/rs/zerolog/log"
	"github.com/twitchtv/twirp"
)

//go:embed static/login.html.tmpl
var loginHTML string

//go:embed static/login.css
var loginCSS string

type accessRoutes struct {
	queries       *storage.Queries
	rc            *config.RuntimeConfig
	loginTemplate *template.Template
}

type loginData struct {
	Styles template.CSS
	Err    string
}

// handleAuthentication processes the form post from the login page
func (ar accessRoutes) handleAuthentication(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
	if err := r.ParseForm(); err != nil {
		http.Error(w, "invalid form data", 400)
		return
	}

	username := r.Form.Get("username")
	password := r.Form.Get("password")

	if username == "" || password == "" {
		http.Error(w, "username and password required", 400)
		return
	}

	session, err := ar.authenticateUser(r.Context(), username, password)
	if err != nil {
		log.Debug().Err(err).Msg("authenticate user error")
		redirectPath := fmt.Sprintf("/login?err=%s", url.QueryEscape(err.Error()))
		http.Redirect(w, r, redirectPath, http.StatusSeeOther)
		return
	}

	SetCookie(w, &http.Cookie{
		Name:     COOKIE_USER_SESSION,
		Value:    session.Key,
		HttpOnly: true,
		// TODO(aarongodin): enable this when local dev is using ssl
		// Secure:   true,
		Path:     "/",
		SameSite: http.SameSiteLaxMode,
	})
	http.Redirect(w, r, "/", http.StatusSeeOther)
}

// handleLogin renders a login page to the user
func (ar accessRoutes) handleLogin(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
	// TODO(aarongodin): CSRF protection
	data := loginData{Styles: template.CSS(loginCSS)}
	q := r.URL.Query()
	if q.Has("err") {
		data.Err = q.Get("err")
	}
	w.Header().Add("content-type", "text/html")
	w.WriteHeader(http.StatusOK)
	if err := ar.loginTemplate.Execute(w, &data); err != nil {
		twirp.WriteError(w, err)
		return
	}
}

// Register attaches the route handlers to the given router
func Register(router *httprouter.Router, queries *storage.Queries, rc *config.RuntimeConfig) error {
	loginTemplate, err := template.New("login").Parse(loginHTML)
	if err != nil {
		return err
	}

	routes := &accessRoutes{
		queries:       queries,
		rc:            rc,
		loginTemplate: loginTemplate,
	}

	router.GET("/login", routes.handleLogin)
	router.POST("/auth/login", routes.handleAuthentication)

	if rc.AllowAdminUser {
		log.Info().Msg("admin user enabled")
	}

	return nil
}

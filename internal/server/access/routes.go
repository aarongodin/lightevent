package access

import (
	_ "embed"
	"html/template"
	"net/http"

	"github.com/aarongodin/spectral/internal/server/config"
	"github.com/aarongodin/spectral/internal/server/repository"
	"github.com/julienschmidt/httprouter"
	"github.com/twitchtv/twirp"
	"golang.org/x/exp/slog"
)

//go:embed static/login.html
var loginHTML string

//go:embed static/login.css
var loginCSS string

type accessRoutes struct {
	repo          *repository.Repository
	rc            *config.RuntimeConfig
	loginTemplate *template.Template
}

type loginData struct {
	Styles template.CSS
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

	session, err := ar.authenticateUser(username, password)
	if err != nil {
		slog.Debug("authenticate user error", slog.Any("err", err))
		http.Redirect(w, r, "/login", http.StatusUnauthorized)
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
	w.Header().Add("content-type", "text/html")
	w.WriteHeader(http.StatusOK)
	data := loginData{Styles: template.CSS(loginCSS)}
	if err := ar.loginTemplate.Execute(w, &data); err != nil {
		twirp.WriteError(w, err)
		return
	}
}

// Register attaches the route handlers to the given router
func Register(router *httprouter.Router, repo *repository.Repository, rc *config.RuntimeConfig) error {
	loginTemplate, err := template.New("login").Parse(loginHTML)
	if err != nil {
		return err
	}

	routes := &accessRoutes{
		repo:          repo,
		rc:            rc,
		loginTemplate: loginTemplate,
	}

	router.GET("/login", routes.handleLogin)
	router.POST("/auth/login", routes.handleAuthentication)

	if rc.AllowAdminUser {
		slog.Info("admin user enabled")
	}

	return nil
}

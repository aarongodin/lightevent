package access

import (
	"net/http"

	"github.com/aarongodin/spectral/internal/server/config"
	"github.com/aarongodin/spectral/internal/server/repository"
	"github.com/julienschmidt/httprouter"
	"golang.org/x/exp/slog"
)

type accessRoutes struct {
	repo *repository.Repository
	rc   *config.RuntimeConfig
}

func (ar accessRoutes) handleLogin(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
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
		// Secure:   true,
		Path:     "/",
		SameSite: http.SameSiteLaxMode,
	})
	http.Redirect(w, r, "/", http.StatusSeeOther)
}

func Register(router *httprouter.Router, repo *repository.Repository, rc *config.RuntimeConfig) {
	routes := &accessRoutes{repo: repo, rc: rc}
	router.POST("/auth/login", routes.handleLogin)

	if rc.AllowAdminUser {
		slog.Info("admin user enabled")
	}
}

package access

import (
	_ "embed"
	"html/template"
	"net/http"
	"strings"
	"time"

	"github.com/aarongodin/lightevent/internal/config"
	"github.com/aarongodin/lightevent/internal/ratelimit"
	"github.com/aarongodin/lightevent/internal/storage"
	"github.com/rs/zerolog/log"
)

//go:embed static/login.html.tmpl
var loginHTML string

//go:embed static/login.css
var loginCSS []byte

// loginErrors maps the error codes used in the login redirect to messages. Only known codes are rendered,
// so the query string cannot inject arbitrary text into the page.
var loginErrors = map[string]string{
	"invalid":      "Invalid username or password.",
	"rate_limited": "Too many sign-in attempts. Please wait a few minutes and try again.",
	"internal":     "Something went wrong. Please try again.",
}

// Routes serves the login page and the login/logout endpoints for users.
type Routes struct {
	q         *storage.Queries
	rc        *config.RuntimeConfig
	now       func() time.Time
	tmpl      *template.Template
	ipLimit   *ratelimit.Limiter
	userLimit *ratelimit.Limiter
}

// NewRoutes returns the user login routes.
func NewRoutes(q *storage.Queries, rc *config.RuntimeConfig, now func() time.Time) (*Routes, error) {
	tmpl, err := template.New("login").Parse(loginHTML)
	if err != nil {
		return nil, err
	}
	return &Routes{
		q:         q,
		rc:        rc,
		now:       now,
		tmpl:      tmpl,
		ipLimit:   ratelimit.New(30, 15*time.Minute),
		userLimit: ratelimit.New(10, 15*time.Minute),
	}, nil
}

// Register attaches the routes to mux.
func (rt *Routes) Register(mux *http.ServeMux) {
	mux.HandleFunc("GET /login", rt.handleLoginPage)
	mux.HandleFunc("GET /login.css", rt.handleLoginCSS)
	mux.HandleFunc("POST /auth/login", rt.handleLogin)
	mux.HandleFunc("POST /auth/logout", rt.handleLogout)
}

func (rt *Routes) handleLoginCSS(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "text/css; charset=utf-8")
	w.Header().Set("Cache-Control", "public, max-age=3600")
	w.Write(loginCSS) //nolint:errcheck
}

func (rt *Routes) handleLoginPage(w http.ResponseWriter, r *http.Request) {
	// Skip the login page when the user already has a valid session.
	if sess, err := sessionFromCookie(r.Context(), rt.q, r.Header, SessionKindUser, rt.now()); err == nil && sess != nil {
		http.Redirect(w, r, "/", http.StatusSeeOther)
		return
	}
	data := struct{ Error string }{Error: loginErrors[r.URL.Query().Get("error")]}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	if err := rt.tmpl.Execute(w, data); err != nil {
		log.Err(err).Msg("error rendering login page")
	}
}

func redirectLoginError(w http.ResponseWriter, r *http.Request, code string) {
	http.Redirect(w, r, "/login?error="+code, http.StatusSeeOther)
}

func (rt *Routes) handleLogin(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, 8<<10)
	if err := r.ParseForm(); err != nil {
		http.Error(w, "invalid form data", http.StatusBadRequest)
		return
	}
	username := strings.TrimSpace(r.PostForm.Get("username"))
	password := r.PostForm.Get("password")
	if username == "" || password == "" {
		redirectLoginError(w, r, "invalid")
		return
	}

	ipKey := ClientIP(r.Context())
	userKey := strings.ToLower(username)
	if !rt.ipLimit.Allow(ipKey) || !rt.userLimit.Allow(userKey) {
		log.Warn().Str("ip", ipKey).Str("username", username).Msg("login rate limited")
		redirectLoginError(w, r, "rate_limited")
		return
	}

	user, err := rt.q.GetUserByUsername(r.Context(), username)
	switch {
	case err == nil:
		if !CheckPassword(user.PasswordHash, password) {
			redirectLoginError(w, r, "invalid")
			return
		}
	case isNoRows(err):
		CheckPassword(string(dummyHash), password)
		redirectLoginError(w, r, "invalid")
		return
	default:
		log.Err(err).Msg("error reading user")
		redirectLoginError(w, r, "internal")
		return
	}

	token, _, err := CreateSession(r.Context(), rt.q, SessionKindUser, user.Uid, rt.now(), rt.rc.SessionMaxAge)
	if err != nil {
		log.Err(err).Msg("error creating session")
		redirectLoginError(w, r, "internal")
		return
	}
	rt.userLimit.Reset(userKey)
	http.SetCookie(w, NewSessionCookie(SessionKindUser, token, rt.rc.SessionMaxAge, rt.rc.CookieSecure))
	log.Info().Str("username", user.Username).Msg("user signed in")
	http.Redirect(w, r, "/", http.StatusSeeOther)
}

func (rt *Routes) handleLogout(w http.ResponseWriter, r *http.Request) {
	sess, err := sessionFromCookie(r.Context(), rt.q, r.Header, SessionKindUser, rt.now())
	if err != nil {
		log.Err(err).Msg("error reading session for logout")
	}
	if sess != nil {
		if err := rt.q.DeleteSession(r.Context(), sess.ID); err != nil {
			log.Err(err).Msg("error deleting session")
		}
	}
	http.SetCookie(w, ClearSessionCookie(SessionKindUser, rt.rc.CookieSecure))
	w.WriteHeader(http.StatusNoContent)
}

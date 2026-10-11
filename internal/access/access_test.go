package access

import (
	"context"
	"net/http"
	"net/http/httptest"
	"net/url"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"connectrpc.com/connect"
	"github.com/aarongodin/lightevent/internal/config"
	"github.com/aarongodin/lightevent/internal/secret"
	"github.com/aarongodin/lightevent/internal/storage"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

var now = time.Date(2027, 1, 1, 12, 0, 0, 0, time.UTC)

func clock() time.Time { return now }

type fixture struct {
	q          *storage.Queries
	userUID    string
	memberUID  string
	userToken  string
	memberTok  string
	apiKey     string
	expiredTok string
}

func newFixture(t *testing.T) *fixture {
	t.Helper()
	ctx := context.Background()
	store, err := storage.Open(ctx, filepath.Join(t.TempDir(), "test.sqlite3"))
	require.NoError(t, err)
	t.Cleanup(func() { store.Close() })
	q := store.Queries

	hash, err := HashPassword("correct horse battery")
	require.NoError(t, err)
	user, err := q.CreateUser(ctx, storage.CreateUserParams{Uid: secret.UID(), Username: "jane", PasswordHash: hash, CreatedAt: now})
	require.NoError(t, err)
	member, err := q.CreateMember(ctx, storage.CreateMemberParams{Uid: secret.UID(), Email: "m@example.com", Verified: 1, CreatedAt: now})
	require.NoError(t, err)

	f := &fixture{q: q, userUID: user.Uid, memberUID: member.Uid, apiKey: "le_testkey"}
	f.userToken, _, err = CreateSession(ctx, q, SessionKindUser, user.Uid, now, time.Hour)
	require.NoError(t, err)
	f.memberTok, _, err = CreateSession(ctx, q, SessionKindMember, member.Uid, now, time.Hour)
	require.NoError(t, err)
	f.expiredTok, _, err = CreateSession(ctx, q, SessionKindUser, user.Uid, now.Add(-2*time.Hour), time.Hour)
	require.NoError(t, err)
	_, err = q.CreateAPIKey(ctx, storage.CreateAPIKeyParams{Uid: secret.UID(), Name: "zapier", Prefix: "le_tes", SecretHash: secret.Hash(f.apiKey), CreatedAt: now})
	require.NoError(t, err)
	return f
}

func header(kv ...string) http.Header {
	h := http.Header{}
	for i := 0; i < len(kv); i += 2 {
		h.Add(kv[i], kv[i+1])
	}
	return h
}

func TestPolicyCoversEveryMethod(t *testing.T) {
	methods := ServiceMethods()
	require.NotEmpty(t, methods)
	for _, m := range methods {
		_, ok := Policy[m]
		assert.True(t, ok, "method %s has no access policy", m)
	}
	assert.Len(t, Policy, len(methods), "policy contains entries for methods that do not exist")
}

func TestPolicyExpectations(t *testing.T) {
	assert.True(t, Policy["ListEvents"].Has(SchemeAnonymous))
	assert.False(t, Policy["CreateEvent"].Has(SchemeMember))
	assert.False(t, Policy["CreateEvent"].Has(SchemeAnonymous))
	assert.True(t, Policy["CreateEvent"].Has(SchemeAPIKey))
	// Regression: member-only RPCs must not be callable with user or API key credentials.
	for _, m := range []string{"GetMyProfile", "Register", "ListMyRegistrations", "CancelMyRegistration", "EndMemberSession"} {
		assert.True(t, Policy[m].Has(SchemeMember), m)
		assert.False(t, Policy[m].Has(SchemeUser), m)
		assert.False(t, Policy[m].Has(SchemeAPIKey), m)
		assert.False(t, Policy[m].Has(SchemeAnonymous), m)
	}
	assert.False(t, Allow(0).Has("other"))
}

func TestAuthenticate(t *testing.T) {
	f := newFixture(t)
	auth := NewAuthenticator(f.q, clock)
	ctx := context.Background()

	tests := []struct {
		name       string
		header     http.Header
		allow      Allow
		wantScheme Scheme
		wantCode   connect.Code
	}{
		{"anonymous allowed", header(), allowEveryone, SchemeAnonymous, 0},
		{"anonymous rejected", header(), allowAdmin, "", connect.CodeUnauthenticated},
		{"api key", header("Authorization", "Bearer "+f.apiKey), allowAdmin, SchemeAPIKey, 0},
		{"api key lower-case scheme", header("Authorization", "bearer "+f.apiKey), allowAdmin, SchemeAPIKey, 0},
		{"invalid api key", header("Authorization", "Bearer nope"), allowAdmin, "", connect.CodeUnauthenticated},
		{"malformed authorization", header("Authorization", "Basic abc"), allowAdmin, "", connect.CodeUnauthenticated},
		{"api key ignored for member rpc", header("Authorization", "Bearer "+f.apiKey), AllowMember, "", connect.CodeUnauthenticated},
		{"user cookie", header("Cookie", CookieUserSession+"="+f.userToken), allowAdmin, SchemeUser, 0},
		{"expired user cookie", header("Cookie", CookieUserSession+"="+f.expiredTok), allowAdmin, "", connect.CodeUnauthenticated},
		{"unknown user cookie", header("Cookie", CookieUserSession+"=bogus"), allowAdmin, "", connect.CodeUnauthenticated},
		{"member cookie", header("Cookie", CookieMemberSession+"="+f.memberTok), AllowMember, SchemeMember, 0},
		{"member cookie rejected for admin rpc", header("Cookie", CookieMemberSession+"="+f.memberTok), allowAdmin, "", connect.CodeUnauthenticated},
		{"user token in member cookie is rejected", header("Cookie", CookieMemberSession+"="+f.userToken), AllowMember, "", connect.CodeUnauthenticated},
		{"member token in user cookie is rejected", header("Cookie", CookieUserSession+"="+f.memberTok), allowAdmin, "", connect.CodeUnauthenticated},
		{"user rpc chooses user cookie when both present",
			header("Cookie", CookieUserSession+"="+f.userToken+"; "+CookieMemberSession+"="+f.memberTok), allowAuthenticated, SchemeUser, 0},
		{"member rpc chooses member cookie when both present",
			header("Cookie", CookieUserSession+"="+f.userToken+"; "+CookieMemberSession+"="+f.memberTok), AllowMember, SchemeMember, 0},
		{"user cookie for member rpc", header("Cookie", CookieUserSession+"="+f.userToken), AllowMember, "", connect.CodeUnauthenticated},
		{"member bearer token", header("Authorization", "Bearer "+MemberBearerToken(f.memberTok)), AllowMember, SchemeMember, 0},
		{"member bearer token for public rpc", header("Authorization", "Bearer "+MemberBearerToken(f.memberTok)), allowEveryone, SchemeMember, 0},
		{"unknown member bearer token", header("Authorization", "Bearer "+MemberBearerToken("bogus")), allowEveryone, "", connect.CodeUnauthenticated},
		{"user token as member bearer token", header("Authorization", "Bearer "+MemberBearerToken(f.userToken)), AllowMember, "", connect.CodeUnauthenticated},
		{"member bearer token without prefix is an api key", header("Authorization", "Bearer "+f.memberTok), allowEveryone, "", connect.CodeUnauthenticated},
		{"member bearer token ignored for admin rpc", header("Authorization", "Bearer "+MemberBearerToken(f.memberTok)), allowAdmin, "", connect.CodeUnauthenticated},
		{"member bearer token ignored for admin rpc with user cookie",
			header("Authorization", "Bearer "+MemberBearerToken(f.memberTok), "Cookie", CookieUserSession+"="+f.userToken), allowAdmin, SchemeUser, 0},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			id, err := auth.Authenticate(ctx, tt.header, tt.allow)
			if tt.wantCode != 0 {
				require.Error(t, err)
				assert.Equal(t, tt.wantCode, connect.CodeOf(err))
				return
			}
			require.NoError(t, err)
			assert.Equal(t, tt.wantScheme, id.Scheme)
		})
	}

	id, err := auth.Authenticate(ctx, header("Cookie", CookieUserSession+"="+f.userToken), allowAdmin)
	require.NoError(t, err)
	assert.Equal(t, "jane", id.Name)
	assert.Equal(t, f.userUID, id.SubjectUID)
	assert.NotZero(t, id.SessionID)
	assert.True(t, id.IsAdmin())

	// API key usage is recorded.
	_, err = auth.Authenticate(ctx, header("Authorization", "Bearer "+f.apiKey), allowAdmin)
	require.NoError(t, err)
	key, err := f.q.GetAPIKeyBySecretHash(ctx, secret.Hash(f.apiKey))
	require.NoError(t, err)
	assert.True(t, key.LastUsedAt.Valid)
}

func TestIdentityContext(t *testing.T) {
	assert.Equal(t, SchemeAnonymous, IdentityFrom(context.Background()).Scheme)
	ctx := WithIdentity(context.Background(), Identity{Scheme: SchemeMember, Name: "m"})
	assert.Equal(t, "m", IdentityFrom(ctx).Name)
	assert.False(t, IdentityFrom(ctx).IsAdmin())
}

func TestSessionCookies(t *testing.T) {
	c := NewSessionCookie(SessionKindUser, "tok", time.Hour, true)
	assert.Equal(t, CookieUserSession, c.Name)
	assert.Equal(t, http.SameSiteStrictMode, c.SameSite)
	assert.True(t, c.HttpOnly)
	assert.True(t, c.Secure)
	assert.Equal(t, 3600, c.MaxAge)

	m := NewSessionCookie(SessionKindMember, "tok", time.Hour, false)
	assert.Equal(t, CookieMemberSession, m.Name)
	assert.Equal(t, http.SameSiteLaxMode, m.SameSite)
	assert.False(t, m.Secure)

	cleared := ClearSessionCookie(SessionKindUser, true)
	assert.Equal(t, -1, cleared.MaxAge)
	assert.Empty(t, cleared.Value)
}

func TestClientIP(t *testing.T) {
	r := httptest.NewRequest(http.MethodGet, "/", nil)
	r.RemoteAddr = "10.0.0.1:1234"
	r.Header.Set("X-Forwarded-For", "1.2.3.4, 10.0.0.1")
	r.Header.Set("X-Real-IP", "5.6.7.8")
	assert.Equal(t, "10.0.0.1", clientIP(r, false))
	assert.Equal(t, "1.2.3.4", clientIP(r, true))
	r.Header.Del("X-Forwarded-For")
	assert.Equal(t, "5.6.7.8", clientIP(r, true))
	r.RemoteAddr = "garbage"
	assert.Equal(t, "garbage", clientIP(r, false))

	var got string
	h := ClientIPMiddleware(false, http.HandlerFunc(func(_ http.ResponseWriter, r *http.Request) { got = ClientIP(r.Context()) }))
	r.RemoteAddr = "9.9.9.9:1"
	h.ServeHTTP(httptest.NewRecorder(), r)
	assert.Equal(t, "9.9.9.9", got)
	assert.Equal(t, "unknown", ClientIP(context.Background()))
}

func TestBootstrap(t *testing.T) {
	ctx := context.Background()
	store, err := storage.Open(ctx, filepath.Join(t.TempDir(), "test.sqlite3"))
	require.NoError(t, err)
	defer store.Close()

	created, err := Bootstrap(ctx, store.Queries, &config.RuntimeConfig{}, now)
	require.NoError(t, err)
	assert.False(t, created, "nothing is created without bootstrap variables")

	_, err = Bootstrap(ctx, store.Queries, &config.RuntimeConfig{BootstrapUsername: "x", BootstrapPassword: "correct horse battery"}, now)
	assert.Error(t, err, "invalid username")
	_, err = Bootstrap(ctx, store.Queries, &config.RuntimeConfig{BootstrapUsername: "root", BootstrapPassword: "short"}, now)
	assert.Error(t, err, "short password")

	rc := &config.RuntimeConfig{BootstrapUsername: "root", BootstrapPassword: "correct horse battery"}
	created, err = Bootstrap(ctx, store.Queries, rc, now)
	require.NoError(t, err)
	assert.True(t, created)
	user, err := store.Queries.GetUserByUsername(ctx, "root")
	require.NoError(t, err)
	assert.True(t, CheckPassword(user.PasswordHash, "correct horse battery"))

	created, err = Bootstrap(ctx, store.Queries, rc, now)
	require.NoError(t, err)
	assert.False(t, created, "users already exist")
}

func newRoutes(t *testing.T, f *fixture) (*Routes, *http.ServeMux) {
	t.Helper()
	rt, err := NewRoutes(f.q, &config.RuntimeConfig{SessionMaxAge: time.Hour, CookieSecure: true}, clock)
	require.NoError(t, err)
	mux := http.NewServeMux()
	rt.Register(mux)
	return rt, mux
}

func login(mux http.Handler, username, password string) *httptest.ResponseRecorder {
	form := url.Values{"username": {username}, "password": {password}}
	r := httptest.NewRequest(http.MethodPost, "/auth/login", strings.NewReader(form.Encode()))
	r.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	w := httptest.NewRecorder()
	ClientIPMiddleware(false, mux).ServeHTTP(w, r)
	return w
}

func TestLogin(t *testing.T) {
	f := newFixture(t)
	_, mux := newRoutes(t, f)

	w := login(mux, "jane", "correct horse battery")
	assert.Equal(t, http.StatusSeeOther, w.Code)
	assert.Equal(t, "/", w.Header().Get("Location"))
	cookies := w.Result().Cookies()
	require.Len(t, cookies, 1)
	assert.Equal(t, CookieUserSession, cookies[0].Name)
	assert.True(t, cookies[0].Secure)
	assert.True(t, cookies[0].HttpOnly)

	id, err := NewAuthenticator(f.q, clock).Authenticate(context.Background(), header("Cookie", cookies[0].Name+"="+cookies[0].Value), allowAdmin)
	require.NoError(t, err)
	assert.Equal(t, "jane", id.Name)

	// Usernames are case-insensitive.
	assert.Equal(t, "/", login(mux, "JANE", "correct horse battery").Header().Get("Location"))

	for _, tt := range [][2]string{{"jane", "wrong"}, {"nobody", "correct horse battery"}, {"", ""}} {
		w := login(mux, tt[0], tt[1])
		assert.Equal(t, "/login?error=invalid", w.Header().Get("Location"), tt)
		assert.Empty(t, w.Result().Cookies())
	}
}

func TestLoginRateLimit(t *testing.T) {
	f := newFixture(t)
	_, mux := newRoutes(t, f)
	var w *httptest.ResponseRecorder
	for i := 0; i < 11; i++ {
		w = login(mux, "jane", "wrong")
	}
	assert.Equal(t, "/login?error=rate_limited", w.Header().Get("Location"))
	assert.Equal(t, "/login?error=rate_limited", login(mux, "jane", "correct horse battery").Header().Get("Location"))
}

func TestLoginPage(t *testing.T) {
	f := newFixture(t)
	_, mux := newRoutes(t, f)

	get := func(path string, h http.Header) *httptest.ResponseRecorder {
		r := httptest.NewRequest(http.MethodGet, path, nil)
		for k, v := range h {
			r.Header[k] = v
		}
		w := httptest.NewRecorder()
		mux.ServeHTTP(w, r)
		return w
	}

	w := get("/login?error=invalid", nil)
	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, w.Body.String(), "Invalid username or password.")
	assert.Equal(t, "no-store", w.Header().Get("Cache-Control"))

	w = get("/login?error=<script>alert(1)</script>", nil)
	assert.NotContains(t, w.Body.String(), "alert(1)", "unknown error codes are not rendered")
	assert.NotContains(t, w.Body.String(), "role=\"alert\"")

	w = get("/login", header("Cookie", CookieUserSession+"="+f.userToken))
	assert.Equal(t, http.StatusSeeOther, w.Code, "signed-in users skip the login page")

	w = get("/login.css", nil)
	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, w.Header().Get("Content-Type"), "text/css")
}

func TestLogout(t *testing.T) {
	f := newFixture(t)
	_, mux := newRoutes(t, f)

	logout := func(h http.Header) *httptest.ResponseRecorder {
		r := httptest.NewRequest(http.MethodPost, "/auth/logout", nil)
		for k, v := range h {
			r.Header[k] = v
		}
		w := httptest.NewRecorder()
		mux.ServeHTTP(w, r)
		return w
	}

	// Regression: logging out without a session must not panic.
	w := logout(nil)
	assert.Equal(t, http.StatusNoContent, w.Code)

	w = logout(header("Cookie", CookieUserSession+"="+f.userToken))
	assert.Equal(t, http.StatusNoContent, w.Code)
	require.Len(t, w.Result().Cookies(), 1)
	assert.Equal(t, -1, w.Result().Cookies()[0].MaxAge)

	_, err := NewAuthenticator(f.q, clock).Authenticate(context.Background(), header("Cookie", CookieUserSession+"="+f.userToken), allowAdmin)
	assert.Equal(t, connect.CodeUnauthenticated, connect.CodeOf(err), "session is deleted")
}

func TestPasswords(t *testing.T) {
	h, err := HashPassword("a long password")
	require.NoError(t, err)
	assert.True(t, CheckPassword(h, "a long password"))
	assert.False(t, CheckPassword(h, "other"))
	assert.False(t, CheckPassword("not a hash", "x"))
}

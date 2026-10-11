package app

import (
	"context"
	"net/http"
	"net/http/cookiejar"
	"net/http/httptest"
	"net/url"
	"path/filepath"
	"strings"
	"testing"
	"testing/fstest"
	"time"

	"connectrpc.com/connect"
	"github.com/aarongodin/lightevent/internal/access"
	"github.com/aarongodin/lightevent/internal/config"
	lighteventv1 "github.com/aarongodin/lightevent/internal/gen/lightevent/v1"
	"github.com/aarongodin/lightevent/internal/gen/lightevent/v1/lighteventv1connect"
	"github.com/aarongodin/lightevent/internal/provider/email"
	"github.com/aarongodin/lightevent/internal/storage"
	"github.com/rs/zerolog"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"golang.org/x/crypto/bcrypt"
)

func init() {
	zerolog.SetGlobalLevel(zerolog.Disabled)
	access.BcryptCost = bcrypt.MinCost
}

const password = "correct horse battery"

func newApp(t *testing.T, configure ...func(*config.RuntimeConfig)) (*App, *httptest.Server) {
	t.Helper()
	rc := &config.RuntimeConfig{
		DatabaseFile:      filepath.Join(t.TempDir(), "test.sqlite3"),
		SessionMaxAge:     time.Hour,
		VerificationTTL:   15 * time.Minute,
		BootstrapUsername: "admin-user",
		BootstrapPassword: password,
	}
	for _, fn := range configure {
		fn(rc)
	}
	a, err := New(context.Background(), rc, Options{
		Sender:    &email.LogSender{},
		AdminUI:   fstest.MapFS{"index.html": {Data: []byte("<html>admin</html>")}},
		ClientApp: fstest.MapFS{"lightevent-client.js": {Data: []byte("var LightEventClient={}")}},
	})
	require.NoError(t, err)
	srv := httptest.NewServer(a.Handler())
	t.Cleanup(func() {
		srv.Close()
		a.Close(context.Background())
	})
	return a, srv
}

func browserClient(t *testing.T) *http.Client {
	jar, err := cookiejar.New(nil)
	require.NoError(t, err)
	return &http.Client{Jar: jar, CheckRedirect: func(*http.Request, []*http.Request) error { return http.ErrUseLastResponse }}
}

func TestLoginThenCallRPC(t *testing.T) {
	_, srv := newApp(t)
	client := browserClient(t)

	resp, err := client.PostForm(srv.URL+"/auth/login", url.Values{"username": {"admin-user"}, "password": {password}})
	require.NoError(t, err)
	resp.Body.Close()
	assert.Equal(t, http.StatusSeeOther, resp.StatusCode)
	assert.Equal(t, "/", resp.Header.Get("Location"))

	rpc := lighteventv1connect.NewLightEventServiceClient(client, srv.URL+"/rpc")
	ping, err := rpc.Ping(context.Background(), connect.NewRequest(&lighteventv1.PingRequest{}))
	require.NoError(t, err)
	assert.Equal(t, "user", ping.Msg.Scheme)
	assert.Equal(t, "admin-user", ping.Msg.DisplayName)

	// JSON clients work too.
	req, err := http.NewRequest(http.MethodPost, srv.URL+"/rpc/lightevent.v1.LightEventService/ListEvents", strings.NewReader("{}"))
	require.NoError(t, err)
	req.Header.Set("Content-Type", "application/json")
	resp, err = client.Do(req)
	require.NoError(t, err)
	resp.Body.Close()
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	resp, err = client.Post(srv.URL+"/auth/logout", "", nil)
	require.NoError(t, err)
	resp.Body.Close()
	assert.Equal(t, http.StatusNoContent, resp.StatusCode)
	_, err = rpc.Ping(context.Background(), connect.NewRequest(&lighteventv1.PingRequest{}))
	assert.Equal(t, connect.CodeUnauthenticated, connect.CodeOf(err))
}

func TestCrossOriginRequestsAreRejected(t *testing.T) {
	_, srv := newApp(t)
	req, err := http.NewRequest(http.MethodPost, srv.URL+"/auth/login", strings.NewReader("username=admin-user&password=x"))
	require.NoError(t, err)
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("Sec-Fetch-Site", "cross-site")
	resp, err := http.DefaultClient.Do(req)
	require.NoError(t, err)
	resp.Body.Close()
	assert.Equal(t, http.StatusForbidden, resp.StatusCode)

	req, err = http.NewRequest(http.MethodPost, srv.URL+"/rpc/lightevent.v1.LightEventService/Ping", strings.NewReader("{}"))
	require.NoError(t, err)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Origin", "https://evil.example")
	resp, err = http.DefaultClient.Do(req)
	require.NoError(t, err)
	resp.Body.Close()
	assert.Equal(t, http.StatusForbidden, resp.StatusCode)
}

func TestStaticRoutesAndHeaders(t *testing.T) {
	_, srv := newApp(t)
	for path, want := range map[string]int{"/healthz": 200, "/": 200, "/events": 200, "/login": 200, "/login.css": 200} {
		resp, err := http.Get(srv.URL + path)
		require.NoError(t, err)
		resp.Body.Close()
		assert.Equal(t, want, resp.StatusCode, path)
		assert.NotEmpty(t, resp.Header.Get("Content-Security-Policy"), path)
	}
}

func rpcRequest(t *testing.T, method, url, origin string) *http.Response {
	t.Helper()
	req, err := http.NewRequest(method, url, strings.NewReader("{}"))
	require.NoError(t, err)
	req.Header.Set("Content-Type", "application/json")
	if origin != "" {
		req.Header.Set("Origin", origin)
		req.Header.Set("Sec-Fetch-Site", "cross-site")
	}
	if method == http.MethodOptions {
		req.Header.Set("Access-Control-Request-Method", "POST")
		req.Header.Set("Access-Control-Request-Headers", "authorization, connect-protocol-version, content-type")
	}
	resp, err := http.DefaultClient.Do(req)
	require.NoError(t, err)
	resp.Body.Close()
	return resp
}

func TestCORSForClientApp(t *testing.T) {
	a, srv := newApp(t, func(rc *config.RuntimeConfig) {
		rc.ClientAllowedOrigins = []string{"https://ENV.example.com:443"}
	})
	listEvents := srv.URL + "/rpc/lightevent.v1.LightEventService/ListEvents"

	// Origins from CLIENT_ALLOWED_ORIGINS are normalized and allowed.
	resp := rpcRequest(t, http.MethodOptions, listEvents, "https://env.example.com")
	assert.Equal(t, http.StatusNoContent, resp.StatusCode)
	assert.Equal(t, "https://env.example.com", resp.Header.Get("Access-Control-Allow-Origin"))
	assert.Contains(t, resp.Header.Get("Access-Control-Allow-Headers"), "Authorization")
	assert.Empty(t, resp.Header.Get("Access-Control-Allow-Credentials"))

	resp = rpcRequest(t, http.MethodPost, listEvents, "https://env.example.com")
	assert.Equal(t, http.StatusOK, resp.StatusCode)
	assert.Equal(t, "https://env.example.com", resp.Header.Get("Access-Control-Allow-Origin"))
	assert.Contains(t, resp.Header.Values("Vary"), "Origin")

	// Other origins get no CORS headers and are rejected by the cross-origin protection.
	resp = rpcRequest(t, http.MethodPost, listEvents, "https://www.example.com")
	assert.Equal(t, http.StatusForbidden, resp.StatusCode)
	assert.Empty(t, resp.Header.Get("Access-Control-Allow-Origin"))
	resp = rpcRequest(t, http.MethodOptions, listEvents, "https://www.example.com")
	assert.Empty(t, resp.Header.Get("Access-Control-Allow-Origin"))

	// Origins added in the client settings are allowed immediately.
	ctx := access.WithIdentity(context.Background(), access.Identity{Scheme: access.SchemeAPIKey})
	_, err := a.Server.UpdateClientSettings(ctx, connect.NewRequest(&lighteventv1.UpdateClientSettingsRequest{
		Settings: &lighteventv1.ClientSettings{AllowedOrigins: []string{"https://www.example.com"}},
	}))
	require.NoError(t, err)
	resp = rpcRequest(t, http.MethodPost, listEvents, "https://www.example.com")
	assert.Equal(t, http.StatusOK, resp.StatusCode)
	assert.Equal(t, "https://www.example.com", resp.Header.Get("Access-Control-Allow-Origin"))

	// Allowed origins only apply to the API, not to the login form.
	req, err := http.NewRequest(http.MethodPost, srv.URL+"/auth/login", strings.NewReader("username=admin-user&password=x"))
	require.NoError(t, err)
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("Origin", "https://www.example.com")
	req.Header.Set("Sec-Fetch-Site", "cross-site")
	resp, err = http.DefaultClient.Do(req)
	require.NoError(t, err)
	resp.Body.Close()
	assert.Equal(t, http.StatusForbidden, resp.StatusCode)
}

func TestInvalidClientAllowedOrigin(t *testing.T) {
	rc := &config.RuntimeConfig{
		DatabaseFile:         filepath.Join(t.TempDir(), "test.sqlite3"),
		ClientAllowedOrigins: []string{"www.example.com"},
	}
	_, err := New(context.Background(), rc, Options{Sender: &email.LogSender{}})
	assert.ErrorContains(t, err, "CLIENT_ALLOWED_ORIGINS")
}

func TestClientBundle(t *testing.T) {
	_, srv := newApp(t)
	resp, err := http.Get(srv.URL + "/client/lightevent-client.js")
	require.NoError(t, err)
	resp.Body.Close()
	assert.Equal(t, http.StatusOK, resp.StatusCode)
	assert.Equal(t, "text/javascript; charset=utf-8", resp.Header.Get("Content-Type"))
	assert.Equal(t, "cross-origin", resp.Header.Get("Cross-Origin-Resource-Policy"))
}

func TestRequestBodyLimit(t *testing.T) {
	_, srv := newApp(t)
	body := `{"email":"` + strings.Repeat("a", maxRequestBytes) + `@example.com"}`
	resp, err := http.Post(srv.URL+"/rpc/lightevent.v1.LightEventService/BeginVerification", "application/json", strings.NewReader(body))
	require.NoError(t, err)
	resp.Body.Close()
	assert.NotEqual(t, http.StatusOK, resp.StatusCode)
}

func TestCleanup(t *testing.T) {
	a, _ := newApp(t)
	ctx := context.Background()
	user, err := a.Store.Queries.GetUserByUsername(ctx, "admin-user")
	require.NoError(t, err)
	_, _, err = access.CreateSession(ctx, a.Store.Queries, access.SessionKindUser, user.Uid, time.Now().UTC().Add(-2*time.Hour), time.Hour)
	require.NoError(t, err)
	_, _, err = access.CreateSession(ctx, a.Store.Queries, access.SessionKindUser, user.Uid, time.Now().UTC(), time.Hour)
	require.NoError(t, err)

	a.Cleanup(ctx)
	all, err := a.Store.Queries.ListActiveSessions(ctx, storage.ListActiveSessionsParams{Now: time.Time{}})
	require.NoError(t, err)
	assert.Len(t, all, 1)

	runCtx, cancel := context.WithCancel(ctx)
	cancel()
	a.RunMaintenance(runCtx, time.Hour) // returns immediately once the context is done
}

func TestNewFailsForBadDatabasePath(t *testing.T) {
	_, err := New(context.Background(), &config.RuntimeConfig{DatabaseFile: filepath.Join(t.TempDir(), "missing", "dir", "db.sqlite3")}, Options{})
	assert.Error(t, err)
}

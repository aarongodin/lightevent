package access

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"connectrpc.com/connect"
	lighteventv1 "github.com/aarongodin/lightevent/internal/gen/lightevent/v1"
	"github.com/aarongodin/lightevent/internal/gen/lightevent/v1/lighteventv1connect"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// pingHandler echoes the identity seen by handlers; other methods are unimplemented.
type pingHandler struct {
	lighteventv1connect.UnimplementedLightEventServiceHandler
}

func (pingHandler) Ping(ctx context.Context, _ *connect.Request[lighteventv1.PingRequest]) (*connect.Response[lighteventv1.PingResponse], error) {
	id := IdentityFrom(ctx)
	return connect.NewResponse(&lighteventv1.PingResponse{Scheme: string(id.Scheme), DisplayName: id.Name}), nil
}

func (pingHandler) ListEvents(ctx context.Context, _ *connect.Request[lighteventv1.ListEventsRequest]) (*connect.Response[lighteventv1.ListEventsResponse], error) {
	return connect.NewResponse(&lighteventv1.ListEventsResponse{}), nil
}

func TestInterceptor(t *testing.T) {
	f := newFixture(t)
	policy := map[string]Allow{"Ping": allowAuthenticated, "ListEvents": allowEveryone}
	path, handler := lighteventv1connect.NewLightEventServiceHandler(pingHandler{},
		connect.WithInterceptors(NewInterceptor(NewAuthenticator(f.q, clock), policy)))
	mux := http.NewServeMux()
	mux.Handle(path, handler)
	srv := httptest.NewServer(mux)
	defer srv.Close()
	client := lighteventv1connect.NewLightEventServiceClient(srv.Client(), srv.URL)
	ctx := context.Background()

	_, err := client.Ping(ctx, connect.NewRequest(&lighteventv1.PingRequest{}))
	assert.Equal(t, connect.CodeUnauthenticated, connect.CodeOf(err))

	req := connect.NewRequest(&lighteventv1.PingRequest{})
	req.Header().Set("Authorization", "Bearer "+f.apiKey)
	resp, err := client.Ping(ctx, req)
	require.NoError(t, err)
	assert.Equal(t, "api-key", resp.Msg.Scheme)
	assert.Equal(t, "zapier", resp.Msg.DisplayName)

	req = connect.NewRequest(&lighteventv1.PingRequest{})
	req.Header().Set("Cookie", CookieUserSession+"="+f.userToken)
	resp, err = client.Ping(ctx, req)
	require.NoError(t, err)
	assert.Equal(t, "user", resp.Msg.Scheme)

	_, err = client.ListEvents(ctx, connect.NewRequest(&lighteventv1.ListEventsRequest{}))
	assert.NoError(t, err, "public rpc")

	// Methods without a policy are denied before reaching the handler.
	req2 := connect.NewRequest(&lighteventv1.CreateEventRequest{})
	req2.Header().Set("Authorization", "Bearer "+f.apiKey)
	_, err = client.CreateEvent(ctx, req2)
	assert.Equal(t, connect.CodePermissionDenied, connect.CodeOf(err))
}

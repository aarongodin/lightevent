// Access control uses an identity model with three discrete identity types:
// * Member
// * User
// * API Key
//
// Since there are multiple user-based access flows (one for the admin panel
// and another for the registration app), this gives us a more flexible approach by having sessions
// for each user-based identity type (Members and Users).
//
// The code below can authorize multiple identity types to access a given RPC from the API.
// For example, if an RPC is only allowed access to by Members, the "member" scheme will
// be executed to authorize the user based on the credentials required for a Member.
// If an RPC could be access by either Users or API Keys, each of those schemes will be
// executed. As long as one authorization scheme results in an authorized identity
// of that scheme, the request can be completed.

package access

import (
	"context"
	"database/sql"
	"errors"
	"net/http"
	"strings"

	"github.com/aarongodin/lightevent/internal/config"
	"github.com/aarongodin/lightevent/internal/server/twirputil"
	"github.com/aarongodin/lightevent/internal/storage"
	"github.com/twitchtv/twirp"
)

const (
	AUTHZ_SCHEME_ANONYMOUS = "anon"
	AUTHZ_SCHEME_MEMBER    = "member"
	AUTHZ_SCHEME_USER      = "user"
	AUTHZ_SCHEME_API_KEY   = "api-key"
	// accessMember allows only Members
	accessMember = byte(0b001)
	// accessAdmin allows only Users and API keys
	accessAdmin = byte(0b110)
	// accessAny allows any scheme
	accessAny = byte(0b111)
	// maskMember is the bitmask for checking whether the member authz scheme is enabled
	maskMember = 0b001
	// maskUser is the bitmask for checking whether the user authz scheme is enabled
	maskUser = 0b010
	// maskAPIKey is the bitmask for checking whether the API key authz scheme is enabled
	maskAPIKey = 0b100
)

type contextKey int

const (
	keySubject contextKey = iota + 1
	keyScheme
)

// PUBLIC_RPCS can be requested by anonymous identities.
// This type is a map to ensure o(1) lookup by RPC name
var PUBLIC_RPCS = map[string]bool{
	"BeginVerification":    true,
	"CompleteVerification": true,
	"ListEvents":           true,
	"GetEvent":             true,
}

func IsPublicRPC(method string) bool {
	_, exists := PUBLIC_RPCS[method]
	return exists
}

// GetSubject finds the string value for the identity subject authenticated on the request.
func GetSubject(ctx context.Context) string {
	v, ok := ctx.Value(keySubject).(string)
	if !ok {
		return ""
	}
	return v
}

// GetScheme finds the string value for the authorization scheme used on the request.
func GetScheme(ctx context.Context) string {
	v, ok := ctx.Value(keyScheme).(string)
	if !ok {
		return ""
	}
	return v
}

// allowSchemes is a helper for assigning access for a set of RPCs to authorization schemes
func allowSchemes(m map[string]byte, schemes byte, rpcs ...string) {
	for _, rpc := range rpcs {
		m[rpc] = schemes
	}
}

// GetAllowedSchemes provides a mapping of RPC method names to authorization schemes that are allowed access to the method.
func GetAllowedSchemes() map[string]byte {
	m := make(map[string]byte)

	allowSchemes(m, accessAny,
		"Ping", "GetRegistration", "ListEvents", "GetEvent",
	)

	allowSchemes(m, accessAdmin,
		"CreateEvent", "UpdateEvent", "CancelEventDate", "ListEventDates",
		"ListEventRegistrations", "CreateRegistration", "ListMemberRegistrations", "DeleteRegistration",
		"ListSettings", "UpdateSettings",
		"ListMembers", "CreateMember", "GetMember", "UpdateMember",
		"CreateUser", "ListUsers", "UpdateUser",
		"ListSessions",
		"CreateAPIKey",
	)

	allowSchemes(m, accessMember, "Register")

	return m
}

// authorizeWithCookie attempts to read a cookie with a given name and find a session based on
// the cookie value.
func authorizeWithCookie(r *http.Request, queries *storage.Queries, cookieName string) (*storage.Session, twirp.Error) {
	c, err := GetCookie(r, cookieName)
	if err != nil {
		if errors.Is(err, http.ErrNoCookie) {
			// We do not want to return an "Unauthenticated" error here since there are multiple cookies
			// to check for each of Member & User authorization schemes.
			return nil, nil
		}
		return nil, twirp.InternalErrorWith(err)
	}

	session, err := queries.GetSessionByKey(r.Context(), c.Value)
	if err != nil {
		return nil, twirp.Unauthenticated.Error("authentication required")
	}

	return &session, nil
}

// authorizeWithBasicAuth attemps to read Basic authorization from request headers and verify a user with the credentials.
func authorizeWithBasicAuth(r *http.Request, queries *storage.Queries, rc *config.RuntimeConfig) (string, twirp.Error) {
	username, password, ok := r.BasicAuth()
	if ok {
		if err := verifyUser(r.Context(), queries, rc.AllowAdminUser, rc.AdminUserPassword, username, password); err != nil {
			return "", twirp.Unauthenticated.Error(err.Error())
		}
		return username, nil
	}
	return "", nil
}

// authorizeWithAPIKey checks for a valid API Key based on the provided credential in the
// "Authorization" http header. A session is not tracked for API keys.
func authorizeWithAPIKey(r *http.Request, queries *storage.Queries) (string, twirp.Error) {
	authz := r.Header.Get("authorization")
	if authz != "" {
		fields := strings.Fields(authz)
		if len(fields) != 2 || strings.ToLower(fields[0]) != "bearer" {
			return "", twirp.Unauthenticated.Error("invalid authorization format")
		}

		apiKey, err := queries.GetAPIKeyBySecret(r.Context(), fields[1])
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				return "", twirp.Unauthenticated.Error("authentication required")
			}
			return "", twirp.WrapError(twirp.InternalError("error retrieving API key"), err)
		}

		return apiKey.Name, nil
	}
	return "", nil
}

// WithAuthorization is an http.Handler that verifies an authenticated user is allowed access
// this this request.
func WithAuthorization(base http.Handler, queries *storage.Queries, rc *config.RuntimeConfig, rpcAuthorization map[string]byte) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_, _, method := twirputil.ParseTwirpPath(r.URL.Path)
		if method == "" {
			twirp.WriteError(w, twirp.InternalError("unexpected request path"))
			return
		}

		schemes, ok := rpcAuthorization[method]
		if !ok && !IsPublicRPC(method) {

			twirp.WriteError(w, twirp.BadRoute.Error("unexpected rpc route"))
			return

		}

		var subject, scheme = "", ""

		// Check each bitmask against the allowed schemes for the current method
		switch {
		case schemes&maskMember > 0:
			// member scheme is allowed
			session, err := authorizeWithCookie(r, queries, COOKIE_MEMBER_SESSION)
			if err != nil {
				twirp.WriteError(w, err)
				return
			}
			if session != nil {
				subject = session.Subject
				scheme = AUTHZ_SCHEME_MEMBER
				break
			}
			fallthrough
		case schemes&maskUser > 0:
			// user scheme is allowed
			session, err := authorizeWithCookie(r, queries, COOKIE_USER_SESSION)
			if err != nil {
				twirp.WriteError(w, err)
				return
			}
			if session != nil {
				subject = session.Subject
				scheme = AUTHZ_SCHEME_USER
				break
			} else {
				username, err := authorizeWithBasicAuth(r, queries, rc)
				if err != nil {
					twirp.WriteError(w, err)
					return
				}
				if username != "" {
					subject = username
					scheme = AUTHZ_SCHEME_USER
					break
				}
			}
			fallthrough
		case schemes&maskAPIKey > 0:
			// API key scheme is allowed
			result, err := authorizeWithAPIKey(r, queries)
			if err != nil {
				twirp.WriteError(w, err)
				return
			}
			if result != "" {
				subject = result
				scheme = AUTHZ_SCHEME_API_KEY
				break
			}
		}

		if scheme == "" {
			if IsPublicRPC(method) {
				base.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), keyScheme, AUTHZ_SCHEME_ANONYMOUS)))
				return
			}
			twirp.WriteError(w, twirp.Unauthenticated.Error("authentication required"))
			return
		}

		ctx := context.WithValue(r.Context(), keySubject, subject)
		ctx = context.WithValue(ctx, keyScheme, scheme)
		base.ServeHTTP(w, r.WithContext(ctx))
	})
}

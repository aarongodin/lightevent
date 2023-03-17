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
	"errors"
	"net/http"
	"strings"

	"github.com/aarongodin/spectral/internal/server/repository"
	"github.com/aarongodin/spectral/internal/server/util"
	"github.com/asdine/storm/v3"
	"github.com/twitchtv/twirp"
)

// PUBLIC_RPCS can be requested by unauthenticated users (authorization is skipped)
var PUBLIC_RPCS = map[string]bool{
	"BeginVerification":    true,
	"CompleteVerification": true,
	"ListEvents":           true,
	"GetEvent":             true,
}

const (
	AUTHZ_SCHEME_MEMBER  = "member"
	AUTHZ_SCHEME_USER    = "user"
	AUTHZ_SCHEME_API_KEY = "api-key"
	// accessMember allows only Members
	accessMember = byte(0b001)
	// accessAdmin allows only Users and API keys
	accessAdmin = byte(0b110)
	// accessAny allows any scheme
	accessAny = byte(0b111)
	// maskMember is the bitmask for checking whether the member authz scheme is enabled
	maskMember = 0b001
	// maskMember is the bitmask for checking whether the user authz scheme is enabled
	maskUser = 0b010
	// maskMember is the bitmask for checking whether the API key authz scheme is enabled
	maskAPIKey = 0b100
)

type contextKey int

const (
	keySubject contextKey = iota + 1
	keyScheme
)

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
		"Ping", "GetRegistration",
	)

	allowSchemes(m, accessAdmin,
		"CreateEvent", "UpdateEvent",
		"ListEventRegistrations", "CreateRegistration",
		"GetBoolSetting", "UpdateBoolSetting",
		"ListMembers",
		"CreateUser", "ListUsers",
		"ListSessions",
	)

	allowSchemes(m, accessMember, "Register")

	return m
}

// authorizeWithCookie attempts to read a cookie with a given name and find a session based on
// the cookie value.
func authorizeWithCookie(r *http.Request, repo *repository.Repository, cookieName string) (*repository.SessionRecord, twirp.Error) {
	c, err := GetCookie(r, cookieName)
	if err != nil {
		if errors.Is(err, http.ErrNoCookie) {
			// We do not want to return an "Unauthenticated" error here since there are multiple cookies
			// to check for each of Member & User authorization schemes.
			return nil, nil
		}
		return nil, twirp.InternalErrorWith(err)
	}

	session, err := repo.Sessions.GetSessionByKey(c.Value)
	if err != nil {
		return nil, twirp.Unauthenticated.Error("authentication required")
	}

	return session, nil
}

// authorizeWithAPIKey checks for a valid API Key based on the provided credential in the
// "Authorization" http header. A session is not tracked for API keys.
func authorizeWithAPIKey(r *http.Request, repo *repository.Repository) (string, twirp.Error) {
	authz := r.Header.Get("authorization")
	if authz != "" {
		fields := strings.Fields(authz)
		if len(fields) != 2 || strings.ToLower(fields[0]) != "bearer" {
			return "", twirp.Unauthenticated.Error("invalid authorization format")
		}

		apiKey, err := repo.APIKeys.GetAPIKeyBySecret(fields[1])
		if err != nil {
			if errors.Is(err, storm.ErrNotFound) {
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
func WithAuthorization(base http.Handler, repo *repository.Repository, rpcAuthorization map[string]byte) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_, _, method := util.ParseTwirpPath(r.URL.Path)
		if method == "" {
			twirp.WriteError(w, twirp.InternalError("unexpected request path"))
			return
		}

		if _, exists := PUBLIC_RPCS[method]; exists {
			// Continue the request without authorization
			base.ServeHTTP(w, r)
			return
		}

		schemes, ok := rpcAuthorization[method]
		if !ok {
			twirp.WriteError(w, twirp.BadRoute.Error("unexpected rpc route"))
			return
		}

		var subject, scheme = "", ""

		// Check each bitmask against the allowed schemes for the current route
		switch {
		case schemes&maskMember > 0:
			// member scheme is allowed
			session, err := authorizeWithCookie(r, repo, COOKIE_MEMBER_SESSION)
			if err != nil {
				twirp.WriteError(w, err)
				return
			}
			if session != nil {
				subject = session.Subject
				scheme = AUTHZ_SCHEME_MEMBER
				break
			}
		case schemes&maskUser > 0:
			// user scheme is allowed
			session, err := authorizeWithCookie(r, repo, COOKIE_USER_SESSION)
			if err != nil {
				twirp.WriteError(w, err)
				return
			}
			if session != nil {
				subject = session.Subject
				scheme = AUTHZ_SCHEME_USER
				break
			}
		case schemes&maskAPIKey > 0:
			// API key scheme is allowed
			result, err := authorizeWithAPIKey(r, repo)
			if err != nil {
				twirp.WriteError(w, err)
				return
			}
			if result != "" {
				subject = result
				scheme = AUTHZ_SCHEME_API_KEY
				break
			}
		default:
			twirp.WriteError(w, twirp.InternalError("unknown authorization scheme"))
			return
		}

		if subject == "" || scheme == "" {
			twirp.WriteError(w, twirp.Unauthenticated.Error("authentication required"))
			return
		}

		ctx := context.WithValue(r.Context(), keySubject, subject)
		ctx = context.WithValue(ctx, keyScheme, scheme)
		base.ServeHTTP(w, r.WithContext(ctx))
	})
}
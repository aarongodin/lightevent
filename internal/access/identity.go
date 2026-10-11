// Package access authenticates requests and authorizes them against a per-RPC policy.
//
// There are three kinds of credentials:
//   - Users (administrators) authenticate with a username and password on the login page and receive a
//     session cookie.
//   - Members verify their email address with an emailed code and receive a member session, both as a
//     cookie and as a token that the client app sends as "Authorization: Bearer lem_<token>".
//   - API keys are sent as "Authorization: Bearer <secret>" and are intended for integrations.
//
// Requests without credentials are anonymous. Every RPC declares which of these schemes may call it in
// policy.go; RPCs without a policy are denied.
package access

import "context"

// Scheme identifies how a request was authenticated.
type Scheme string

const (
	SchemeAnonymous Scheme = "anonymous"
	SchemeMember    Scheme = "member"
	SchemeUser      Scheme = "user"
	SchemeAPIKey    Scheme = "api-key"
)

// Identity is the authenticated principal of a request.
type Identity struct {
	Scheme Scheme
	// SubjectID is the database id of the user, member or API key.
	SubjectID int64
	// SubjectUID is the public uid of the user, member or API key.
	SubjectUID string
	// Name is the username, member email or API key name.
	Name string
	// SessionID is set for session-based (user and member) identities.
	SessionID int64
}

// IsAdmin reports whether the identity is a user or API key.
func (i Identity) IsAdmin() bool {
	return i.Scheme == SchemeUser || i.Scheme == SchemeAPIKey
}

type identityKey struct{}

// WithIdentity returns a context carrying the identity.
func WithIdentity(ctx context.Context, id Identity) context.Context {
	return context.WithValue(ctx, identityKey{}, id)
}

// IdentityFrom returns the identity on the context, or an anonymous identity.
func IdentityFrom(ctx context.Context) Identity {
	if id, ok := ctx.Value(identityKey{}).(Identity); ok {
		return id
	}
	return Identity{Scheme: SchemeAnonymous}
}

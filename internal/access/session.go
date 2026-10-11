package access

import (
	"context"
	"net/http"
	"time"

	"github.com/aarongodin/lightevent/internal/secret"
	"github.com/aarongodin/lightevent/internal/storage"
)

const (
	CookieUserSession   = "lightevent-user-session"
	CookieMemberSession = "lightevent-member-session"

	SessionKindUser   = "user"
	SessionKindMember = "member"

	// MemberTokenPrefix marks a member session token sent as "Authorization: Bearer <token>", which
	// distinguishes it from an API key. The client app uses bearer tokens because it runs on other
	// origins, where the session cookie is not available.
	MemberTokenPrefix = "lem_"
)

// MemberBearerToken returns the bearer token for a member session token.
func MemberBearerToken(token string) string {
	return MemberTokenPrefix + token
}

// CreateSession stores a new session and returns the token to place in the session cookie.
// Only the SHA-256 of the token is stored.
func CreateSession(ctx context.Context, q *storage.Queries, kind, subjectUID string, now time.Time, ttl time.Duration) (string, storage.Session, error) {
	token := secret.Token(32)
	sess, err := q.CreateSession(ctx, storage.CreateSessionParams{
		Uid:        secret.UID(),
		TokenHash:  secret.Hash(token),
		Kind:       kind,
		SubjectUid: subjectUID,
		CreatedAt:  now,
		ExpiresAt:  now.Add(ttl),
	})
	return token, sess, err
}

// cookieNameForKind returns the cookie used for a session kind.
func cookieNameForKind(kind string) string {
	if kind == SessionKindMember {
		return CookieMemberSession
	}
	return CookieUserSession
}

// NewSessionCookie builds a session cookie with consistent security attributes. Always use this rather
// than constructing http.Cookie directly.
func NewSessionCookie(kind, token string, maxAge time.Duration, secure bool) *http.Cookie {
	sameSite := http.SameSiteStrictMode
	if kind == SessionKindMember {
		// Members may arrive from links in emails or on other pages of the organization's site.
		sameSite = http.SameSiteLaxMode
	}
	return &http.Cookie{
		Name:     cookieNameForKind(kind),
		Value:    token,
		Path:     "/",
		MaxAge:   int(maxAge.Seconds()),
		HttpOnly: true,
		Secure:   secure,
		SameSite: sameSite,
	}
}

// ClearSessionCookie returns a cookie that removes the session cookie of the given kind.
func ClearSessionCookie(kind string, secure bool) *http.Cookie {
	c := NewSessionCookie(kind, "", 0, secure)
	c.MaxAge = -1
	return c
}

// sessionFromCookie returns the active session for the cookie of the given kind, if any.
func sessionFromCookie(ctx context.Context, q *storage.Queries, header http.Header, kind string, now time.Time) (*storage.Session, error) {
	r := http.Request{Header: header}
	c, err := r.Cookie(cookieNameForKind(kind))
	if err != nil || c.Value == "" {
		return nil, nil //nolint:nilerr // a missing cookie is not an error
	}
	return sessionFromToken(ctx, q, c.Value, kind, now)
}

// sessionFromToken returns the active session of the given kind for a session token, if any.
func sessionFromToken(ctx context.Context, q *storage.Queries, token, kind string, now time.Time) (*storage.Session, error) {
	sess, err := q.GetActiveSessionByTokenHash(ctx, storage.GetActiveSessionByTokenHashParams{
		TokenHash: secret.Hash(token),
		Kind:      kind,
		Now:       now,
	})
	if err != nil {
		if isNoRows(err) {
			return nil, nil
		}
		return nil, err
	}
	return &sess, nil
}

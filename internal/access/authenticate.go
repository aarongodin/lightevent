package access

import (
	"context"
	"database/sql"
	"errors"
	"net/http"
	"strings"
	"time"

	"connectrpc.com/connect"
	"github.com/aarongodin/lightevent/internal/secret"
	"github.com/aarongodin/lightevent/internal/storage"
	"github.com/rs/zerolog/log"
)

func isNoRows(err error) bool {
	return errors.Is(err, sql.ErrNoRows)
}

// Authenticator resolves request credentials into an Identity.
type Authenticator struct {
	q   *storage.Queries
	now func() time.Time
}

// NewAuthenticator returns an Authenticator using the given queries and clock.
func NewAuthenticator(q *storage.Queries, now func() time.Time) *Authenticator {
	return &Authenticator{q: q, now: now}
}

var (
	errUnauthenticated = connect.NewError(connect.CodeUnauthenticated, errors.New("authentication required"))
	errInvalidAPIKey   = connect.NewError(connect.CodeUnauthenticated, errors.New("invalid API key"))
	errBadAuthHeader   = connect.NewError(connect.CodeUnauthenticated, errors.New("authorization header must be \"Bearer <api key>\""))
	errInvalidSession  = connect.NewError(connect.CodeUnauthenticated, errors.New("the session is invalid or has expired"))
	errInternal        = connect.NewError(connect.CodeInternal, errors.New("internal error"))
)

// Authenticate returns the identity for a request that may use any scheme in allow. Credentials are tried
// in order (bearer token, user session, member session) and only for schemes the RPC allows, so a browser that
// holds both a user and a member session uses the one appropriate for the RPC. When no allowed credential
// is present the request is anonymous if permitted, and unauthenticated otherwise.
func (a *Authenticator) Authenticate(ctx context.Context, header http.Header, allow Allow) (Identity, error) {
	now := a.now()

	if authz := header.Get("Authorization"); authz != "" {
		scheme, token, ok := strings.Cut(authz, " ")
		token = strings.TrimSpace(token)
		valid := ok && strings.EqualFold(scheme, "bearer") && token != ""
		switch {
		case valid && strings.HasPrefix(token, MemberTokenPrefix):
			// Member tokens are only considered for RPCs members may call; otherwise the request continues
			// as if no token was sent.
			if allow.Has(SchemeMember) {
				return a.memberFromToken(ctx, strings.TrimPrefix(token, MemberTokenPrefix), now)
			}
		case allow.Has(SchemeAPIKey):
			if !valid {
				return Identity{}, errBadAuthHeader
			}
			return a.apiKey(ctx, token, now)
		}
	}

	if allow.Has(SchemeUser) {
		sess, err := sessionFromCookie(ctx, a.q, header, SessionKindUser, now)
		if err != nil {
			log.Err(err).Msg("error reading user session")
			return Identity{}, errInternal
		}
		if sess != nil {
			user, err := a.q.GetUserByUID(ctx, sess.SubjectUid)
			if err == nil {
				return Identity{Scheme: SchemeUser, SubjectID: user.ID, SubjectUID: user.Uid, Name: user.Username, SessionID: sess.ID}, nil
			}
			if !isNoRows(err) {
				log.Err(err).Msg("error reading session user")
				return Identity{}, errInternal
			}
		}
	}

	if allow.Has(SchemeMember) {
		sess, err := sessionFromCookie(ctx, a.q, header, SessionKindMember, now)
		if err != nil {
			log.Err(err).Msg("error reading member session")
			return Identity{}, errInternal
		}
		if sess != nil {
			member, err := a.q.GetMemberByUID(ctx, sess.SubjectUid)
			if err == nil {
				return Identity{Scheme: SchemeMember, SubjectID: member.ID, SubjectUID: member.Uid, Name: member.Email, SessionID: sess.ID}, nil
			}
			if !isNoRows(err) {
				log.Err(err).Msg("error reading session member")
				return Identity{}, errInternal
			}
		}
	}

	if allow.Has(SchemeAnonymous) {
		return Identity{Scheme: SchemeAnonymous}, nil
	}
	return Identity{}, errUnauthenticated
}

func (a *Authenticator) apiKey(ctx context.Context, token string, now time.Time) (Identity, error) {
	key, err := a.q.GetAPIKeyBySecretHash(ctx, secret.Hash(token))
	if err != nil {
		if isNoRows(err) {
			return Identity{}, errInvalidAPIKey
		}
		log.Err(err).Msg("error reading API key")
		return Identity{}, errInternal
	}
	if err := a.q.TouchAPIKey(ctx, storage.TouchAPIKeyParams{
		ID: key.ID, Now: sql.NullTime{Time: now, Valid: true},
		Threshold: sql.NullTime{Time: now.Add(-time.Minute), Valid: true},
	}); err != nil {
		log.Err(err).Msg("error recording API key usage")
	}
	return Identity{Scheme: SchemeAPIKey, SubjectID: key.ID, SubjectUID: key.Uid, Name: key.Name}, nil
}

// memberFromToken authenticates a member bearer token. Unlike a stale cookie, an invalid token is an error
// so that the client app can sign the member in again.
func (a *Authenticator) memberFromToken(ctx context.Context, token string, now time.Time) (Identity, error) {
	sess, err := sessionFromToken(ctx, a.q, token, SessionKindMember, now)
	if err != nil {
		log.Err(err).Msg("error reading member session")
		return Identity{}, errInternal
	}
	if sess == nil {
		return Identity{}, errInvalidSession
	}
	member, err := a.q.GetMemberByUID(ctx, sess.SubjectUid)
	if err != nil {
		if isNoRows(err) {
			return Identity{}, errInvalidSession
		}
		log.Err(err).Msg("error reading session member")
		return Identity{}, errInternal
	}
	return Identity{Scheme: SchemeMember, SubjectID: member.ID, SubjectUID: member.Uid, Name: member.Email, SessionID: sess.ID}, nil
}

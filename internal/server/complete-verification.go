package server

import (
	"context"
	"database/sql"
	"errors"

	"github.com/aarongodin/lightevent/internal/repository"
	"github.com/aarongodin/lightevent/internal/server/access"
	"github.com/aarongodin/lightevent/internal/service"
	"github.com/aarongodin/lightevent/internal/storage"
	"github.com/google/uuid"
	"github.com/twitchtv/twirp"
)

// TODO(aarongodin): transaction this function for DB writes
func (s *Server) CompleteVerification(ctx context.Context, message *service.CompleteVerificationOptions) (*service.CompleteVerificationResult, error) {
	verification, err := s.queries.GetVerificationByKey(ctx, message.Key)
	if err != nil {
		return nil, errorResponse(err, "verification")
	}
	if verification.Completed == 1 {
		return nil, twirp.InvalidArgumentError("key", "verification already complete")
	}

	if verification.Challenge != message.Challenge {
		return nil, twirp.NewError(twirp.Unauthenticated, "incorrect challenge")
	}

	if err := s.queries.SetVerificationCompleted(ctx, verification.ID); err != nil {
		return nil, errorResponse(err, "verification")
	}

	member, err := s.queries.CreateOrVerifyMemberEmail(ctx, verification.Email)
	if err != nil {
		return nil, errorResponse(err, "member")
	}

	session, err := s.queries.GetSessionByIdentity(ctx, storage.GetSessionByIdentityParams{
		Subject: member.Email,
		Kind:    repository.SESSION_KIND_USER,
	})
	if err != nil {
		if errors.Is(sql.ErrNoRows, err) {
			if session, err = s.queries.CreateSession(ctx, storage.CreateSessionParams{
				Subject: member.Email,
				Kind:    repository.SESSION_KIND_MEMBER,
				Key:     uuid.New().String(),
			}); err != nil {
				return nil, err
			}
		} else {
			return nil, errorResponse(err, "session")
		}
	}

	cookie := access.NewCookie(access.COOKIE_MEMBER_SESSION, session.Key, int(s.rc.SessionMaxAge.Seconds()), s.rc.CookieSecure)
	if err := access.EncodeCookie(cookie, cookie.Value); err != nil {
		return nil, twirp.InternalErrorWith(err)
	}

	header := cookie.String()
	if header == "" {
		return nil, twirp.InternalError("error setting member session cookie")
	}
	if err := twirp.SetHTTPResponseHeader(ctx, "Set-Cookie", header); err != nil {
		return nil, twirp.InternalErrorWith(err)
	}

	return &service.CompleteVerificationResult{}, nil
}

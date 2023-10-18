package server

import (
	"context"
	"database/sql"
	"errors"
	"net/http"

	"github.com/aarongodin/lightevent/internal/repository"
	"github.com/aarongodin/lightevent/internal/server/access"
	"github.com/aarongodin/lightevent/internal/service"
	"github.com/aarongodin/lightevent/internal/storage"
	"github.com/google/uuid"
	"github.com/twitchtv/twirp"
)

func (s *Server) CompleteVerification(ctx context.Context, message *service.CompleteVerificationOptions) (*service.CompleteVerificationResult, error) {
	verification, err := s.queries.GetVerificationByKey(ctx, message.Key)
	if err != nil {
		return nil, errorResponse(err, "verification")
	}

	if verification.Challenge != message.Challenge {
		return nil, twirp.NewError(twirp.Unauthenticated, "incorrect challenge")
	}

	if err := s.queries.SetVerificationCompleted(ctx, verification.ID); err != nil {
		return nil, errorResponse(err, "verification")
	}

	// TODO(aarongodin): need to update the member that they are now verified, if they already existed
	if _, err := s.queries.CreateMember(ctx, storage.CreateMemberParams{
		Email:    message.Email,
		Verified: 1,
	}); err != nil {
		return nil, errorResponse(err, "member")
	}

	// create a session and set the cookie
	session, err := s.queries.GetSessionByIdentity(ctx, storage.GetSessionByIdentityParams{
		Subject: message.Email,
		Kind:    repository.SESSION_KIND_USER,
	})

	if err != nil {
		if errors.Is(sql.ErrNoRows, err) {
			if err != nil {
				return nil, err
			}
			session, err = s.queries.CreateSession(ctx, storage.CreateSessionParams{
				Subject: message.Email,
				Kind:    repository.SESSION_KIND_MEMBER,
				Key:     uuid.New().String(),
			})
			if err != nil {
				return nil, err
			}
		} else {
			return nil, err
		}
	}

	cookie := &http.Cookie{
		Name:     access.COOKIE_MEMBER_SESSION,
		Value:    session.Key,
		HttpOnly: true,
		// Secure:   true,
		Path:     "/",
		SameSite: http.SameSiteLaxMode,
	}
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

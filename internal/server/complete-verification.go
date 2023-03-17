package server

import (
	"context"
	"errors"
	"net/http"

	"github.com/aarongodin/spectral/internal/server/access"
	"github.com/aarongodin/spectral/internal/server/repository"
	"github.com/aarongodin/spectral/internal/service"
	"github.com/asdine/storm/v3"
	"github.com/twitchtv/twirp"
)

func (s *Server) CompleteVerification(ctx context.Context, message *service.CompleteVerificationOptions) (*service.CompleteVerificationResult, error) {
	verification, err := s.Repo.Verifications.GetVerification(message.Key)
	if err != nil {
		return nil, errorResponse(err, "verification")
	}

	if verification.Challenge != message.Challenge {
		return nil, twirp.NewError(twirp.Unauthenticated, "incorrect challenge")
	}

	if err := s.Repo.Verifications.CompleteVerification(verification.ID); err != nil {
		return nil, errorResponse(err, "verification")
	}

	if _, err := s.Repo.Members.CreateMember(message.Email); err != nil {
		if !errors.Is(err, storm.ErrAlreadyExists) {
			return nil, errorResponse(err, "member")
		}
	}

	// create a session and set the cookie
	session, err := s.Repo.Sessions.GetSession(message.Email, repository.SESSION_KIND_MEMBER)
	if err != nil {
		return nil, errorResponse(err, "session")
	}

	if session == nil {
		session, err = s.Repo.Sessions.CreateSession(message.Email, repository.SESSION_KIND_MEMBER)
		if err != nil {
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

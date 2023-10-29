package server

import (
	"context"
	"database/sql"
	"errors"

	"github.com/aarongodin/lightevent/internal/provider/email"
	"github.com/aarongodin/lightevent/internal/repository"
	"github.com/aarongodin/lightevent/internal/service"
	"github.com/twitchtv/twirp"
)

func (s *Server) BeginVerification(ctx context.Context, message *service.BeginVerificationOptions) (*service.BeginVerificationResult, error) {
	tx, err := s.db.Begin()
	if err != nil {
		return nil, errorResponse(err, "event")
	}
	defer tx.Rollback()
	qtx := s.queries.WithTx(tx)

	verification, err := s.queries.GetIncompleteVerification(ctx, message.Email)
	if err != nil && errors.Is(sql.ErrNoRows, err) {
		if verification, err = repository.CreateVerification(ctx, qtx, message.Email); err != nil {
			return nil, errorResponse(err, "verification")
		}
	} else {
		return nil, errorResponse(err, "verification")
	}

	if err = s.providers.Email.Send(verification.Email, email.EmailSubject(email.TemplateMemberEmailVerification), email.TemplatedEmail{
		Name: email.TemplateMemberEmailVerification,
		Data: map[string]any{
			"verfification": verification,
		},
	}); err != nil {
		if err := tx.Rollback(); err != nil {
			return nil, twirp.InternalErrorWith(err)
		}
	}

	if err := tx.Commit(); err != nil {
		return nil, errorResponse(err, "verification")
	}

	return &service.BeginVerificationResult{Key: verification.Key}, nil
}

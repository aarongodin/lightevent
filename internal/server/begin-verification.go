package server

import (
	"context"
	"database/sql"
	"errors"

	"github.com/aarongodin/spectral/internal/repository"
	"github.com/aarongodin/spectral/internal/service"
)

func (s *Server) BeginVerification(ctx context.Context, message *service.BeginVerificationOptions) (*service.BeginVerificationResult, error) {
	verification, err := s.queries.GetIncompleteVerification(ctx, message.Email)
	if err != nil {
		if errors.Is(sql.ErrNoRows, err) {
			verification, err = repository.CreateVerification(ctx, s.queries, message.Email)
			if err != nil {
				return nil, errorResponse(err, "verification")
			}
		} else {
			return nil, errorResponse(err, "verification")
		}
	}

	// TOOD(aarongodin): actually send the email

	return &service.BeginVerificationResult{Key: verification.Key}, nil
}

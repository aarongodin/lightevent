package server

import (
	"context"

	"github.com/aarongodin/spectral/internal/service"
)

func (s *Server) BeginVerification(ctx context.Context, message *service.BeginVerificationOptions) (*service.BeginVerificationResult, error) {
	verification, err := s.Repo.Verifications.GetIncompleteVerification(message.Email)
	if err != nil {
		return nil, errorResponse(err, "verification")
	}
	if verification == nil {
		verification, err = s.Repo.Verifications.CreateVerification(message.Email)
		if err != nil {
			return nil, errorResponse(err, "verification")
		}
	}

	// TOOD(aarongodin): actually send the email

	return &service.BeginVerificationResult{Key: verification.Key}, nil
}

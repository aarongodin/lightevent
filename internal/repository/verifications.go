package repository

import (
	"context"

	"github.com/aarongodin/lightevent/internal/storage"
	"github.com/aarongodin/lightevent/internal/util"
	"github.com/google/uuid"
)

// CreateVerification adds business logic for initializing a new verification in the storage.
func CreateVerification(ctx context.Context, queries *storage.Queries, email string) (storage.Verification, error) {
	challenge, err := util.RandomHexUpper(3)
	if err != nil {
		return storage.Verification{}, err
	}

	params := storage.CreateVerificationParams{
		Email:     email,
		Key:       uuid.New().String(),
		Challenge: challenge,
	}

	rec, err := queries.CreateVerification(ctx, params)
	if err != nil {
		return storage.Verification{}, err
	}

	return rec, nil
}

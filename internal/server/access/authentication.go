package access

import (
	"context"
	"database/sql"
	"errors"

	"github.com/aarongodin/lightevent/internal/repository"
	"github.com/aarongodin/lightevent/internal/storage"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

var errInvalidCredentials = errors.New("invalid credentials")

func verifyUser(ctx context.Context, queries *storage.Queries, allowAdminUser bool, adminUserPassword string, username string, password string) error {
	switch username {
	case "admin":
		if !allowAdminUser || password != adminUserPassword {
			return errInvalidCredentials
		}
		return nil
	default:
		user, err := queries.GetUserByUsername(ctx, username)
		if err != nil {
			return errInvalidCredentials
		}
		if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
			return errInvalidCredentials
		}
		return nil
	}
}

// authenticateUser receives a username and password and returns a session for the authenticated user.
func (ar accessRoutes) authenticateUser(ctx context.Context, username string, password string) (*storage.Session, error) {
	if err := verifyUser(ctx, ar.queries, ar.rc.AllowAdminUser, ar.rc.AdminUserPassword, username, password); err != nil {
		return nil, err
	}

	session, err := ar.queries.GetSessionByIdentity(ctx, storage.GetSessionByIdentityParams{
		Subject: username,
		Kind:    repository.SESSION_KIND_USER,
	})

	if err != nil {
		if errors.Is(sql.ErrNoRows, err) {
			session, err = ar.queries.CreateSession(ctx, storage.CreateSessionParams{
				Subject: username,
				Kind:    repository.SESSION_KIND_USER,
				Key:     uuid.New().String(),
			})
			if err != nil {
				return nil, err
			}
		} else {
			return nil, err
		}
	}

	return &session, nil
}

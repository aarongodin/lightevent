package access

import (
	"errors"

	"github.com/aarongodin/spectral/internal/server/repository"
	"golang.org/x/crypto/bcrypt"
)

var errInvalidCredentials = errors.New("invalid credentials")

func verifyUser(repo *repository.Repository, allowAdminUser bool, adminUserPassword string, username string, password string) error {
	switch username {
	case "admin":
		if !allowAdminUser || password != adminUserPassword {
			return errInvalidCredentials
		}
		return nil
	default:
		user, err := repo.Users.GetUser(username)
		if err != nil {
			return errInvalidCredentials
		}
		if err := bcrypt.CompareHashAndPassword(user.PasswordHash, []byte(password)); err != nil {
			return errInvalidCredentials
		}
		return nil
	}
}

// authenticateUser receives a username and password and returns the a session for the authenticated user.
func (ar accessRoutes) authenticateUser(username string, password string) (*repository.SessionRecord, error) {
	if err := verifyUser(ar.repo, ar.rc.AllowAdminUser, ar.rc.AdminUserPassword, username, password); err != nil {
		return nil, err
	}

	session, err := ar.repo.Sessions.GetSession(username, repository.SESSION_KIND_USER)
	if err != nil {
		return nil, err
	}

	if session == nil {
		session, err = ar.repo.Sessions.CreateSession(username, repository.SESSION_KIND_USER)
		if err != nil {
			return nil, err
		}
	}

	return session, nil
}

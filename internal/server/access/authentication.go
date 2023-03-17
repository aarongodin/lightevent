package access

import (
	"errors"

	"github.com/aarongodin/spectral/internal/server/repository"
	"golang.org/x/crypto/bcrypt"
)

// authenticateUser receives a username and password and returns the a session for the authenticated user.
func (ar accessRoutes) authenticateUser(username string, password string) (*repository.SessionRecord, error) {
	switch username {
	case "admin":
		if !ar.rc.AllowAdminUser || password != ar.rc.AdminUserPassword {
			return nil, errors.New("invalid credentials")
		}
	default:
		user, err := ar.repo.Users.GetUser(username)
		if err != nil {
			return nil, err
		}

		if err := bcrypt.CompareHashAndPassword(user.PasswordHash, []byte(password)); err != nil {
			return nil, err
		}
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

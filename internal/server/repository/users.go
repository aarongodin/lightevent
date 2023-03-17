package repository

import (
	"time"

	"github.com/asdine/storm/v3"
	"golang.org/x/crypto/bcrypt"
)

// UserRecord is a username-password identity for access to the admin panel.
type UserRecord struct {
	ID           int `storm:"id,increment"`
	CreatedAt    time.Time
	UpdatedAt    time.Time
	Username     string `storm:"index"`
	PasswordHash []byte
	Name         string
}

type UsersRepo interface {
	ListUsers() ([]*UserRecord, error)
	GetUser(string) (*UserRecord, error)
	CreateUser(username string, password string, name string) (*UserRecord, error)
}

type usersRepo struct {
	db *storm.DB
}

func (r usersRepo) ListUsers() ([]*UserRecord, error) {
	var users []*UserRecord
	if err := r.db.AllByIndex("Username", &users); err != nil {
		return nil, err
	}
	return users, nil
}

func (r usersRepo) GetUser(username string) (*UserRecord, error) {
	user := new(UserRecord)
	if err := r.db.One("Username", username, user); err != nil {
		return nil, err
	}
	return user, nil
}

func (r usersRepo) CreateUser(username string, password string, name string) (*UserRecord, error) {
	user := &UserRecord{
		Username:  username,
		Name:      name,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	passwordHash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}
	user.PasswordHash = passwordHash

	if err := r.db.Save(user); err != nil {
		return nil, err
	}
	return user, nil
}

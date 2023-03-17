package repository

import (
	"github.com/aarongodin/spectral/internal/server/config"
	"github.com/asdine/storm/v3"
)

type Repository struct {
	Events        EventsRepo
	Registrations RegistrationsRepo
	Sessions      SessionsRepo
	Users         UsersRepo
	APIKeys       APIKeysRepo
	Members       MembersRepo
	Verifications VerificationsRepo
}

func New(db *storm.DB, cfg *config.RuntimeConfig) *Repository {
	return &Repository{
		Events:        &eventsRepo{db: db},
		Registrations: &registrationsRepo{db: db},
		Sessions:      &sessionsRepo{db: db, cfg: cfg},
		Users:         &usersRepo{db: db},
		APIKeys:       &apiKeysRepo{db: db},
		Members:       &membersRepo{db: db},
		Verifications: &verificationsRepo{db: db},
	}
}

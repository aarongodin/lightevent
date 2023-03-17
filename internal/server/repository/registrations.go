package repository

import (
	"errors"
	"time"

	"github.com/asdine/storm/v3"
)

const (
	KIND_ONCE   = "once"
	KIND_SERIES = "series"
)

type RegistrationRecord struct {
	ID        int `storm:"id,increment"`
	CreatedAt time.Time
	// ConfCode is a URL-safe uppercase hex string for members to reference their registration.
	ConfCode string
	// Kind defines what the user registered for on the event (once, series)
	Kind    string
	EventID int
	// EventDate is present for scenarios where a specific date of the event is required for registration
	EventDate   *time.Time
	MemberEmail string
}

type RegistrationsRepo interface {
	NewConfCode() (string, error)
	ListEventRegistrations(eventID int) ([]*RegistrationRecord, error)
	CreateRegistration(*RegistrationRecord) (*RegistrationRecord, error)
	GetRegistration(string) (*RegistrationRecord, error)
}

type registrationsRepo struct {
	db *storm.DB
}

func (r registrationsRepo) NewConfCode() (string, error) {
	for t := 0; t < 3; t++ {
		value, err := randomHexUpper(8)
		if err != nil {
			return "", err
		}
		var rec RegistrationRecord
		if err := r.db.One("ConfCode", value, &rec); err != nil {
			if errors.Is(err, storm.ErrNotFound) {
				return value, nil
			}
			return "", err
		}
	}
	return "", errors.New("failed to generate new conf code")
}

func (r registrationsRepo) GetRegistration(confCode string) (*RegistrationRecord, error) {
	reg := new(RegistrationRecord)
	if err := r.db.One("ConfCode", confCode, reg); err != nil {
		return nil, err
	}
	return reg, nil
}

func (r registrationsRepo) ListEventRegistrations(eventID int) ([]*RegistrationRecord, error) {
	var regs []*RegistrationRecord
	if err := r.db.Find("EventID", eventID, &regs); err != nil {
		return nil, err
	}
	return regs, nil
}

func (r registrationsRepo) CreateRegistration(reg *RegistrationRecord) (*RegistrationRecord, error) {
	if err := r.db.Save(reg); err != nil {
		return nil, err
	}
	return reg, nil
}

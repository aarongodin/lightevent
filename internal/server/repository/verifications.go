package repository

import (
	"errors"
	"time"

	"github.com/asdine/storm/v3"
	"github.com/asdine/storm/v3/q"
	gonanoid "github.com/matoous/go-nanoid/v2"
)

type VerificationRecord struct {
	ID        int `storm:"id,increment"`
	CreatedAt time.Time
	Email     string
	// Key is a public identifier for the verification
	Key string
	// Completed is true when the verification challenge has been entered by the member
	Completed bool
	// Challenge is a 6 character string the member must enter to complete the verification
	Challenge string
}

type VerificationsRepo interface {
	CreateVerification(email string) (*VerificationRecord, error)
	GetVerification(key string) (*VerificationRecord, error)
	GetIncompleteVerification(email string) (*VerificationRecord, error)
	CompleteVerification(id int) error
}

type verificationsRepo struct {
	db *storm.DB
}

func (r verificationsRepo) CreateVerification(email string) (*VerificationRecord, error) {
	challenge, err := randomHexUpper(3)
	if err != nil {
		return nil, err
	}
	key, err := gonanoid.New()
	if err != nil {
		return nil, err
	}
	rec := &VerificationRecord{
		CreatedAt: time.Now(),
		Email:     email,
		Key:       key,
		Completed: false,
		Challenge: challenge,
	}
	if err := r.db.Save(rec); err != nil {
		return nil, err
	}
	return rec, nil
}

func (r verificationsRepo) GetVerification(key string) (*VerificationRecord, error) {
	recs := make([]*VerificationRecord, 0)
	if err := r.db.Find("Key", key, &recs); err != nil {
		return nil, err
	}
	return recs[0], nil
}

func (r verificationsRepo) GetIncompleteVerification(email string) (*VerificationRecord, error) {
	var recs []*VerificationRecord
	if err := r.db.Select(
		q.Eq("Email", email),
		q.Eq("Completed", false),
	).OrderBy("ID").Limit(1).Find(&recs); err != nil {
		if errors.Is(err, storm.ErrNotFound) {
			return nil, nil
		}
		return nil, err
	}
	// storm always throws an error for any query that does not return records, so the
	// slice index access below is safe
	return recs[0], nil
}

func (r verificationsRepo) CompleteVerification(id int) error {
	return r.db.UpdateField(&VerificationRecord{ID: id}, "Completed", true)
}

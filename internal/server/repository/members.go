package repository

import (
	"errors"
	"fmt"
	"time"

	"github.com/asdine/storm/v3"
	"github.com/asdine/storm/v3/q"
)

// MemberRecord is an identity representing individuals that can register for events.
type MemberRecord struct {
	ID        int `storm:"id,increment"`
	CreatedAt time.Time
	Email     string `storm:"unique"`
	Verified  bool
	FirstName string
	LastName  string
}

type MembersRepo interface {
	CreateMember(email string, verified bool, firstName string, lastName string) (*MemberRecord, error)
	ListMembers(email string) ([]*MemberRecord, error)
	GetMember(email string) (*MemberRecord, error)
}

type membersRepo struct {
	db *storm.DB
}

func (r membersRepo) CreateMember(email string, verified bool, firstName string, lastName string) (*MemberRecord, error) {
	rec := &MemberRecord{
		Email:     email,
		Verified:  verified,
		FirstName: firstName,
		LastName:  lastName,
		CreatedAt: time.Now(),
	}
	if err := r.db.Save(rec); err != nil {
		return nil, err
	}
	return rec, nil
}

func (r membersRepo) ListMembers(email string) ([]*MemberRecord, error) {
	query := make([]q.Matcher, 0)
	if email != "" {
		query = append(query, q.Re("Email", fmt.Sprintf("^%s", email)))
	}
	recs := make([]*MemberRecord, 0)
	if err := r.db.Select(q.And(query...)).Find(&recs); err != nil {
		if errors.Is(err, storm.ErrNotFound) {
			return []*MemberRecord{}, nil
		}
		return nil, err
	}
	return recs, nil
}

func (r membersRepo) GetMember(email string) (*MemberRecord, error) {
	rec := new(MemberRecord)
	if err := r.db.One("Email", email, rec); err != nil {
		return nil, err
	}
	return rec, nil
}

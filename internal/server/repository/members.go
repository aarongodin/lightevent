package repository

import (
	"time"

	"github.com/asdine/storm/v3"
)

// MemberRecord is an identity representing someone registered for an event.
// MemberRecords may only be created if the member has verified their email address,
// so it's assumed that any records in this bucket represent verified members.
// A member can be verified and not have a registration if they abandon the
// registration flow after the verification step.
type MemberRecord struct {
	ID        int `storm:"id,increment"`
	CreatedAt time.Time
	Email     string `storm:"unique"`
}

type MembersRepo interface {
	CreateMember(email string) (*MemberRecord, error)
	ListMembers() ([]*MemberRecord, error)
}

type membersRepo struct {
	db *storm.DB
}

func (r membersRepo) CreateMember(email string) (*MemberRecord, error) {
	rec := &MemberRecord{
		Email:     email,
		CreatedAt: time.Now(),
	}
	if err := r.db.Save(rec); err != nil {
		return nil, err
	}
	return rec, nil
}

func (r membersRepo) ListMembers() ([]*MemberRecord, error) {
	recs := make([]*MemberRecord, 0)
	if err := r.db.All(&recs); err != nil {
		return nil, err
	}
	return recs, nil
}

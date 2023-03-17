package repository

import (
	"errors"
	"time"

	"github.com/aarongodin/spectral/internal/server/config"
	"github.com/asdine/storm/v3"
	"github.com/asdine/storm/v3/q"
	gonanoid "github.com/matoous/go-nanoid/v2"
)

const (
	SESSION_KIND_USER   = "user"
	SESSION_KIND_MEMBER = "member"
)

// SessionRecord is an instance of a logged-in User or Member.
type SessionRecord struct {
	ID        int `storm:"id,increment"`
	CreatedAt time.Time
	// Key is a URL-safe string for identifying a session
	Key string
	// Subject is the identity for the session
	Subject string
	// Kind defines what type of identity this session is for
	Kind string
}

type SessionsRepo interface {
	ListSessions() ([]*SessionRecord, error)
	GetSessionByKey(key string) (*SessionRecord, error)
	CreateSession(subject string, kind string) (*SessionRecord, error)
	GetSession(subject string, kind string) (*SessionRecord, error)
}

type sessionsRepo struct {
	db  *storm.DB
	cfg *config.RuntimeConfig
}

func (r sessionsRepo) ListSessions() ([]*SessionRecord, error) {
	createdAfter := time.Now().Add(-r.cfg.SessionMaxAge)
	var sessions []*SessionRecord
	err := r.db.Select().OrderBy("ID").Each(new(SessionRecord), func(rec any) error {
		session := rec.(*SessionRecord)
		if session.CreatedAt.Before(createdAfter) {
			return errSignalEOF
		}
		sessions = append(sessions, session)
		return nil
	})

	if err != nil && !errors.Is(err, errSignalEOF) {
		return nil, err
	}

	return sessions, nil
}

func (r sessionsRepo) GetSessionByKey(key string) (*SessionRecord, error) {
	session := new(SessionRecord)
	if err := r.db.One("Key", key, session); err != nil {
		return nil, err
	}
	return session, nil
}

func (r sessionsRepo) CreateSession(subject string, kind string) (*SessionRecord, error) {
	key, err := gonanoid.New()
	if err != nil {
		return nil, err
	}

	rec := &SessionRecord{
		Key:       key,
		Subject:   subject,
		Kind:      kind,
		CreatedAt: time.Now(),
	}
	if err := r.db.Save(rec); err != nil {
		return nil, err
	}
	return rec, nil
}

func (r sessionsRepo) GetSession(subject string, kind string) (*SessionRecord, error) {
	var sessions []*SessionRecord
	err := r.db.Select(q.Eq("Kind", kind), q.Eq("Subject", subject)).Find(&sessions)
	if err != nil && !errors.Is(err, storm.ErrNotFound) {
		return nil, err
	}

	// TODO(aarongodin): log this, or decide what to do
	// if len(sessions) > 1 {
	// }

	if len(sessions) == 1 {
		return sessions[0], nil
	}

	return nil, nil
}

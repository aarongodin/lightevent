package repository

import (
	"time"

	"github.com/asdine/storm/v3"
	gonanoid "github.com/matoous/go-nanoid/v2"
)

// APIKeyRecord is a M2M identity for access to the RPC API.
type APIKeyRecord struct {
	ID        int `storm:"id,increment"`
	CreatedAt time.Time
	// Name is a human-readable string to show to users
	Name string
	// Secret is the URL-safe string for authenticating as this API Key
	Secret string
}

type APIKeysRepo interface {
	CreateAPIKey(name string) (*APIKeyRecord, error)
	GetAPIKeyBySecret(secret string) (*APIKeyRecord, error)
}

type apiKeysRepo struct {
	db *storm.DB
}

func (r apiKeysRepo) CreateAPIKey(name string) (*APIKeyRecord, error) {
	secret, err := gonanoid.New(32)
	if err != nil {
		return nil, err
	}
	key := &APIKeyRecord{
		Name:      name,
		Secret:    secret,
		CreatedAt: time.Now(),
	}
	if err := r.db.Save(key); err != nil {
		return nil, err
	}
	return key, nil
}

func (r apiKeysRepo) GetAPIKeyBySecret(secret string) (*APIKeyRecord, error) {
	key := new(APIKeyRecord)
	if err := r.db.One("Secret", secret, key); err != nil {
		return nil, err
	}
	return key, nil
}

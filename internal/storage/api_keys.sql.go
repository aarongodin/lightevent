// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.22.0
// source: api_keys.sql

package storage

import (
	"context"
)

const createAPIKey = `-- name: CreateAPIKey :one
INSERT INTO api_keys (
  name, secret
) VALUES (?, ?)
RETURNING id, name, secret, created_at
`

type CreateAPIKeyParams struct {
	Name   string
	Secret string
}

func (q *Queries) CreateAPIKey(ctx context.Context, arg CreateAPIKeyParams) (ApiKey, error) {
	row := q.db.QueryRowContext(ctx, createAPIKey, arg.Name, arg.Secret)
	var i ApiKey
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Secret,
		&i.CreatedAt,
	)
	return i, err
}

const getAPIKeyBySecret = `-- name: GetAPIKeyBySecret :one
SELECT id, name, secret, created_at FROM api_keys
WHERE secret = ?
`

func (q *Queries) GetAPIKeyBySecret(ctx context.Context, secret string) (ApiKey, error) {
	row := q.db.QueryRowContext(ctx, getAPIKeyBySecret, secret)
	var i ApiKey
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Secret,
		&i.CreatedAt,
	)
	return i, err
}

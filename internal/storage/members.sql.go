// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.22.0
// source: members.sql

package storage

import (
	"context"
	"database/sql"
)

const createMember = `-- name: CreateMember :one
INSERT INTO members (
  uid, email, verified, first_name, last_name
) VALUES (?, ?, ?, ?, ?)
RETURNING id, uid, email, verified, first_name, last_name, created_at
`

type CreateMemberParams struct {
	Uid       string
	Email     string
	Verified  int64
	FirstName sql.NullString
	LastName  sql.NullString
}

func (q *Queries) CreateMember(ctx context.Context, arg CreateMemberParams) (Member, error) {
	row := q.db.QueryRowContext(ctx, createMember,
		arg.Uid,
		arg.Email,
		arg.Verified,
		arg.FirstName,
		arg.LastName,
	)
	var i Member
	err := row.Scan(
		&i.ID,
		&i.Uid,
		&i.Email,
		&i.Verified,
		&i.FirstName,
		&i.LastName,
		&i.CreatedAt,
	)
	return i, err
}

const createOrVerifyMemberEmail = `-- name: CreateOrVerifyMemberEmail :one
INSERT INTO members (
  email, verified
) VALUES (?, 1)
ON CONFLICT DO UPDATE SET verified = 1
RETURNING id, uid, email, verified, first_name, last_name, created_at
`

func (q *Queries) CreateOrVerifyMemberEmail(ctx context.Context, email string) (Member, error) {
	row := q.db.QueryRowContext(ctx, createOrVerifyMemberEmail, email)
	var i Member
	err := row.Scan(
		&i.ID,
		&i.Uid,
		&i.Email,
		&i.Verified,
		&i.FirstName,
		&i.LastName,
		&i.CreatedAt,
	)
	return i, err
}

const getMember = `-- name: GetMember :one
SELECT id, uid, email, verified, first_name, last_name, created_at FROM members
WHERE id = ?
`

func (q *Queries) GetMember(ctx context.Context, id int64) (Member, error) {
	row := q.db.QueryRowContext(ctx, getMember, id)
	var i Member
	err := row.Scan(
		&i.ID,
		&i.Uid,
		&i.Email,
		&i.Verified,
		&i.FirstName,
		&i.LastName,
		&i.CreatedAt,
	)
	return i, err
}

const getMemberByEmail = `-- name: GetMemberByEmail :one
SELECT id, uid, email, verified, first_name, last_name, created_at FROM members
WHERE email = ?
`

func (q *Queries) GetMemberByEmail(ctx context.Context, email string) (Member, error) {
	row := q.db.QueryRowContext(ctx, getMemberByEmail, email)
	var i Member
	err := row.Scan(
		&i.ID,
		&i.Uid,
		&i.Email,
		&i.Verified,
		&i.FirstName,
		&i.LastName,
		&i.CreatedAt,
	)
	return i, err
}

const getMemberByUID = `-- name: GetMemberByUID :one
SELECT id, uid, email, verified, first_name, last_name, created_at FROM members
WHERE uid = ?
`

func (q *Queries) GetMemberByUID(ctx context.Context, uid string) (Member, error) {
	row := q.db.QueryRowContext(ctx, getMemberByUID, uid)
	var i Member
	err := row.Scan(
		&i.ID,
		&i.Uid,
		&i.Email,
		&i.Verified,
		&i.FirstName,
		&i.LastName,
		&i.CreatedAt,
	)
	return i, err
}

const listMembers = `-- name: ListMembers :many
SELECT id, uid, email, verified, first_name, last_name, created_at FROM members
`

func (q *Queries) ListMembers(ctx context.Context) ([]Member, error) {
	rows, err := q.db.QueryContext(ctx, listMembers)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Member
	for rows.Next() {
		var i Member
		if err := rows.Scan(
			&i.ID,
			&i.Uid,
			&i.Email,
			&i.Verified,
			&i.FirstName,
			&i.LastName,
			&i.CreatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const listMembersBySearch = `-- name: ListMembersBySearch :many
SELECT id, uid, email, verified, first_name, last_name, created_at FROM members
WHERE email like ?1 OR first_name like ?1 OR last_name like ?1
`

func (q *Queries) ListMembersBySearch(ctx context.Context, search string) ([]Member, error) {
	rows, err := q.db.QueryContext(ctx, listMembersBySearch, search)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Member
	for rows.Next() {
		var i Member
		if err := rows.Scan(
			&i.ID,
			&i.Uid,
			&i.Email,
			&i.Verified,
			&i.FirstName,
			&i.LastName,
			&i.CreatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const updateMember = `-- name: UpdateMember :one
UPDATE members
SET first_name = COALESCE(?1, first_name),
		last_name = COALESCE(?2, last_name),
		email = COALESCE(?3, email)
WHERE uid = ?4
RETURNING id, uid, email, verified, first_name, last_name, created_at
`

type UpdateMemberParams struct {
	FirstName sql.NullString
	LastName  sql.NullString
	Email     sql.NullString
	Uid       string
}

func (q *Queries) UpdateMember(ctx context.Context, arg UpdateMemberParams) (Member, error) {
	row := q.db.QueryRowContext(ctx, updateMember,
		arg.FirstName,
		arg.LastName,
		arg.Email,
		arg.Uid,
	)
	var i Member
	err := row.Scan(
		&i.ID,
		&i.Uid,
		&i.Email,
		&i.Verified,
		&i.FirstName,
		&i.LastName,
		&i.CreatedAt,
	)
	return i, err
}

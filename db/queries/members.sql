-- name: CreateMember :one
INSERT INTO members (
  uid, email, verified, first_name, last_name
) VALUES (?, ?, ?, ?, ?)
RETURNING *;

-- name: CreateOrVerifyMemberEmail :one
INSERT INTO members (
  email, verified
) VALUES (?, 1)
ON CONFLICT DO UPDATE SET verified = 1
RETURNING *;

-- name: GetMember :one
SELECT * FROM members
WHERE id = ?;

-- name: GetMemberByEmail :one
SELECT * FROM members
WHERE email = ?;

-- name: GetMemberByUID :one
SELECT * FROM members
WHERE uid = ?;

-- name: ListMembers :many
SELECT * FROM members;

-- name: ListMembersBySearch :many
SELECT * FROM members
WHERE email like @search OR first_name like @search OR last_name like @search;

-- name: UpdateMember :one
UPDATE members
SET first_name = COALESCE(sqlc.narg('first_name'), first_name),
		last_name = COALESCE(sqlc.narg('last_name'), last_name),
		email = COALESCE(sqlc.narg('email'), email)
WHERE uid = sqlc.arg('uid')
RETURNING *;

-- name: CreateMember :one
INSERT INTO members (
  email, verified, first_name, last_name
) VALUES (?, ?, ?, ?)
RETURNING *;

-- name: GetMember :one
SELECT * FROM members
WHERE id = ?;

-- name: GetMemberByEmail :one
SELECT * FROM members
WHERE email = ?;

-- name: ListMembers :many
SELECT * FROM members;
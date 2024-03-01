-- name: ListUsers :many
SELECT * FROM users;

-- name: GetUserByUsername :one
SELECT * FROM users
WHERE username = ?;

-- name: GetUserByUID :one
SELECT * FROM users
WHERE uid = ?;

-- name: CreateUser :one
INSERT INTO users (
  uid, username, password_hash, first_name, last_name, email
) VALUES (?, ?, ?, ?, ?, ?)
RETURNING *;

-- name: UpdateUser :one
UPDATE users
SET username = COALESCE(sqlc.narg('username'), username),
    password_hash = COALESCE(sqlc.narg('password_hash'), password_hash),
    first_name = COALESCE(sqlc.narg('first_name'), first_name),
    last_name = COALESCE(sqlc.narg('last_name'), last_name),
    email = COALESCE(sqlc.narg('email'), email),
    updated_at = CURRENT_TIMESTAMP
WHERE id = sqlc.arg('id')
RETURNING *;

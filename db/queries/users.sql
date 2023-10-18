-- name: ListUsers :many
SELECT * FROM users;

-- name: GetUserByUsername :one
SELECT * FROM users
WHERE username = ?;

-- name: CreateUser :one
INSERT INTO users (
  username, password_hash, first_name, last_name
) VALUES (?, ?, ?, ?)
RETURNING *;

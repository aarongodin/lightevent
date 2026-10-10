-- name: CreateUser :one
INSERT INTO users (uid, username, password_hash, first_name, last_name, email, created_at)
VALUES (?, ?, ?, ?, ?, ?, ?)
RETURNING *;

-- name: CountUsers :one
SELECT COUNT(*) FROM users;

-- name: ListUsers :many
SELECT * FROM users ORDER BY username ASC;

-- name: GetUserByUsername :one
SELECT * FROM users WHERE username = ?;

-- name: GetUserByUID :one
SELECT * FROM users WHERE uid = ?;

-- name: UpdateUser :one
UPDATE users
SET username = ?, first_name = ?, last_name = ?, email = ?, updated_at = ?
WHERE id = ?
RETURNING *;

-- name: SetUserPasswordHash :exec
UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?;

-- name: DeleteUser :exec
DELETE FROM users WHERE id = ?;

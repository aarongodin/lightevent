-- name: CreateSession :one
INSERT INTO sessions (
  key, subject, kind
) VALUES (?, ?, ?)
RETURNING *;

-- name: ListSessions :many
SELECT * FROM sessions
WHERE created_at >= ?;

-- name: GetSessionByKey :one
SELECT * FROM sessions
WHERE key = ?;

-- name: GetSessionByIdentity :one
SELECT * FROM sessions
WHERE subject = ? AND kind = ?;

-- name: DeleteSession :exec
DELETE FROM sessions
WHERE id = ?;

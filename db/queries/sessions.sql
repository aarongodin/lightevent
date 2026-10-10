-- name: CreateSession :one
INSERT INTO sessions (uid, token_hash, kind, subject_uid, created_at, expires_at)
VALUES (?, ?, ?, ?, ?, ?)
RETURNING *;

-- name: GetActiveSessionByTokenHash :one
SELECT * FROM sessions WHERE token_hash = @token_hash AND kind = @kind AND expires_at > @now;

-- name: ListActiveSessions :many
SELECT * FROM sessions
WHERE expires_at > @now
  AND (CAST(@kind AS TEXT) = '' OR kind = CAST(@kind AS TEXT))
  AND (CAST(@subject_uid AS TEXT) = '' OR subject_uid = CAST(@subject_uid AS TEXT))
ORDER BY created_at DESC;

-- name: GetSessionByUID :one
SELECT * FROM sessions WHERE uid = ?;

-- name: DeleteSession :exec
DELETE FROM sessions WHERE id = ?;

-- name: DeleteSessionsBySubject :exec
DELETE FROM sessions WHERE kind = ? AND subject_uid = ?;

-- name: DeleteOtherSessionsBySubject :exec
DELETE FROM sessions WHERE kind = ? AND subject_uid = ? AND id != ?;

-- name: DeleteExpiredSessions :exec
DELETE FROM sessions WHERE expires_at <= ?;

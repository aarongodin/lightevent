-- name: CreateVerification :one
INSERT INTO verifications (key_hash, email, code_hash, created_at, expires_at)
VALUES (?, ?, ?, ?, ?)
RETURNING *;

-- name: GetVerificationByKeyHash :one
SELECT * FROM verifications WHERE key_hash = ?;

-- name: IncrementVerificationAttempts :one
UPDATE verifications SET attempts = attempts + 1 WHERE id = ? RETURNING *;

-- name: CompleteVerification :exec
UPDATE verifications SET completed_at = ? WHERE id = ?;

-- name: CountRecentVerifications :one
SELECT COUNT(*) FROM verifications WHERE email = ? AND created_at > ?;

-- name: DeleteVerificationsByEmail :exec
DELETE FROM verifications WHERE email = ?;

-- name: DeleteExpiredVerifications :exec
DELETE FROM verifications WHERE expires_at <= ?;

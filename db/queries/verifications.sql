-- name: CreateVerification :one
INSERT INTO verifications (
  email, key, challenge
) VALUES (?, ?, ?)
RETURNING *;

-- name: GetIncompleteVerification :one
SELECT * FROM verifications
WHERE email = ? AND completed = 0;

-- name: GetVerificationByKey :one
SELECT * FROM verifications
WHERE key = ?;

-- name: SetVerificationCompleted :exec
UPDATE verifications
SET completed = 1
WHERE id = ?;

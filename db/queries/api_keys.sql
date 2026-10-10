-- name: CreateAPIKey :one
INSERT INTO api_keys (uid, name, prefix, secret_hash, created_at)
VALUES (?, ?, ?, ?, ?)
RETURNING *;

-- name: GetAPIKeyBySecretHash :one
SELECT * FROM api_keys WHERE secret_hash = ?;

-- name: ListAPIKeys :many
SELECT * FROM api_keys ORDER BY name ASC;

-- name: GetAPIKeyByUID :one
SELECT * FROM api_keys WHERE uid = ?;

-- name: DeleteAPIKey :exec
DELETE FROM api_keys WHERE id = ?;

-- name: TouchAPIKey :exec
-- Records usage at most once per minute to avoid a write on every request.
UPDATE api_keys SET last_used_at = @now
WHERE id = @id AND (last_used_at IS NULL OR last_used_at < @threshold);

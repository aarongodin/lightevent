-- name: CreateAPIKey :one
INSERT INTO api_keys (
  name, secret
) VALUES (?, ?)
RETURNING *;

-- name: GetAPIKeyBySecret :one
SELECT * FROM api_keys
WHERE secret = ?;

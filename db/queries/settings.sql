-- name: GetSettings :one
SELECT * FROM settings WHERE name = ?;

-- name: UpsertSettings :exec
INSERT INTO settings (name, value, updated_at) VALUES (?, ?, ?)
ON CONFLICT (name) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at;

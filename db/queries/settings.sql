-- name: GetSettings :one
SELECT * FROM settings
WHERE name = ?;

-- name: UpdateSettings :exec
INSERT INTO settings (
  name, value
) VALUES (?, ?)
ON CONFLICT DO UPDATE SET
  value = excluded.value
RETURNING *;

-- name: GetRegistrationByConfCode :one
SELECT * FROM registrations
WHERE conf_code = ?;

-- name: ListEventRegistrations :many
SELECT * FROM registrations
WHERE event_id = ?;

-- name: ListMemberRegistrations :many
SELECT
  reg.conf_code, reg.kind, reg.event_date_id,
  ev.name as event_name
FROM registrations reg
INNER JOIN events ev ON reg.event_id = ev.id
WHERE member_id = ?;

-- name: CreateRegistration :one
INSERT INTO registrations (
  conf_code, kind,
  event_id, event_date_id,
  member_id
) VALUES (?, ?, ?, ?, ?)
RETURNING *;

-- name: DeleteRegistrationByConfCode :exec
UPDATE registrations
SET deleted_at = CURRENT_TIMESTAMP
WHERE conf_code = ?;

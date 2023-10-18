-- name: GetRegistrationByConfCode :one
SELECT * FROM registrations
WHERE conf_code = ?;

-- name: ListEventRegistrations :many
SELECT * FROM registrations
WHERE event_id = ?;

-- name: CreateRegistration :one
INSERT INTO registrations (
  conf_code, kind,
  event_id, event_date_id,
  member_id
) VALUES (?, ?, ?, ?, ?)
RETURNING *;

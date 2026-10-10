-- name: CreateRegistration :one
INSERT INTO registrations (conf_code, kind, event_id, event_date_id, member_id, created_at)
VALUES (?, ?, ?, ?, ?, ?)
RETURNING *;

-- name: GetActiveRegistrationByConfCode :one
SELECT * FROM registrations WHERE conf_code = ? AND deleted_at IS NULL;

-- name: SoftDeleteRegistration :exec
UPDATE registrations SET deleted_at = ? WHERE id = ?;

-- name: ListActiveRegistrationsByEvent :many
SELECT * FROM registrations
WHERE event_id = ? AND deleted_at IS NULL
ORDER BY created_at ASC, id ASC;

-- name: ListActiveRegistrationsByMember :many
SELECT * FROM registrations
WHERE member_id = ? AND deleted_at IS NULL
ORDER BY created_at DESC, id DESC;

-- name: CountActiveOnceRegistrationsForDate :one
SELECT COUNT(*) FROM registrations
WHERE event_date_id = ? AND kind = 'once' AND deleted_at IS NULL;

-- name: CountActiveSeriesRegistrationsForEvent :one
SELECT COUNT(*) FROM registrations
WHERE event_id = ? AND kind = 'series' AND deleted_at IS NULL;

-- name: CountActiveMemberRegistrationsForEvent :one
SELECT COUNT(*) FROM registrations
WHERE member_id = ? AND event_id = ? AND deleted_at IS NULL;

-- name: HasActiveSeriesRegistration :one
SELECT COUNT(*) FROM registrations
WHERE member_id = ? AND event_id = ? AND kind = 'series' AND deleted_at IS NULL;

-- name: DeleteInactiveRegistrationsForDate :exec
-- Removes cancelled single-date registrations so the date itself can be deleted.
DELETE FROM registrations WHERE event_date_id = ? AND deleted_at IS NOT NULL;

-- name: DeleteRegistrationsByMember :exec
DELETE FROM registrations WHERE member_id = ?;

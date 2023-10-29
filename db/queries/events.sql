-- name: ListEvents :many
SELECT *
FROM events;

-- name: CreateEvent :one
INSERT INTO events (
  name, title, hidden, closed
) VALUES (
  ?, ?, ?, ?
)
RETURNING *;

-- name: GetEvent :one
SELECT *
FROM events
WHERE id = ?;

-- name: GetEventByName :one
SELECT *
FROM events
WHERE name = ?;

-- name: UpdateEvent :one
UPDATE events
SET
  title = ?,
  hidden = ?,
  closed = ?
WHERE name = ?
RETURNING *;

-- name: ListEventDates :many
SELECT *
FROM event_dates
WHERE event_id = ?;

-- name: GetEventDate :one
SELECT * FROM event_dates
WHERE id = ?;

-- name: GetEventDateByUid :one
SELECT * FROM event_dates
WHERE uid = ?;

-- name: CreateEventDate :one
INSERT INTO event_dates (
  event_id, uid, value, cancelled
) VALUES (?, ?, ?, ?)
RETURNING *;

-- name: UpdateEventDate :one
UPDATE event_dates
SET value = ?,
    cancelled = ?
WHERE id = ?
RETURNING *;

-- name: DeleteEventDate :exec
DELETE FROM event_dates
WHERE id = ?;
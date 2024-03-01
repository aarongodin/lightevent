-- name: ListEvents :many
SELECT *
FROM events;

-- name: ListVisibleEvents :many
SELECT events.*
FROM events
INNER JOIN (
  SELECT DISTINCT event_id
  FROM event_dates
  WHERE value > CURRENT_TIMESTAMP
) event_dates ON events.id = event_dates.event_id
WHERE events.hidden = 0;

-- name: CreateEvent :one
INSERT INTO events (
  name, title, description,  hidden, closed
) VALUES (
  ?, ?, ?, ?, ?
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
  description = ?,
  hidden = ?,
  closed = ?
WHERE name = ?
RETURNING *;

-- name: ListEventDates :many
SELECT *
FROM event_dates
WHERE value > CURRENT_TIMESTAMP
ORDER BY value ASC
LIMIT ?;

-- name: ListEventDatesByEventID :many
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
INSERT INTO event_dates (event_id, uid, value, cancelled)
SELECT events.id AS event_id, ?, ?, ?
FROM events
WHERE events.name = @event_name
RETURNING *;

-- name: UpdateEventDate :one
UPDATE event_dates
SET value = ?,
    cancelled = ?
WHERE uid = ?
RETURNING *;

-- name: DeleteEventDate :exec
DELETE FROM event_dates
WHERE id = ?;
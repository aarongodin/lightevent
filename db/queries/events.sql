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

-- name: GetEventDateByValue :one
SELECT * FROM event_dates
WHERE event_id = ? AND value = ?;

-- name: CreateEventDate :one
INSERT INTO event_dates (
  event_id, uid, value, cancelled
) VALUES (?, ?, ?, ?)
RETURNING *;

-- name: UpsertEventDate :one
INSERT INTO event_dates (
  event_id, uid, value, cancelled
) VALUES (?, ?, ?, ?)
ON CONFLICT DO UPDATE SET
  cancelled = excluded.cancelled
RETURNING *;

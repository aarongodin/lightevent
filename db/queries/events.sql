-- name: CreateEvent :one
INSERT INTO events (name, title, description, hidden, closed, capacity, created_at)
VALUES (?, ?, ?, ?, ?, ?, ?)
RETURNING *;

-- name: GetEventByID :one
SELECT * FROM events WHERE id = ?;

-- name: GetEventByName :one
SELECT * FROM events WHERE name = ?;

-- name: UpdateEvent :one
UPDATE events
SET title = ?, description = ?, hidden = ?, closed = ?, capacity = ?, updated_at = ?
WHERE id = ?
RETURNING *;

-- name: SetEventArchivedAt :one
UPDATE events
SET archived_at = ?, updated_at = ?
WHERE id = ?
RETURNING *;

-- name: DeleteEvent :exec
DELETE FROM events WHERE id = ?;

-- name: CountEventRegistrationsAll :one
-- Counts every registration for an event, including deleted ones.
SELECT COUNT(*) FROM registrations WHERE event_id = ?;

-- name: ListEvents :many
-- Lists events for administrators. The filter is one of 'upcoming', 'past', 'archived' or 'all'.
-- Events are ordered by their next upcoming date, then by most recently created.
SELECT e.*
FROM events e
LEFT JOIN (
  SELECT event_id, MIN(value) AS next_value
  FROM event_dates
  WHERE value > @now
  GROUP BY event_id
) nd ON nd.event_id = e.id
WHERE
  (CASE CAST(@filter AS TEXT)
    WHEN 'archived' THEN e.archived_at IS NOT NULL
    WHEN 'upcoming' THEN e.archived_at IS NULL AND nd.next_value IS NOT NULL
    WHEN 'past' THEN e.archived_at IS NULL AND nd.next_value IS NULL
    ELSE e.archived_at IS NULL
  END)
  AND (CAST(@search AS TEXT) = '' OR instr(lower(e.name), lower(CAST(@search AS TEXT))) > 0 OR instr(lower(e.title), lower(CAST(@search AS TEXT))) > 0)
ORDER BY nd.next_value IS NULL, nd.next_value, e.created_at DESC, e.id DESC
LIMIT @limit OFFSET @offset;

-- name: CountEvents :one
SELECT COUNT(*)
FROM events e
LEFT JOIN (
  SELECT event_id, MIN(value) AS next_value
  FROM event_dates
  WHERE value > @now
  GROUP BY event_id
) nd ON nd.event_id = e.id
WHERE
  (CASE CAST(@filter AS TEXT)
    WHEN 'archived' THEN e.archived_at IS NOT NULL
    WHEN 'upcoming' THEN e.archived_at IS NULL AND nd.next_value IS NOT NULL
    WHEN 'past' THEN e.archived_at IS NULL AND nd.next_value IS NULL
    ELSE e.archived_at IS NULL
  END)
  AND (CAST(@search AS TEXT) = '' OR instr(lower(e.name), lower(CAST(@search AS TEXT))) > 0 OR instr(lower(e.title), lower(CAST(@search AS TEXT))) > 0);

-- name: ListPublicEvents :many
-- Lists events that are visible to members and anonymous visitors: not hidden, not archived, and with at
-- least one upcoming date that is not cancelled.
SELECT e.*
FROM events e
INNER JOIN (
  SELECT event_id, MIN(value) AS next_value
  FROM event_dates
  WHERE value > @now AND cancelled = 0
  GROUP BY event_id
) nd ON nd.event_id = e.id
WHERE e.hidden = 0 AND e.archived_at IS NULL
  AND (CAST(@search AS TEXT) = '' OR instr(lower(e.name), lower(CAST(@search AS TEXT))) > 0 OR instr(lower(e.title), lower(CAST(@search AS TEXT))) > 0)
ORDER BY nd.next_value, e.id
LIMIT @limit OFFSET @offset;

-- name: CountPublicEvents :one
SELECT COUNT(*)
FROM events e
INNER JOIN (
  SELECT event_id
  FROM event_dates
  WHERE value > @now AND cancelled = 0
  GROUP BY event_id
) nd ON nd.event_id = e.id
WHERE e.hidden = 0 AND e.archived_at IS NULL
  AND (CAST(@search AS TEXT) = '' OR instr(lower(e.name), lower(CAST(@search AS TEXT))) > 0 OR instr(lower(e.title), lower(CAST(@search AS TEXT))) > 0);

-- name: ListEventDatesByEventID :many
SELECT * FROM event_dates WHERE event_id = ? ORDER BY value ASC;

-- name: GetEventDateByID :one
SELECT * FROM event_dates WHERE id = ?;

-- name: GetEventDateByUID :one
SELECT * FROM event_dates WHERE uid = ?;

-- name: CreateEventDate :one
INSERT INTO event_dates (uid, event_id, value, cancelled)
VALUES (?, ?, ?, 0)
RETURNING *;

-- name: UpdateEventDateValue :one
UPDATE event_dates SET value = ? WHERE id = ? RETURNING *;

-- name: CancelEventDate :one
UPDATE event_dates SET cancelled = 1 WHERE id = ? RETURNING *;

-- name: DeleteEventDate :exec
DELETE FROM event_dates WHERE id = ?;

-- name: ListUpcomingEventDates :many
SELECT sqlc.embed(d), sqlc.embed(e)
FROM event_dates d
INNER JOIN events e ON e.id = d.event_id
WHERE d.value > @now AND e.archived_at IS NULL
ORDER BY d.value ASC
LIMIT @limit;

-- name: CountActiveRegistrationsByEventDate :many
-- Returns the number of active single-date registrations for each date of an event, plus the
-- event's active series registrations (which count against every date).
SELECT
  d.id AS event_date_id,
  (SELECT COUNT(*) FROM registrations r
    WHERE r.event_date_id = d.id AND r.kind = 'once' AND r.deleted_at IS NULL) AS once_count,
  (SELECT COUNT(*) FROM registrations r
    WHERE r.event_id = d.event_id AND r.kind = 'series' AND r.deleted_at IS NULL) AS series_count
FROM event_dates d
WHERE d.event_id = ?;

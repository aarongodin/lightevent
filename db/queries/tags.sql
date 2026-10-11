-- name: CreateTag :one
INSERT INTO tags (name, label, created_at) VALUES (?, ?, ?) RETURNING *;

-- name: GetTagByName :one
SELECT * FROM tags WHERE name = ?;

-- name: UpdateTagLabel :one
UPDATE tags SET label = ?, updated_at = ? WHERE id = ? RETURNING *;

-- name: DeleteTag :exec
DELETE FROM tags WHERE id = ?;

-- name: ListTagsWithCounts :many
SELECT t.*, (SELECT COUNT(*) FROM event_tags et WHERE et.tag_id = t.id) AS event_count
FROM tags t
ORDER BY t.label COLLATE NOCASE, t.name;

-- name: ListPublicTags :many
-- Lists tags assigned to at least one event that is visible to members and anonymous visitors.
SELECT t.*
FROM tags t
WHERE EXISTS (
  SELECT 1 FROM event_tags et
  INNER JOIN events e ON e.id = et.event_id
  WHERE et.tag_id = t.id AND e.hidden = 0 AND e.archived_at IS NULL
)
ORDER BY t.label COLLATE NOCASE, t.name;

-- name: ListTagNamesByEventID :many
SELECT t.name
FROM event_tags et
INNER JOIN tags t ON t.id = et.tag_id
WHERE et.event_id = ?
ORDER BY t.name;

-- name: AddEventTag :exec
INSERT INTO event_tags (event_id, tag_id) VALUES (?, ?);

-- name: DeleteEventTags :exec
DELETE FROM event_tags WHERE event_id = ?;

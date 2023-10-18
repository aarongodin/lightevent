// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.22.0
// source: events.sql

package storage

import (
	"context"
	"time"
)

const createEvent = `-- name: CreateEvent :one
INSERT INTO events (
  name, title, hidden, closed
) VALUES (
  ?, ?, ?, ?
)
RETURNING id, name, title, hidden, closed, created_at, updated_at
`

type CreateEventParams struct {
	Name   string
	Title  string
	Hidden int64
	Closed int64
}

func (q *Queries) CreateEvent(ctx context.Context, arg CreateEventParams) (Event, error) {
	row := q.db.QueryRowContext(ctx, createEvent,
		arg.Name,
		arg.Title,
		arg.Hidden,
		arg.Closed,
	)
	var i Event
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Title,
		&i.Hidden,
		&i.Closed,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const createEventDate = `-- name: CreateEventDate :one
INSERT INTO event_dates (
  event_id, uid, value, cancelled
) VALUES (?, ?, ?, ?)
RETURNING id, uid, event_id, value, cancelled
`

type CreateEventDateParams struct {
	EventID   int64
	Uid       string
	Value     time.Time
	Cancelled int64
}

func (q *Queries) CreateEventDate(ctx context.Context, arg CreateEventDateParams) (EventDate, error) {
	row := q.db.QueryRowContext(ctx, createEventDate,
		arg.EventID,
		arg.Uid,
		arg.Value,
		arg.Cancelled,
	)
	var i EventDate
	err := row.Scan(
		&i.ID,
		&i.Uid,
		&i.EventID,
		&i.Value,
		&i.Cancelled,
	)
	return i, err
}

const getEvent = `-- name: GetEvent :one
SELECT id, name, title, hidden, closed, created_at, updated_at
FROM events
WHERE id = ?
`

func (q *Queries) GetEvent(ctx context.Context, id int64) (Event, error) {
	row := q.db.QueryRowContext(ctx, getEvent, id)
	var i Event
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Title,
		&i.Hidden,
		&i.Closed,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const getEventByName = `-- name: GetEventByName :one
SELECT id, name, title, hidden, closed, created_at, updated_at
FROM events
WHERE name = ?
`

func (q *Queries) GetEventByName(ctx context.Context, name string) (Event, error) {
	row := q.db.QueryRowContext(ctx, getEventByName, name)
	var i Event
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Title,
		&i.Hidden,
		&i.Closed,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const getEventDate = `-- name: GetEventDate :one
SELECT id, uid, event_id, value, cancelled FROM event_dates
WHERE id = ?
`

func (q *Queries) GetEventDate(ctx context.Context, id int64) (EventDate, error) {
	row := q.db.QueryRowContext(ctx, getEventDate, id)
	var i EventDate
	err := row.Scan(
		&i.ID,
		&i.Uid,
		&i.EventID,
		&i.Value,
		&i.Cancelled,
	)
	return i, err
}

const getEventDateByValue = `-- name: GetEventDateByValue :one
SELECT id, uid, event_id, value, cancelled FROM event_dates
WHERE event_id = ? AND value = ?
`

type GetEventDateByValueParams struct {
	EventID int64
	Value   time.Time
}

func (q *Queries) GetEventDateByValue(ctx context.Context, arg GetEventDateByValueParams) (EventDate, error) {
	row := q.db.QueryRowContext(ctx, getEventDateByValue, arg.EventID, arg.Value)
	var i EventDate
	err := row.Scan(
		&i.ID,
		&i.Uid,
		&i.EventID,
		&i.Value,
		&i.Cancelled,
	)
	return i, err
}

const listEventDates = `-- name: ListEventDates :many
SELECT id, uid, event_id, value, cancelled
FROM event_dates
WHERE event_id = ?
`

func (q *Queries) ListEventDates(ctx context.Context, eventID int64) ([]EventDate, error) {
	rows, err := q.db.QueryContext(ctx, listEventDates, eventID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []EventDate
	for rows.Next() {
		var i EventDate
		if err := rows.Scan(
			&i.ID,
			&i.Uid,
			&i.EventID,
			&i.Value,
			&i.Cancelled,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const listEvents = `-- name: ListEvents :many
SELECT id, name, title, hidden, closed, created_at, updated_at
FROM events
`

func (q *Queries) ListEvents(ctx context.Context) ([]Event, error) {
	rows, err := q.db.QueryContext(ctx, listEvents)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Event
	for rows.Next() {
		var i Event
		if err := rows.Scan(
			&i.ID,
			&i.Name,
			&i.Title,
			&i.Hidden,
			&i.Closed,
			&i.CreatedAt,
			&i.UpdatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const updateEvent = `-- name: UpdateEvent :one
UPDATE events
SET
  title = ?,
  hidden = ?,
  closed = ?
WHERE name = ?
RETURNING id, name, title, hidden, closed, created_at, updated_at
`

type UpdateEventParams struct {
	Title  string
	Hidden int64
	Closed int64
	Name   string
}

func (q *Queries) UpdateEvent(ctx context.Context, arg UpdateEventParams) (Event, error) {
	row := q.db.QueryRowContext(ctx, updateEvent,
		arg.Title,
		arg.Hidden,
		arg.Closed,
		arg.Name,
	)
	var i Event
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Title,
		&i.Hidden,
		&i.Closed,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const upsertEventDate = `-- name: UpsertEventDate :one
INSERT INTO event_dates (
  event_id, uid, value, cancelled
) VALUES (?, ?, ?, ?)
ON CONFLICT DO UPDATE SET
  cancelled = excluded.cancelled
RETURNING id, uid, event_id, value, cancelled
`

type UpsertEventDateParams struct {
	EventID   int64
	Uid       string
	Value     time.Time
	Cancelled int64
}

func (q *Queries) UpsertEventDate(ctx context.Context, arg UpsertEventDateParams) (EventDate, error) {
	row := q.db.QueryRowContext(ctx, upsertEventDate,
		arg.EventID,
		arg.Uid,
		arg.Value,
		arg.Cancelled,
	)
	var i EventDate
	err := row.Scan(
		&i.ID,
		&i.Uid,
		&i.EventID,
		&i.Value,
		&i.Cancelled,
	)
	return i, err
}

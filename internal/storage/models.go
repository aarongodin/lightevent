// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.22.0

package storage

import (
	"database/sql"
	"time"
)

type ApiKey struct {
	ID        int64
	Name      string
	Secret    string
	CreatedAt time.Time
}

type Event struct {
	ID        int64
	Name      string
	Title     string
	Hidden    int64
	Closed    int64
	CreatedAt time.Time
	UpdatedAt sql.NullTime
}

type EventDate struct {
	ID        int64
	Uid       string
	EventID   int64
	Value     time.Time
	Cancelled int64
}

type Member struct {
	ID        int64
	Email     string
	Verified  int64
	FirstName sql.NullString
	LastName  sql.NullString
	CreatedAt time.Time
}

type Registration struct {
	ID          int64
	ConfCode    string
	Kind        string
	EventID     int64
	EventDateID sql.NullInt64
	MemberID    int64
	CreatedAt   time.Time
}

type Session struct {
	ID        int64
	Key       string
	Subject   string
	Kind      string
	CreatedAt time.Time
}

type Setting struct {
	ID        int64
	Name      string
	Value     []byte
	CreatedAt time.Time
	UpdatedAt sql.NullTime
}

type User struct {
	ID           int64
	Username     string
	PasswordHash string
	FirstName    sql.NullString
	LastName     sql.NullString
	CreatedAt    time.Time
	UpdatedAt    sql.NullTime
}

type Verification struct {
	ID        int64
	Email     string
	Key       string
	Completed int64
	Challenge string
	CreatedAt time.Time
}

package server

import (
	"database/sql"
	"time"

	lighteventv1 "github.com/aarongodin/lightevent/internal/gen/lightevent/v1"
	"github.com/aarongodin/lightevent/internal/storage"
)

const (
	kindOnce   = "once"
	kindSeries = "series"
)

func formatTime(t time.Time) string {
	return t.UTC().Format(time.RFC3339)
}

func formatNullTime(t sql.NullTime) string {
	if !t.Valid {
		return ""
	}
	return formatTime(t.Time)
}

func translateEvent(rec storage.Event) *lighteventv1.Event {
	return &lighteventv1.Event{
		Name:        rec.Name,
		Title:       rec.Title,
		Description: rec.Description,
		Hidden:      storage.IntToBool(rec.Hidden),
		Closed:      storage.IntToBool(rec.Closed),
		Capacity:    int32(rec.Capacity),
		Archived:    rec.ArchivedAt.Valid,
		Dates:       []*lighteventv1.EventDate{},
		CreatedAt:   formatTime(rec.CreatedAt),
		UpdatedAt:   formatNullTime(rec.UpdatedAt),
	}
}

func translateEventDate(rec storage.EventDate) *lighteventv1.EventDate {
	return &lighteventv1.EventDate{
		Uid:       rec.Uid,
		Value:     formatTime(rec.Value),
		Cancelled: storage.IntToBool(rec.Cancelled),
	}
}

func translateMember(rec storage.Member) *lighteventv1.Member {
	return &lighteventv1.Member{
		Uid:       rec.Uid,
		Email:     rec.Email,
		FirstName: rec.FirstName,
		LastName:  rec.LastName,
		Verified:  storage.IntToBool(rec.Verified),
		CreatedAt: formatTime(rec.CreatedAt),
	}
}

func translateUser(rec storage.User) *lighteventv1.User {
	return &lighteventv1.User{
		Uid:       rec.Uid,
		Username:  rec.Username,
		FirstName: rec.FirstName,
		LastName:  rec.LastName,
		Email:     rec.Email,
		CreatedAt: formatTime(rec.CreatedAt),
		UpdatedAt: formatNullTime(rec.UpdatedAt),
	}
}

func translateAPIKey(rec storage.ApiKey) *lighteventv1.APIKey {
	return &lighteventv1.APIKey{
		Uid:        rec.Uid,
		Name:       rec.Name,
		Prefix:     rec.Prefix,
		CreatedAt:  formatTime(rec.CreatedAt),
		LastUsedAt: formatNullTime(rec.LastUsedAt),
	}
}

func registrationKindFromString(kind string) lighteventv1.RegistrationKind {
	switch kind {
	case kindOnce:
		return lighteventv1.RegistrationKind_REGISTRATION_KIND_ONCE
	case kindSeries:
		return lighteventv1.RegistrationKind_REGISTRATION_KIND_SERIES
	}
	return lighteventv1.RegistrationKind_REGISTRATION_KIND_UNSPECIFIED
}

func stringFromRegistrationKind(kind lighteventv1.RegistrationKind) string {
	switch kind {
	case lighteventv1.RegistrationKind_REGISTRATION_KIND_ONCE:
		return kindOnce
	case lighteventv1.RegistrationKind_REGISTRATION_KIND_SERIES:
		return kindSeries
	}
	return ""
}

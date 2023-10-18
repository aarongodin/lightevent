package server

import (
	"time"

	"github.com/aarongodin/lightevent/internal/service"
	"github.com/aarongodin/lightevent/internal/storage"
)

var (
	KindOnce   = "once"
	KindSeries = "series"
)

func translateEvent(rec storage.Event) *service.Event {
	return &service.Event{
		Name:   rec.Name,
		Title:  rec.Title,
		Hidden: rec.Hidden == 1,
		Closed: rec.Closed == 1,
		Dates:  []*service.EventDate{},
	}
}

func translateEventDate(rec storage.EventDate) *service.EventDate {
	return &service.EventDate{
		Value:     rec.Value.Format(time.RFC3339),
		Cancelled: rec.Cancelled == 1,
	}
}

func translateMember(rec storage.Member) *service.Member {
	member := &service.Member{
		Email:     rec.Email,
		CreatedAt: rec.CreatedAt.Format(time.RFC3339),
		FirstName: rec.FirstName.String,
		LastName:  rec.LastName.String,
	}
	storage.SetBoolFromInt64(&member.Verified, rec.Verified)
	return member
}

func translateUser(rec storage.User) *service.User {
	user := &service.User{
		Username:  rec.Username,
		FirstName: rec.FirstName.String,
		LastName:  rec.LastName.String,
		CreatedAt: rec.CreatedAt.Format(time.RFC3339),
	}
	if rec.UpdatedAt.Valid {
		user.UpdatedAt = rec.UpdatedAt.Time.Format(time.RFC3339)
	}
	return user
}

func translateAPIKey(rec storage.ApiKey) *service.APIKeyWithSecret {
	return &service.APIKeyWithSecret{
		Name:   rec.Name,
		Secret: rec.Secret,
	}
}

func translateSession(rec storage.Session) *service.Session {
	return &service.Session{
		Key:       rec.Key,
		Subject:   rec.Subject,
		Kind:      rec.Kind,
		CreatedAt: rec.CreatedAt.Format(time.RFC3339),
	}
}

func registrationKindFromString(kind string) service.RegistrationKind {
	switch kind {
	case KindOnce:
		return service.RegistrationKind_REG_ONCE
	case KindSeries:
		return service.RegistrationKind_REG_SERIES
	}
	return -1
}

func stringFromRegistrationKind(kind service.RegistrationKind) string {
	switch kind {
	case service.RegistrationKind_REG_ONCE:
		return KindOnce
	case service.RegistrationKind_REG_SERIES:
		return KindSeries
	}
	return ""
}

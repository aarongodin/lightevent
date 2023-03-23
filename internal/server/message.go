package server

import (
	"time"

	"github.com/aarongodin/spectral/internal/server/repository"
	service "github.com/aarongodin/spectral/internal/service"
	gonanoid "github.com/matoous/go-nanoid/v2"
	"github.com/twitchtv/twirp"
)

type EventDateWithID struct {
	ID string
	repository.EventDate
}

func eventRecordDatesToMessageEventDates(eventDates map[string]repository.EventDate) []*service.EventDate {
	dates := make([]*EventDateWithID, 0, len(eventDates))
	msgDates := make([]*service.EventDate, 0, len(eventDates))

	lastIndex := 0
	for dateID, d := range eventDates {
		dates = append(dates, &EventDateWithID{
			ID:        dateID,
			EventDate: d,
		})
		for i := lastIndex; i > 0; i-- {
			if dates[i].Value.Before(dates[i-1].Value) {
				swap := dates[i-1]
				dates[i-1] = dates[i]
				dates[i] = swap
			}
		}
		lastIndex += 1
	}

	for _, d := range dates {
		msgDates = append(msgDates, &service.EventDate{
			Id:    d.ID,
			Value: d.Value.Format(time.RFC3339),
		})
	}

	return msgDates
}

func eventRecordToMessage(rec *repository.EventRecord) *service.Event {
	return &service.Event{
		Name:   rec.Name,
		Title:  rec.Title,
		Hidden: rec.Hidden,
		Closed: rec.Closed,
		Dates:  eventRecordDatesToMessageEventDates(rec.Dates),
	}
}

func eventRecordsToMessage(recs []repository.EventRecord) []*service.Event {
	events := make([]*service.Event, 0, len(recs))
	for _, rec := range recs {
		events = append(events, eventRecordToMessage(&rec))
	}
	return events
}

func eventMessageToRecord(msg *service.Event) (*repository.EventRecord, error) {
	dates := make(map[string]repository.EventDate)
	for _, d := range msg.Dates {
		dateID := d.Id
		parsed, err := time.Parse(time.RFC3339, d.Value)
		if err != nil {
			return nil, twirp.InvalidArgumentError("dates", "date value must be valid RFC3339 date")
		}
		if dateID == "" {
			dateID, err = gonanoid.New()
			if err != nil {
				return nil, twirp.InternalErrorWith(err)
			}
		}
		dates[dateID] = repository.EventDate{
			Value: parsed,
		}
	}

	return &repository.EventRecord{
		Name:   msg.Name,
		Title:  msg.Title,
		Hidden: msg.Hidden,
		Closed: msg.Closed,
		Dates:  dates,
	}, nil
}

func registrationKindFromString(kind string) service.RegistrationKind {
	switch kind {
	case repository.KIND_ONCE:
		return service.RegistrationKind_REG_ONCE
	case repository.KIND_SERIES:
		return service.RegistrationKind_REG_SERIES
	}
	return -1
}

func registrationKindFromEnum(kind service.RegistrationKind) string {
	switch kind {
	case service.RegistrationKind_REG_ONCE:
		return repository.KIND_ONCE
	case service.RegistrationKind_REG_SERIES:
		return repository.KIND_SERIES
	}
	return ""
}

func registrationRecordToMessage(rec *repository.RegistrationRecord, event *repository.EventRecord) (*service.Registration, error) {
	msg := &service.Registration{
		ConfCode:    rec.ConfCode,
		Kind:        registrationKindFromString(rec.Kind),
		EventName:   event.Name,
		EventDate:   rec.EventDate.Format(time.RFC3339),
		MemberEmail: rec.MemberEmail,
	}

	if rec.EventDate != nil {
		msg.EventDate = rec.EventDate.Format(time.RFC3339)
	}

	return msg, nil
}

func registrationRecordsToMessage(recs []*repository.RegistrationRecord, event *repository.EventRecord) ([]*service.Registration, error) {
	registrations := make([]*service.Registration, 0, len(recs))
	for _, rec := range recs {
		reg, err := registrationRecordToMessage(rec, event)
		if err != nil {
			return nil, err
		}
		registrations = append(registrations, reg)
	}
	return registrations, nil
}

func writeableRegistrationMessageToRecord(msg *service.WriteableRegistration, event *repository.EventRecord) (*repository.RegistrationRecord, error) {
	rec := &repository.RegistrationRecord{
		EventID:     event.ID,
		Kind:        registrationKindFromEnum(msg.Kind),
		MemberEmail: msg.MemberEmail,
	}

	if rec.Kind == "" {
		return nil, twirp.InvalidArgumentError("Kind", "must be one of allowed values")
	}

	if msg.EventDate != "" {
		eventDate, err := time.Parse(time.RFC3339, msg.EventDate)
		if err != nil {
			return nil, twirp.InvalidArgumentError("EventDate", "must be a valid RFC3339 time")
		}
		rec.EventDate = &eventDate
	}

	return rec, nil
}

func memberRegistrationMessageToRecord(msg *service.MemberRegistration, event *repository.EventRecord) (*repository.RegistrationRecord, error) {
	rec := &repository.RegistrationRecord{
		EventID: event.ID,
		Kind:    registrationKindFromEnum(msg.Kind),
	}

	if rec.Kind == "" {
		return nil, twirp.InvalidArgumentError("Kind", "must be one of allowed values")
	}

	if msg.EventDate != "" {
		eventDate, err := time.Parse(time.RFC3339, msg.EventDate)
		if err != nil {
			return nil, twirp.InvalidArgumentError("EventDate", "must be a valid RFC3339 time")
		}
		rec.EventDate = &eventDate
	}

	return rec, nil
}

func sessionRecordToMessage(rec *repository.SessionRecord) *service.Session {
	return &service.Session{
		Key:       rec.Key,
		Kind:      rec.Kind,
		Subject:   rec.Subject,
		CreatedAt: rec.CreatedAt.Format(time.RFC3339),
	}
}

func sessionRecordsToMessage(recs []*repository.SessionRecord) []*service.Session {
	sessions := make([]*service.Session, 0, len(recs))
	for _, rec := range recs {
		sessions = append(sessions, sessionRecordToMessage(rec))
	}
	return sessions
}

func userRecordToMessage(rec *repository.UserRecord) *service.User {
	return &service.User{
		Username: rec.Username,
		Name:     rec.Name,
	}
}

func userRecordsToMessage(recs []*repository.UserRecord) []*service.User {
	users := make([]*service.User, 0, len(recs))
	for _, rec := range recs {
		users = append(users, userRecordToMessage(rec))
	}
	return users
}

func memberRecordToMessage(rec *repository.MemberRecord) *service.Member {
	return &service.Member{
		Email:     rec.Email,
		CreatedAt: rec.CreatedAt.Format(time.RFC3339),
	}
}

func memberRecordsToMessage(recs []*repository.MemberRecord) []*service.Member {
	users := make([]*service.Member, 0, len(recs))
	for _, rec := range recs {
		users = append(users, memberRecordToMessage(rec))
	}
	return users
}

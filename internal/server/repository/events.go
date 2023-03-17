package repository

import (
	"time"

	"github.com/asdine/storm/v3"
)

type EventRecord struct {
	ID        int `storm:"id,increment"`
	CreatedAt time.Time
	UpdatedAt time.Time
	// Name is a URL-safe identifier for an event.
	Name string
	// Title is a huamn-readable string.
	Title string
	// Hidden events do not appear to members in the event listing.
	Hidden bool
	// Closed events do not accept new registrations.
	Closed bool
}

type EventsRepo interface {
	ListEvents() ([]EventRecord, error)
	CreateEvent(*EventRecord) (*EventRecord, error)
	UpdateEvent(*EventRecord) (*EventRecord, error)
	GetEvent(id int) (*EventRecord, error)
	GetEventByName(name string) (*EventRecord, error)
}

type eventsRepo struct {
	db *storm.DB
}

func (e eventsRepo) ListEvents() ([]EventRecord, error) {
	var events []EventRecord
	if err := e.db.All(&events); err != nil {
		return nil, err
	}
	return events, nil
}

func (e eventsRepo) CreateEvent(event *EventRecord) (*EventRecord, error) {
	if err := e.db.Save(event); err != nil {
		return nil, err
	}
	return event, nil
}

func (e eventsRepo) UpdateEvent(event *EventRecord) (*EventRecord, error) {
	if err := e.db.Update(event); err != nil {
		return nil, err
	}
	return event, nil
}

func (e eventsRepo) GetEvent(id int) (*EventRecord, error) {
	event := new(EventRecord)
	if err := e.db.One("ID", id, event); err != nil {
		return nil, err
	}
	return event, nil
}

func (e eventsRepo) GetEventByName(name string) (*EventRecord, error) {
	event := new(EventRecord)
	if err := e.db.One("Name", name, event); err != nil {
		return nil, err
	}
	return event, nil
}

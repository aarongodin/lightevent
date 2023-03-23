package repository

import (
	"time"

	"github.com/asdine/storm/v3"
)

type EventDate struct {
	Value time.Time
}

type EventRecord struct {
	ID        int `storm:"id,increment"`
	CreatedAt time.Time
	UpdatedAt time.Time
	// Name is a URL-safe identifier for an event.
	Name string `storm:"unique"`
	// Title is a huamn-readable string.
	Title string
	// Hidden events do not appear to members in the event listing.
	Hidden bool
	// Closed events do not accept new registrations.
	Closed bool
	// Dates is the set of 1 or many dates this event exists for.
	Dates map[string]EventDate
}

type EventsRepo interface {
	ListEvents() ([]EventRecord, error)
	Validate(rec *EventRecord, update bool) error
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
	if err := e.db.All(&events, storm.Reverse()); err != nil {
		return nil, err
	}
	return events, nil
}

func (e eventsRepo) Validate(rec *EventRecord, update bool) error {
	// Date uniqueness check
	for id, date := range rec.Dates {
		for nestedID, nestedDate := range rec.Dates {
			if id != nestedID && date.Value.Equal(nestedDate.Value) {
				return &ErrValidationFailed{"Dates", "event dates must be unique"}
			}
		}
	}

	// Validations only on update
	if update {
		existing, err := e.GetEvent(rec.ID)
		if err != nil {
			return err
		}

		// Check that all existing dates are in the update record
		for id := range existing.Dates {
			if _, exists := rec.Dates[id]; !exists {
				return &ErrValidationFailed{"Dates", "event dates cannot be removed"}
			}
		}
	}

	return nil
}

func (e eventsRepo) CreateEvent(event *EventRecord) (*EventRecord, error) {
	event.CreatedAt = time.Now()
	event.UpdatedAt = time.Now()
	if err := e.db.Save(event); err != nil {
		return nil, err
	}
	return event, nil
}

func (e eventsRepo) UpdateEvent(event *EventRecord) (*EventRecord, error) {
	event.UpdatedAt = time.Now()
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

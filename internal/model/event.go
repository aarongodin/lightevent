package model

import (
	"fmt"
	"time"

	"github.com/aarongodin/lightevent/internal/service"
	"github.com/aarongodin/lightevent/internal/storage"
	"github.com/google/uuid"
)

type CreateEventItems struct {
	Event      storage.CreateEventParams
	EventDates []storage.CreateEventDateParams
}

type UpdateEventItems struct {
	Event            storage.UpdateEventParams
	EventDatesCreate []storage.CreateEventDateParams
	EventDatesUpdate []storage.UpdateEventDateParams
}

// CreateEvent accepts an Event message, validates it and returns the required storage items to create the event.
func CreateEvent(message *service.Event) (*CreateEventItems, error) {
	name, err := Validate.Identifier("name", message.Name)
	if err != nil {
		return nil, err
	}
	title, err := Validate.Title("title", message.Title)
	if err != nil {
		return nil, err
	}

	event := storage.CreateEventParams{
		Name:  name,
		Title: title,
	}
	storage.SetInt64FromBool(&event.Hidden, message.Hidden)
	storage.SetInt64FromBool(&event.Closed, message.Closed)
	storage.SetOptionalString(&event.Description, &message.Description)

	if len(message.Dates) == 0 {
		return nil, ErrValidationFailed{"dates", "event must have at least one date"}
	}

	eventDates := make([]storage.CreateEventDateParams, 0, len(message.Dates))
	eventDateValues := make(map[time.Time]bool)
	for i, date := range message.Dates {
		value, err := time.Parse(time.RFC3339, date.Value)
		if err != nil {
			return nil, err
		}
		if _, exists := eventDateValues[value]; exists {
			return nil, ErrValidationFailed{fmt.Sprintf("dates[%d]", i), "event dates must be unique"}
		}
		eventDateValues[value] = true
		eventDateParams := storage.CreateEventDateParams{
			EventName: event.Name,
			Uid:       uuid.New().String(),
			Value:     value,
		}
		storage.SetInt64FromBool(&eventDateParams.Cancelled, date.Cancelled)
		eventDates = append(eventDates, eventDateParams)
	}

	return &CreateEventItems{
		Event:      event,
		EventDates: eventDates,
	}, nil
}

// UpdateEvent accepts an Event message, validates it and returns the required storage items to update the event.
func UpdateEvent(message *service.Event) (*UpdateEventItems, error) {
	name, err := Validate.Identifier("name", message.Name)
	if err != nil {
		return nil, err
	}
	title, err := Validate.Title("title", message.Title)
	if err != nil {
		return nil, err
	}

	event := storage.UpdateEventParams{
		Name:  name,
		Title: title,
	}
	storage.SetInt64FromBool(&event.Hidden, message.Hidden)
	storage.SetInt64FromBool(&event.Closed, message.Closed)
	storage.SetOptionalString(&event.Description, &message.Description)

	if len(message.Dates) == 0 {
		return nil, ErrValidationFailed{"dates", "event must have at least one date"}
	}

	eventDatesCreate := make([]storage.CreateEventDateParams, 0)
	eventDatesUpdate := make([]storage.UpdateEventDateParams, 0)
	eventDateValues := make(map[time.Time]bool)
	for i, date := range message.Dates {
		value, err := time.Parse(time.RFC3339, date.Value)
		if err != nil {
			return nil, err
		}
		if _, exists := eventDateValues[value]; exists {
			return nil, ErrValidationFailed{fmt.Sprintf("dates[%d]", i), "event dates must be unique"}
		}
		eventDateValues[value] = true

		if date.Uid == "" {
			eventDateParams := storage.CreateEventDateParams{
				EventName: name,
				Uid:       uuid.New().String(),
				Value:     value,
			}
			storage.SetInt64FromBool(&eventDateParams.Cancelled, date.Cancelled)
			eventDatesCreate = append(eventDatesCreate, eventDateParams)
		} else {
			uid, err := Validate.Identifier(fmt.Sprintf("dates[%d].uid", i), date.Uid)
			if err != nil {
				return nil, err
			}
			eventDateParams := storage.UpdateEventDateParams{
				Uid:   uid,
				Value: value,
			}
			storage.SetInt64FromBool(&eventDateParams.Cancelled, date.Cancelled)
			eventDatesUpdate = append(eventDatesUpdate, eventDateParams)
		}
	}

	return &UpdateEventItems{
		Event:            event,
		EventDatesCreate: eventDatesCreate,
		EventDatesUpdate: eventDatesUpdate,
	}, nil
}

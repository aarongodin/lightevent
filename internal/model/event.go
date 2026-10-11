package model

import (
	"fmt"
	"time"

	lighteventv1 "github.com/aarongodin/lightevent/internal/gen/lightevent/v1"
)

// EventInput is a validated event from a create or update request.
type EventInput struct {
	Name        string
	Title       string
	Description string
	Hidden      bool
	Closed      bool
	Capacity    int64
	Dates       []EventDateInput
	// Tags are unique tag names, in the order given.
	Tags []string
}

// EventDateInput is a validated event date. UID is empty for new dates.
type EventDateInput struct {
	UID   string
	Value time.Time
}

// Event validates an event message. Dates must be present and unique.
func Event(msg *lighteventv1.Event) (*EventInput, error) {
	if msg == nil {
		return nil, invalid("event", "is required")
	}
	var (
		in  EventInput
		err error
	)
	if in.Name, err = EventName("event.name", msg.Name); err != nil {
		return nil, err
	}
	if in.Title, err = Title("event.title", msg.Title); err != nil {
		return nil, err
	}
	if in.Description, err = Description("event.description", msg.Description); err != nil {
		return nil, err
	}
	if in.Capacity, err = Capacity("event.capacity", msg.Capacity); err != nil {
		return nil, err
	}
	in.Hidden = msg.Hidden
	in.Closed = msg.Closed

	if len(msg.Tags) > MaxEventTags {
		return nil, invalid("event.tags", fmt.Sprintf("event can have at most %d tags", MaxEventTags))
	}
	seenTags := make(map[string]bool, len(msg.Tags))
	for i, t := range msg.Tags {
		name, err := TagName(fmt.Sprintf("event.tags[%d]", i), t)
		if err != nil {
			return nil, err
		}
		if !seenTags[name] {
			seenTags[name] = true
			in.Tags = append(in.Tags, name)
		}
	}

	if len(msg.Dates) == 0 {
		return nil, invalid("event.dates", "event must have at least one date")
	}
	if len(msg.Dates) > MaxEventDates {
		return nil, invalid("event.dates", fmt.Sprintf("event can have at most %d dates", MaxEventDates))
	}

	seenValues := make(map[time.Time]bool, len(msg.Dates))
	seenUIDs := make(map[string]bool, len(msg.Dates))
	for i, d := range msg.Dates {
		field := fmt.Sprintf("event.dates[%d]", i)
		if d == nil {
			return nil, invalid(field, "is required")
		}
		value, err := Timestamp(field+".value", d.Value)
		if err != nil {
			return nil, err
		}
		if seenValues[value] {
			return nil, invalid(field+".value", "event dates must be unique")
		}
		seenValues[value] = true
		if d.Uid != "" {
			if seenUIDs[d.Uid] {
				return nil, invalid(field+".uid", "is duplicated")
			}
			seenUIDs[d.Uid] = true
		}
		in.Dates = append(in.Dates, EventDateInput{UID: d.Uid, Value: value})
	}
	return &in, nil
}

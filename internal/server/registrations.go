package server

import (
	"context"
	"database/sql"
	"strings"

	"connectrpc.com/connect"
	"github.com/aarongodin/lightevent/internal/access"
	lighteventv1 "github.com/aarongodin/lightevent/internal/gen/lightevent/v1"
	"github.com/aarongodin/lightevent/internal/notifications"
	"github.com/aarongodin/lightevent/internal/secret"
	"github.com/aarongodin/lightevent/internal/storage"
)

// confCodeLength is the number of base32 characters in a confirmation code (40 bits).
const confCodeLength = 8

// registrationRules selects which checks apply when creating a registration.
type registrationRules struct {
	// selfService applies the rules for members registering themselves: the event must be visible and
	// open, and dates must be in the future. Administrators may register members for hidden or closed
	// events and for past dates.
	selfService bool
}

// createdRegistration is the result of createRegistration.
type createdRegistration struct {
	reg    storage.Registration
	event  storage.Event
	date   *storage.EventDate
	member storage.Member
}

// createRegistration validates and stores a registration within a transaction. Transactions begin with
// BEGIN IMMEDIATE, so capacity checks and the insert cannot race with another registration.
func (s *Server) createRegistration(ctx context.Context, member storage.Member, in *lighteventv1.RegistrationInput, rules registrationRules) (*createdRegistration, error) {
	if in == nil {
		return nil, newError(connect.CodeInvalidArgument, "registration: is required")
	}
	kind := stringFromRegistrationKind(in.Kind)
	if kind == "" {
		return nil, newError(connect.CodeInvalidArgument, "registration.kind: must be ONCE or SERIES")
	}

	now := s.Now()
	var out createdRegistration
	err := s.store.WithTx(ctx, func(q *storage.Queries) error {
		event, err := q.GetEventByName(ctx, in.EventName)
		if err != nil {
			return err
		}
		if rules.selfService && !visibleToPublic(event) {
			return notFound("event")
		}
		if event.ArchivedAt.Valid {
			return newError(connect.CodeFailedPrecondition, "event is archived")
		}
		if rules.selfService && storage.IntToBool(event.Closed) {
			return newError(connect.CodeFailedPrecondition, "registration for this event is closed")
		}
		if rules.selfService && !storage.IntToBool(member.Verified) {
			return newError(connect.CodePermissionDenied, "member email address is not verified")
		}

		params := storage.CreateRegistrationParams{Kind: kind, EventID: event.ID, MemberID: member.ID, CreatedAt: now}
		seriesCount, err := q.CountActiveSeriesRegistrationsForEvent(ctx, event.ID)
		if err != nil {
			return err
		}

		switch kind {
		case kindOnce:
			if in.EventDateUid == nil || *in.EventDateUid == "" {
				return newError(connect.CodeInvalidArgument, "registration.event_date_uid: is required when kind is ONCE")
			}
			date, err := q.GetEventDateByUID(ctx, *in.EventDateUid)
			if err != nil {
				if isNoRows(err) {
					return newError(connect.CodeInvalidArgument, "registration.event_date_uid: is not a date of this event")
				}
				return err
			}
			if date.EventID != event.ID {
				return newError(connect.CodeInvalidArgument, "registration.event_date_uid: is not a date of this event")
			}
			if storage.IntToBool(date.Cancelled) {
				return newError(connect.CodeFailedPrecondition, "this event date has been cancelled")
			}
			if rules.selfService && !date.Value.After(now) {
				return newError(connect.CodeFailedPrecondition, "this event date has already passed")
			}
			hasSeries, err := q.HasActiveSeriesRegistration(ctx, storage.HasActiveSeriesRegistrationParams{MemberID: member.ID, EventID: event.ID})
			if err != nil {
				return err
			}
			if hasSeries > 0 {
				return newError(connect.CodeAlreadyExists, "member is already registered for all dates of this event")
			}
			if event.Capacity > 0 {
				onceCount, err := q.CountActiveOnceRegistrationsForDate(ctx, sql.NullInt64{Int64: date.ID, Valid: true})
				if err != nil {
					return err
				}
				if onceCount+seriesCount >= event.Capacity {
					return newError(connect.CodeResourceExhausted, "this event date is full")
				}
			}
			params.EventDateID = sql.NullInt64{Int64: date.ID, Valid: true}
			out.date = &date

		case kindSeries:
			existing, err := q.CountActiveMemberRegistrationsForEvent(ctx, storage.CountActiveMemberRegistrationsForEventParams{MemberID: member.ID, EventID: event.ID})
			if err != nil {
				return err
			}
			if existing > 0 {
				return newError(connect.CodeAlreadyExists, "member is already registered for this event; cancel existing registrations first")
			}
			dates, err := q.ListEventDatesByEventID(ctx, event.ID)
			if err != nil {
				return err
			}
			upcoming := 0
			for _, d := range dates {
				if storage.IntToBool(d.Cancelled) || (rules.selfService && !d.Value.After(now)) {
					continue
				}
				upcoming++
				if event.Capacity > 0 {
					onceCount, err := q.CountActiveOnceRegistrationsForDate(ctx, sql.NullInt64{Int64: d.ID, Valid: true})
					if err != nil {
						return err
					}
					if onceCount+seriesCount >= event.Capacity {
						return newError(connect.CodeResourceExhausted, "one or more dates of this event are full")
					}
				}
			}
			if upcoming == 0 {
				return newError(connect.CodeFailedPrecondition, "this event has no upcoming dates")
			}
		}

		// Retry on the (unlikely) collision of a confirmation code.
		for attempt := 0; ; attempt++ {
			params.ConfCode = secret.Code(confCodeLength)
			out.reg, err = q.CreateRegistration(ctx, params)
			if err == nil {
				break
			}
			if storage.IsUniqueViolation(err) && strings.Contains(err.Error(), "conf_code") && attempt < 5 {
				continue
			}
			if storage.IsUniqueViolation(err) {
				return newError(connect.CodeAlreadyExists, "member is already registered")
			}
			return err
		}
		out.event = event
		out.member = member
		return nil
	})
	if err != nil {
		return nil, err
	}
	return &out, nil
}

func (c *createdRegistration) proto() *lighteventv1.Registration {
	reg := &lighteventv1.Registration{
		ConfCode:   c.reg.ConfCode,
		Kind:       registrationKindFromString(c.reg.Kind),
		EventName:  c.event.Name,
		EventTitle: c.event.Title,
		Member:     translateMember(c.member),
		CreatedAt:  formatTime(c.reg.CreatedAt),
	}
	if c.date != nil {
		reg.EventDate = translateEventDate(*c.date)
	}
	return reg
}

func notificationFor(member storage.Member, event storage.Event, date *storage.EventDate, confCode string) notifications.Registration {
	n := notifications.Registration{
		To:         member.Email,
		Name:       strings.TrimSpace(member.FirstName + " " + member.LastName),
		EventTitle: event.Title,
		ConfCode:   confCode,
	}
	if date != nil {
		v := date.Value
		n.Date = &v
	}
	return n
}

// registrationLoader translates registrations, caching related rows.
type registrationLoader struct {
	q       *storage.Queries
	events  map[int64]storage.Event
	dates   map[int64]storage.EventDate
	members map[int64]storage.Member
}

func newRegistrationLoader(q *storage.Queries) *registrationLoader {
	return &registrationLoader{q: q, events: map[int64]storage.Event{}, dates: map[int64]storage.EventDate{}, members: map[int64]storage.Member{}}
}

func (l *registrationLoader) event(ctx context.Context, id int64) (storage.Event, error) {
	if e, ok := l.events[id]; ok {
		return e, nil
	}
	e, err := l.q.GetEventByID(ctx, id)
	if err == nil {
		l.events[id] = e
	}
	return e, err
}

func (l *registrationLoader) date(ctx context.Context, id int64) (storage.EventDate, error) {
	if d, ok := l.dates[id]; ok {
		return d, nil
	}
	d, err := l.q.GetEventDateByID(ctx, id)
	if err == nil {
		l.dates[id] = d
	}
	return d, err
}

func (l *registrationLoader) member(ctx context.Context, id int64) (storage.Member, error) {
	if m, ok := l.members[id]; ok {
		return m, nil
	}
	m, err := l.q.GetMemberByID(ctx, id)
	if err == nil {
		l.members[id] = m
	}
	return m, err
}

func (l *registrationLoader) load(ctx context.Context, rec storage.Registration) (*createdRegistration, error) {
	event, err := l.event(ctx, rec.EventID)
	if err != nil {
		return nil, err
	}
	member, err := l.member(ctx, rec.MemberID)
	if err != nil {
		return nil, err
	}
	out := &createdRegistration{reg: rec, event: event, member: member}
	if rec.EventDateID.Valid {
		d, err := l.date(ctx, rec.EventDateID.Int64)
		if err != nil {
			return nil, err
		}
		out.date = &d
	}
	return out, nil
}

func (l *registrationLoader) translateAll(ctx context.Context, recs []storage.Registration) ([]*lighteventv1.Registration, error) {
	out := make([]*lighteventv1.Registration, 0, len(recs))
	for _, rec := range recs {
		r, err := l.load(ctx, rec)
		if err != nil {
			return nil, err
		}
		out = append(out, r.proto())
	}
	return out, nil
}

func (s *Server) ListEventRegistrations(ctx context.Context, req *connect.Request[lighteventv1.ListEventRegistrationsRequest]) (*connect.Response[lighteventv1.ListEventRegistrationsResponse], error) {
	event, err := s.q.GetEventByName(ctx, req.Msg.EventName)
	if err != nil {
		return nil, errorResponse(ctx, err, "event")
	}
	recs, err := s.q.ListActiveRegistrationsByEvent(ctx, event.ID)
	if err != nil {
		return nil, errorResponse(ctx, err, "registrations")
	}
	regs, err := newRegistrationLoader(s.q).translateAll(ctx, recs)
	if err != nil {
		return nil, errorResponse(ctx, err, "registrations")
	}
	return connect.NewResponse(&lighteventv1.ListEventRegistrationsResponse{Registrations: regs}), nil
}

func (s *Server) GetRegistration(ctx context.Context, req *connect.Request[lighteventv1.GetRegistrationRequest]) (*connect.Response[lighteventv1.GetRegistrationResponse], error) {
	rec, err := s.q.GetActiveRegistrationByConfCode(ctx, normalizeConfCode(req.Msg.ConfCode))
	if err != nil {
		return nil, errorResponse(ctx, err, "registration")
	}
	if id := identity(ctx); id.Scheme == access.SchemeMember && rec.MemberID != id.SubjectID {
		return nil, notFound("registration")
	}
	r, err := newRegistrationLoader(s.q).load(ctx, rec)
	if err != nil {
		return nil, errorResponse(ctx, err, "registration")
	}
	return connect.NewResponse(&lighteventv1.GetRegistrationResponse{Registration: r.proto()}), nil
}

func normalizeConfCode(code string) string {
	return secret.NormalizeCode(code)
}

func (s *Server) CreateRegistration(ctx context.Context, req *connect.Request[lighteventv1.CreateRegistrationRequest]) (*connect.Response[lighteventv1.CreateRegistrationResponse], error) {
	member, err := s.q.GetMemberByUID(ctx, req.Msg.MemberUid)
	if err != nil {
		return nil, errorResponse(ctx, err, "member")
	}
	created, err := s.createRegistration(ctx, member, req.Msg.Registration, registrationRules{})
	if err != nil {
		return nil, errorResponse(ctx, err, "registration")
	}
	if req.Msg.NotifyMember {
		s.notifier.RegistrationConfirmed(s.branding(ctx), notificationFor(created.member, created.event, created.date, created.reg.ConfCode))
	}
	return connect.NewResponse(&lighteventv1.CreateRegistrationResponse{Registration: created.proto()}), nil
}

// cancelRegistration soft-deletes an active registration and optionally notifies the member.
func (s *Server) cancelRegistration(ctx context.Context, rec storage.Registration, notify bool) error {
	if err := s.q.SoftDeleteRegistration(ctx, storage.SoftDeleteRegistrationParams{
		ID: rec.ID, DeletedAt: sql.NullTime{Time: s.Now(), Valid: true},
	}); err != nil {
		return err
	}
	if notify {
		r, err := newRegistrationLoader(s.q).load(ctx, rec)
		if err != nil {
			return err
		}
		s.notifier.RegistrationCancelled(s.branding(ctx), notificationFor(r.member, r.event, r.date, rec.ConfCode))
	}
	return nil
}

func (s *Server) DeleteRegistration(ctx context.Context, req *connect.Request[lighteventv1.DeleteRegistrationRequest]) (*connect.Response[lighteventv1.DeleteRegistrationResponse], error) {
	rec, err := s.q.GetActiveRegistrationByConfCode(ctx, normalizeConfCode(req.Msg.ConfCode))
	if err != nil {
		return nil, errorResponse(ctx, err, "registration")
	}
	if err := s.cancelRegistration(ctx, rec, req.Msg.NotifyMember); err != nil {
		return nil, errorResponse(ctx, err, "registration")
	}
	return connect.NewResponse(&lighteventv1.DeleteRegistrationResponse{}), nil
}

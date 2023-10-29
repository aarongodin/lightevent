package notifications

import (
	"github.com/aarongodin/lightevent/internal/events"
	"github.com/aarongodin/lightevent/internal/provider/email"
	"github.com/aarongodin/lightevent/internal/storage"
	"github.com/rs/zerolog/log"
)

var (
	Default *notifier
)

type notifier struct {
	email email.EmailProvider
}

func (n notifier) handle(event events.Event) {
	log.Debug().Str("name", event.Name).Msg("notifier event listener")

	switch event.Name {
	case events.EvtMembersCreate:
		member, ok := event.Payload.(storage.Member)
		if !ok {
			log.Error().Msg("expected event payload to be a member")
		}
		n.email.Send(member.Email, email.EmailSubject(email.TemplateMemberWelcome), email.TemplatedEmail{
			Name: email.TemplateMemberWelcome,
			Data: nil,
		})
	}
}

func (n notifier) HandleUsersCreate(event events.Event) {
	log.Debug().Str("name", events.EvtUsersCreate).Msg("notifier event listener")
}

func Init(e *events.Events, emailProvider email.EmailProvider) {
	Default = &notifier{email: emailProvider}
	e.ListenMany([]string{
		events.EvtMembersCreate,
	}, Default.handle)
}

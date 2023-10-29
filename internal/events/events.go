package events

import (
	"sync"

	"github.com/rs/zerolog/log"
)

var (
	EvtUsersCreate   = "users:create"
	EvtMembersCreate = "members:create"
	Default          = NewEvents()
)

type Event struct {
	Name    string
	Payload any
}

type Listener func(event Event)

func SetDefault(events *Events) {
	Default = events
}

type Events struct {
	listeners map[string][]Listener
	mut       *sync.Mutex
}

func NewEvents() *Events {
	return &Events{
		listeners: make(map[string][]Listener),
		mut:       &sync.Mutex{},
	}
}

func (p Events) Emit(event Event) {
	log.Debug().Str("name", event.Name).Any("payload", event.Payload).Msg("event emitted")
	listeners, ok := p.listeners[event.Name]
	if !ok || len(listeners) == 0 {
		return
	}

	go func() {
		// Provide locking so that we ensure that one event is processed at a time
		p.mut.Lock()

		// Start a wait group to execute all listeners in parallel and await their completion
		var wg sync.WaitGroup
		wg.Add(len(listeners))
		for n, listener := range listeners {
			go func(n int, listener Listener) {
				listener(event)
				wg.Done()
			}(n, listener)
		}
		wg.Wait()
		p.mut.Unlock()
	}()
}

func (p *Events) Listen(name string, listener Listener) {
	set, ok := p.listeners[name]
	if !ok {
		set = []Listener{listener}
	} else {
		set = append(set, listener)
	}
	p.listeners[name] = set
}

func (p *Events) ListenMany(names []string, listener Listener) {
	for _, n := range names {
		p.Listen(n, listener)
	}
}

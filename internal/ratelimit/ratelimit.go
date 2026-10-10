// Package ratelimit provides a small in-memory fixed-window rate limiter.
package ratelimit

import (
	"sync"
	"time"
)

type window struct {
	count int
	reset time.Time
}

// Limiter allows up to Limit events per key within each Window.
type Limiter struct {
	limit  int
	period time.Duration
	now    func() time.Time

	mu        sync.Mutex
	windows   map[string]*window
	nextSweep time.Time
}

// New returns a limiter that allows limit events per key in each period.
func New(limit int, period time.Duration) *Limiter {
	return &Limiter{limit: limit, period: period, now: time.Now, windows: make(map[string]*window)}
}

// WithClock replaces the clock used by the limiter; intended for tests.
func (l *Limiter) WithClock(now func() time.Time) *Limiter {
	l.now = now
	return l
}

// Allow records an event for key and reports whether it is within the limit.
func (l *Limiter) Allow(key string) bool {
	l.mu.Lock()
	defer l.mu.Unlock()

	now := l.now()
	l.sweep(now)

	w, ok := l.windows[key]
	if !ok || !now.Before(w.reset) {
		l.windows[key] = &window{count: 1, reset: now.Add(l.period)}
		return true
	}
	if w.count >= l.limit {
		return false
	}
	w.count++
	return true
}

// Reset clears the recorded events for key (for example after a successful login).
func (l *Limiter) Reset(key string) {
	l.mu.Lock()
	defer l.mu.Unlock()
	delete(l.windows, key)
}

// sweep removes expired windows at most once per period so memory stays bounded.
func (l *Limiter) sweep(now time.Time) {
	if now.Before(l.nextSweep) {
		return
	}
	for k, w := range l.windows {
		if !now.Before(w.reset) {
			delete(l.windows, k)
		}
	}
	l.nextSweep = now.Add(l.period)
}

// Len returns the number of tracked keys.
func (l *Limiter) Len() int {
	l.mu.Lock()
	defer l.mu.Unlock()
	return len(l.windows)
}

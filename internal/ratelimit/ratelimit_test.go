package ratelimit

import (
	"sync"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestLimiter(t *testing.T) {
	now := time.Unix(0, 0)
	l := New(2, time.Minute).WithClock(func() time.Time { return now })

	assert.True(t, l.Allow("a"))
	assert.True(t, l.Allow("a"))
	assert.False(t, l.Allow("a"))
	assert.True(t, l.Allow("b"), "keys are independent")

	now = now.Add(time.Minute)
	assert.True(t, l.Allow("a"), "window resets after the period")
}

func TestLimiterReset(t *testing.T) {
	l := New(1, time.Minute)
	assert.True(t, l.Allow("a"))
	assert.False(t, l.Allow("a"))
	l.Reset("a")
	assert.True(t, l.Allow("a"))
}

func TestLimiterSweepsExpiredKeys(t *testing.T) {
	now := time.Unix(0, 0)
	l := New(1, time.Minute).WithClock(func() time.Time { return now })
	for _, k := range []string{"a", "b", "c"} {
		l.Allow(k)
	}
	assert.Equal(t, 3, l.Len())
	now = now.Add(2 * time.Minute)
	l.Allow("d")
	assert.Equal(t, 1, l.Len())
}

func TestLimiterConcurrent(t *testing.T) {
	l := New(50, time.Minute)
	var wg sync.WaitGroup
	var mu sync.Mutex
	allowed := 0
	for i := 0; i < 100; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			if l.Allow("k") {
				mu.Lock()
				allowed++
				mu.Unlock()
			}
		}()
	}
	wg.Wait()
	assert.Equal(t, 50, allowed)
}

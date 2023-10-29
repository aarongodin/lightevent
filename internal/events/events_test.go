package events_test

import (
	"testing"
	"time"

	"github.com/aarongodin/lightevent/internal/events"
	"github.com/stretchr/testify/assert"
)

var (
	testEvent1Name = "test1"
	testEvent2Name = "test2"
	testEvent1     = events.Event{Name: testEvent1Name}
	testEvent2     = events.Event{Name: testEvent2Name}
)

// func TestEventHandlerCounts(t *testing.T) {
// 	e := events.NewEvents()
// 	test1Count := 0
// 	test2Count := 0

// 	test1Listener := func(e events.Event) {
// 		assert.Equal(t, testEvent1Name, e.Name)
// 		test1Count += 1
// 	}
// 	test2Listener := func(e events.Event) {
// 		assert.Equal(t, testEvent2Name, e.Name)
// 		test2Count += 1
// 	}

// 	e.Listen(testEvent1Name, test1Listener)

// 	// two registered for testEvent2 - counts should be doubled
// 	e.Listen(testEvent2Name, test2Listener)
// 	e.Listen(testEvent2Name, test2Listener)

// 	e.Emit(testEvent1)
// 	e.Emit(testEvent1)
// 	e.Emit(testEvent2)
// 	e.Emit(testEvent2)

// 	// usage of the events doesn't care to observe or wait for the end of events being handled,
// 	// so this is a more obtuse way
// 	time.Sleep(time.Millisecond * 10)

// 	assert.Equal(t, 2, test1Count)
// 	assert.Equal(t, 4, test2Count)
// }

func TestSerializedEventHandling(t *testing.T) {
	e := events.NewEvents()

	fastListenerResult := false

	slowListener := func(e events.Event) {
		time.Sleep(time.Millisecond * 50)
		// ensure that after the sleep, the fast listener still hasn't been executed
		assert.False(t, fastListenerResult)
	}
	fastListener := func(e events.Event) {
		fastListenerResult = true
	}

	e.Listen(testEvent1Name, slowListener)
	e.Listen(testEvent2Name, fastListener)

	e.Emit(testEvent1)
	e.Emit(testEvent2)

	time.Sleep(time.Millisecond * 100) // 10ms more thanthe slow listener will take

	assert.True(t, fastListenerResult)
}

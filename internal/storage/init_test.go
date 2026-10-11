package storage

import (
	"context"
	"path/filepath"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func openTest(t *testing.T) *Storage {
	t.Helper()
	s, err := Open(context.Background(), filepath.Join(t.TempDir(), "test.sqlite3"))
	require.NoError(t, err)
	t.Cleanup(func() { s.Close() })
	return s
}

func TestOpenMigratesAndIsIdempotent(t *testing.T) {
	ctx := context.Background()
	versions, err := listVersions()
	require.NoError(t, err)
	latest := versions[len(versions)-1].n

	file := filepath.Join(t.TempDir(), "test.sqlite3")
	s, err := Open(ctx, file)
	require.NoError(t, err)
	v, err := s.CurrentVersion(ctx)
	require.NoError(t, err)
	assert.Equal(t, latest, v)
	require.NoError(t, s.Close())

	s, err = Open(ctx, file)
	require.NoError(t, err)
	defer s.Close()
	v, err = s.CurrentVersion(ctx)
	require.NoError(t, err)
	assert.Equal(t, latest, v)
}

func TestPragmasApplyToEveryConnection(t *testing.T) {
	s := openTest(t)
	ctx := context.Background()
	// Hold several connections open at once so the pool must create distinct connections.
	conns := make([]interface{ Close() error }, 0, 4)
	for i := 0; i < 4; i++ {
		c, err := s.DB.Conn(ctx)
		require.NoError(t, err)
		conns = append(conns, c)
		var fk, timeout int
		require.NoError(t, c.QueryRowContext(ctx, "PRAGMA foreign_keys").Scan(&fk))
		require.NoError(t, c.QueryRowContext(ctx, "PRAGMA busy_timeout").Scan(&timeout))
		assert.Equal(t, 1, fk, "connection %d", i)
		assert.Equal(t, 5000, timeout, "connection %d", i)
	}
	for _, c := range conns {
		c.Close()
	}
}

func TestConstraintErrorHelpers(t *testing.T) {
	s := openTest(t)
	ctx := context.Background()
	now := time.Now().UTC()
	_, err := s.Queries.CreateEvent(ctx, CreateEventParams{Name: "a", Title: "A", CreatedAt: now})
	require.NoError(t, err)
	_, err = s.Queries.CreateEvent(ctx, CreateEventParams{Name: "a", Title: "A", CreatedAt: now})
	assert.True(t, IsUniqueViolation(err))
	assert.False(t, IsForeignKeyViolation(err))

	_, err = s.Queries.CreateEventDate(ctx, CreateEventDateParams{Uid: "x", EventID: 999, Value: now})
	assert.True(t, IsForeignKeyViolation(err))
	assert.False(t, IsUniqueViolation(err))
	assert.False(t, IsUniqueViolation(nil))
}

func TestTimestampsRoundTripAndCompare(t *testing.T) {
	s := openTest(t)
	ctx := context.Background()
	now := time.Date(2030, 1, 2, 3, 4, 5, 500_000_000, time.UTC)
	ev, err := s.Queries.CreateEvent(ctx, CreateEventParams{Name: "a", Title: "A", CreatedAt: now})
	require.NoError(t, err)
	assert.True(t, ev.CreatedAt.Equal(now))

	for i, v := range []time.Time{now.Add(-time.Second), now, now.Add(250 * time.Millisecond), now.Add(time.Hour)} {
		_, err := s.Queries.CreateEventDate(ctx, CreateEventDateParams{Uid: string(rune('a' + i)), EventID: ev.ID, Value: v})
		require.NoError(t, err)
	}
	rows, err := s.Queries.ListUpcomingEventDates(ctx, ListUpcomingEventDatesParams{Now: now, Limit: 10})
	require.NoError(t, err)
	require.Len(t, rows, 2, "only dates strictly after now are upcoming")
	assert.True(t, rows[0].EventDate.Value.Equal(now.Add(250*time.Millisecond)))
	assert.True(t, rows[1].EventDate.Value.Equal(now.Add(time.Hour)))
}

func TestWithTxRollsBackOnError(t *testing.T) {
	s := openTest(t)
	ctx := context.Background()
	err := s.WithTx(ctx, func(q *Queries) error {
		if _, err := q.CreateEvent(ctx, CreateEventParams{Name: "a", Title: "A", CreatedAt: time.Now().UTC()}); err != nil {
			return err
		}
		return assert.AnError
	})
	assert.ErrorIs(t, err, assert.AnError)
	_, err = s.Queries.GetEventByName(ctx, "a")
	assert.Error(t, err)
}

func TestBoolHelpers(t *testing.T) {
	assert.Equal(t, int64(1), BoolToInt(true))
	assert.Equal(t, int64(0), BoolToInt(false))
	assert.True(t, IntToBool(1))
	assert.False(t, IntToBool(0))
}

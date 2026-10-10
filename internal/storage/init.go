package storage

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"net/url"
	"sort"
	"strconv"
	"strings"

	"github.com/aarongodin/lightevent/db/migrations"
	"github.com/rs/zerolog/log"
	"modernc.org/sqlite"
	sqlite3 "modernc.org/sqlite/lib"
)

const lightEventMigrationsKey = "lightevent"

const createMigrationsTable = `
	CREATE TABLE IF NOT EXISTS migrations (
		key TEXT NOT NULL,
		version INTEGER NOT NULL
	);
	CREATE UNIQUE INDEX IF NOT EXISTS key_idx ON migrations(key);
`

const getMigrationVersion = `SELECT version FROM migrations WHERE key = ? LIMIT 1;`

const setMigrationVersion = `
	INSERT INTO migrations (key, version) VALUES (?, ?)
	ON CONFLICT (key) DO UPDATE SET version = excluded.version;
`

// Storage owns the database connection pool.
type Storage struct {
	DB      *sql.DB
	Queries *Queries
}

// dsn builds the connection string. Pragmas are passed through the DSN so that they apply to every
// connection in the pool, not just the first one. Transactions use BEGIN IMMEDIATE so that
// read-then-write transactions (such as capacity checks) are serialized.
func dsn(file string) string {
	params := url.Values{}
	params.Add("_pragma", "foreign_keys(1)")
	params.Add("_pragma", "journal_mode(WAL)")
	params.Add("_pragma", "busy_timeout(5000)")
	params.Add("_pragma", "synchronous(NORMAL)")
	params.Set("_txlock", "immediate")
	params.Set("_time_format", "sqlite")
	return "file:" + file + "?" + params.Encode()
}

// Open opens (creating if needed) the database file and applies all pending migrations.
func Open(ctx context.Context, file string) (*Storage, error) {
	db, err := sql.Open("sqlite", dsn(file))
	if err != nil {
		return nil, err
	}
	db.SetMaxOpenConns(8)
	if err := db.PingContext(ctx); err != nil {
		db.Close()
		return nil, fmt.Errorf("error opening database: %w", err)
	}

	s := &Storage{DB: db, Queries: New(db)}
	if err := s.Migrate(ctx); err != nil {
		db.Close()
		return nil, err
	}
	return s, nil
}

// Close closes the connection pool.
func (s *Storage) Close() error {
	return s.DB.Close()
}

// WithTx runs fn inside a transaction, committing when fn returns nil and rolling back otherwise.
func (s *Storage) WithTx(ctx context.Context, fn func(q *Queries) error) error {
	tx, err := s.DB.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback() //nolint:errcheck // rollback after commit is a no-op
	if err := fn(s.Queries.WithTx(tx)); err != nil {
		return err
	}
	return tx.Commit()
}

type version struct {
	filename string
	n        int
}

// listVersions reads all versions from filenames in the migrations directory, ordered ascending.
func listVersions() ([]version, error) {
	entries, err := migrations.Files.ReadDir(".")
	if err != nil {
		return nil, fmt.Errorf("error reading migrations directory: %w", err)
	}

	versions := make([]version, 0, len(entries))
	for _, entry := range entries {
		if !strings.HasSuffix(entry.Name(), ".sql") {
			continue
		}
		prefix, _, _ := strings.Cut(entry.Name(), "_")
		n, err := strconv.Atoi(prefix)
		if err != nil {
			return nil, fmt.Errorf("error reading migration version from %q: %w", entry.Name(), err)
		}
		versions = append(versions, version{filename: entry.Name(), n: n})
	}

	sort.Slice(versions, func(i, j int) bool { return versions[i].n < versions[j].n })
	return versions, nil
}

// Migrate applies all migrations newer than the current version in a single transaction.
func (s *Storage) Migrate(ctx context.Context) error {
	if _, err := s.DB.ExecContext(ctx, createMigrationsTable); err != nil {
		return fmt.Errorf("error creating migrations table: %w", err)
	}
	current, err := s.CurrentVersion(ctx)
	if err != nil {
		return err
	}
	log.Info().Int("version", current).Msg("migration status")

	versions, err := listVersions()
	if err != nil {
		return err
	}

	tx, err := s.DB.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("error starting transaction for migrations: %w", err)
	}
	defer tx.Rollback() //nolint:errcheck

	latest := current
	for _, v := range versions {
		if v.n <= current {
			continue
		}
		query, err := migrations.Files.ReadFile(v.filename)
		if err != nil {
			return fmt.Errorf("error reading migration [%s]: %w", v.filename, err)
		}
		if _, err := tx.ExecContext(ctx, string(query)); err != nil {
			return fmt.Errorf("error executing migration [%s]: %w", v.filename, err)
		}
		if _, err := tx.ExecContext(ctx, setMigrationVersion, lightEventMigrationsKey, v.n); err != nil {
			return fmt.Errorf("error setting migration version for [%s]: %w", v.filename, err)
		}
		log.Info().Int("version", v.n).Msg("storage migration complete")
		latest = v.n
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("error committing transaction for migrations: %w", err)
	}
	if latest == current {
		log.Info().Msg("no migration needed")
	}
	return nil
}

// CurrentVersion returns the latest applied migration version, or 0 when none have been applied.
func (s *Storage) CurrentVersion(ctx context.Context) (int, error) {
	var v int
	if err := s.DB.QueryRowContext(ctx, getMigrationVersion, lightEventMigrationsKey).Scan(&v); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return 0, nil
		}
		return 0, fmt.Errorf("error selecting current migration version: %w", err)
	}
	return v, nil
}

// IsUniqueViolation reports whether err is a UNIQUE or PRIMARY KEY constraint failure.
func IsUniqueViolation(err error) bool {
	var serr *sqlite.Error
	if errors.As(err, &serr) {
		return serr.Code() == sqlite3.SQLITE_CONSTRAINT_UNIQUE || serr.Code() == sqlite3.SQLITE_CONSTRAINT_PRIMARYKEY
	}
	return false
}

// IsForeignKeyViolation reports whether err is a FOREIGN KEY constraint failure.
func IsForeignKeyViolation(err error) bool {
	var serr *sqlite.Error
	if errors.As(err, &serr) {
		return serr.Code() == sqlite3.SQLITE_CONSTRAINT_FOREIGNKEY
	}
	return false
}

// BoolToInt converts a bool to the integer representation used in storage.
func BoolToInt(b bool) int64 {
	if b {
		return 1
	}
	return 0
}

// IntToBool converts the integer representation used in storage to a bool.
func IntToBool(i int64) bool {
	return i != 0
}

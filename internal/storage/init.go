package storage

import (
	"context"
	"database/sql"
	"fmt"
	"sort"
	"strconv"
	"strings"

	"github.com/aarongodin/lightevent/db/migrations"
	"github.com/aarongodin/lightevent/internal/config"
	"github.com/rs/zerolog/log"

	_ "github.com/mattn/go-sqlite3"
)

var initSQLite = `
	PRAGMA foreign_keys = ON;
`

var lightEventMigrationsKey = "lightevent"

var createMigrationsTable = `
	CREATE TABLE IF NOT EXISTS migrations (
		key TEXT NOT NULL,
		version INTEGER NOT NULL
	);
	CREATE UNIQUE INDEX IF NOT EXISTS key_idx ON migrations(key);
`

var getMigrationVersion = `
	SELECT version FROM migrations WHERE key = ? LIMIT 1;
`

var setMigrationVersion = `
	INSERT INTO migrations (key, version) VALUES (?, ?) ON CONFLICT DO UPDATE SET version = excluded.version;
`

type Storage struct {
	DB *sql.DB
}

type version struct {
	filename string
	n        int
}

// listVersions reads all versions from filenames in the migrations directory. The returned slice is ordered in ascending version number.
func listVersions() ([]version, error) {
	entries, err := migrations.Files.ReadDir(".")
	if err != nil {
		return nil, fmt.Errorf("error reading migrations directory: %w", err)
	}

	versions := make([]version, 0, len(entries))
	for _, entry := range entries {
		// Parse out the integer at the front of the filename as the version number (n)
		parts := strings.Split(entry.Name(), "_")
		n, err := strconv.Atoi(parts[0])
		if err != nil {
			return nil, fmt.Errorf("error reading migration version: %w", err)
		}
		versions = append(versions, version{
			filename: entry.Name(),
			n:        n,
		})
	}

	sort.Slice(versions, func(i, j int) bool {
		return versions[i].n < versions[j].n
	})

	return versions, nil
}

func getVersionContents(filename string) ([]byte, error) {
	return migrations.Files.ReadFile(filename)
}

func (s Storage) Migrate(ctx context.Context) error {
	if _, err := s.DB.ExecContext(ctx, createMigrationsTable); err != nil {
		return fmt.Errorf("error creating migrations table: %w", err)
	}
	current, err := s.CurrentVersion(ctx, lightEventMigrationsKey)
	if err != nil {
		return err
	}
	log.Info().Int("version", current).Msg("migration status")

	tx, err := s.DB.Begin()
	if err != nil {
		return fmt.Errorf("error starting transaction for migrations: %w", err)
	}
	defer tx.Rollback()

	versions, err := listVersions()
	if err != nil {
		return err
	}

	latest := current
	for _, version := range versions {
		if version.n > current {
			query, err := getVersionContents(version.filename)
			if err != nil {
				return fmt.Errorf("error reading migration [%s]: %w", version.filename, err)
			}

			if _, err := tx.ExecContext(ctx, string(query)); err != nil {
				return fmt.Errorf("error executing migration [%s]: %w", version.filename, err)
			}

			if _, err := tx.ExecContext(ctx, setMigrationVersion, lightEventMigrationsKey, version.n); err != nil {
				return fmt.Errorf("error setting migration version for [%s]: %w", version.filename, err)
			}

			log.Info().Int("version", version.n).Msg("storage migration complete")
			latest = version.n
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("error committing transaction for migrations: %w", err)
	}

	if latest == current {
		log.Info().Msg("no migration needed")
	}

	return nil
}

func (s Storage) CurrentVersion(ctx context.Context, key string) (int, error) {
	rows := s.DB.QueryRowContext(ctx, getMigrationVersion, key)
	var version int
	if err := rows.Scan(&version); err != nil {
		if err == sql.ErrNoRows {
			return 0, nil
		}
		return 0, fmt.Errorf("error selecting current migration version: %w", err)
	}
	return version, nil
}

func Init(ctx context.Context, cfg *config.RuntimeConfig) (*Storage, error) {
	db, err := sql.Open("sqlite3", cfg.DatabaseFile)
	if err != nil {
		return nil, err
	}

	_, err = db.Exec(initSQLite)
	if err != nil {
		return nil, err
	}

	storage := &Storage{DB: db}
	if err := storage.Migrate(ctx); err != nil {
		return nil, err
	}
	return storage, nil
}

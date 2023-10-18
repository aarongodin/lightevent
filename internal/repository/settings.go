package repository

import (
	"bytes"
	"context"
	"database/sql"
	"encoding/gob"
	"errors"
	"fmt"

	"github.com/aarongodin/lightevent/internal/storage"
)

const (
	SETTINGS_APP = "app"
)

// ListSettings finds a settings row by name and decodes the map stores as binary data on the row.
func ListSettings(ctx context.Context, queries *storage.Queries, name string) (map[string]any, error) {
	settings := make(map[string]any)
	row, err := queries.GetSettings(ctx, name)
	if err != nil {
		if errors.Is(sql.ErrNoRows, err) {
			return settings, nil
		}
		return nil, err
	}

	reader := bytes.NewReader(row.Value)
	decoder := gob.NewDecoder(reader)
	if err := decoder.Decode(&settings); err != nil {
		return nil, err
	}

	return settings, nil
}

func UpdateSettings(ctx context.Context, queries *storage.Queries, name string, settings map[string]any) error {
	var encoded bytes.Buffer
	encoder := gob.NewEncoder(&encoded)
	if err := encoder.Encode(settings); err != nil {
		return fmt.Errorf("error encoding settings map: %w", err)
	}

	if err := queries.UpdateSettings(ctx, storage.UpdateSettingsParams{
		Name:  name,
		Value: encoded.Bytes(),
	}); err != nil {
		return fmt.Errorf("error updating settings: %w", err)
	}

	return nil
}

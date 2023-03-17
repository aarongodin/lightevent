package config

import (
	"github.com/asdine/storm/v3"
	"golang.org/x/exp/slog"
)

const BUCKET_NAME = "PersistentConfig"
const KEY_SETTINGS = "settings"

// PersistentConfig controls key-value storage of persistent settings for the app
// (ones that are saved in storage and not set at runtime)
type PersistentConfig interface {
	// GetAll returns the entire map of settings
	GetAll() map[string]any
	// Get returns one setting as any
	Get(string) any
	// Set a key-value pair on the PersistentConfig
	Set(string, any) error
	// GetString returns a value from the PersistentConfig as a string, returning nil if not found
	GetString(string) *string
	// GetBool returns a value from the PersistentConfig as a bool, returning nil if not found
	GetBool(string) *bool
}

type persistentConfig struct {
	db   *storm.DB
	data map[string]any
}

// initData loads the data from the PersistentConfig bucket. Need to ensure this is called before
// any calls to getters.
func (c *persistentConfig) initData() error {
	c.data = make(map[string]any)
	if err := c.db.Get(BUCKET_NAME, KEY_SETTINGS, &c.data); err != nil {
		return err
	}
	slog.Debug("persistentConfig.initData complete")
	return nil
}

func (c *persistentConfig) GetAll() map[string]any {
	return c.data
}

func (c *persistentConfig) Get(name string) any {
	return c.data[name]
}

func (c *persistentConfig) Set(key string, value any) error {
	c.data[key] = value
	return c.db.Set(BUCKET_NAME, KEY_SETTINGS, c.data)
}

func (c *persistentConfig) GetString(key string) *string {
	raw, ok := c.data[key]
	if !ok {
		return nil
	}
	s, ok := raw.(string)
	if !ok {
		slog.Warn("persistentConfig stored value was incorrect type", slog.String("key", key))
		return nil
	}
	return &s
}

func (c *persistentConfig) GetBool(key string) *bool {
	raw, ok := c.data[key]
	if !ok {
		return nil
	}
	b, ok := raw.(bool)
	if !ok {
		slog.Warn("persistentConfig stored value was incorrect type", slog.String("key", key))
		return nil
	}
	return &b
}

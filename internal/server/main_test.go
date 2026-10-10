package server

import (
	"os"
	"testing"

	"github.com/aarongodin/lightevent/internal/access"
	"golang.org/x/crypto/bcrypt"

	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

func TestMain(m *testing.M) {
	zerolog.SetGlobalLevel(zerolog.ErrorLevel)
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr, NoColor: true})
	zerolog.DefaultContextLogger = &log.Logger
	access.BcryptCost = bcrypt.MinCost
	os.Exit(m.Run())
}

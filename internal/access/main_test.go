package access

import (
	"os"
	"testing"

	"github.com/rs/zerolog"
	"golang.org/x/crypto/bcrypt"
)

func TestMain(m *testing.M) {
	zerolog.SetGlobalLevel(zerolog.Disabled)
	BcryptCost = bcrypt.MinCost
	os.Exit(m.Run())
}

package secret

import (
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestToken(t *testing.T) {
	a, b := Token(32), Token(32)
	assert.Len(t, a, 43)
	assert.NotEqual(t, a, b)
	assert.NotContains(t, a, "=")
}

func TestHash(t *testing.T) {
	assert.Equal(t, "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824", Hash("hello"))
	assert.True(t, EqualHash(Hash("x"), Hash("x")))
	assert.False(t, EqualHash(Hash("x"), Hash("y")))
}

func TestCode(t *testing.T) {
	seen := map[string]bool{}
	for i := 0; i < 1000; i++ {
		c := Code(8)
		assert.Len(t, c, 8)
		for _, r := range c {
			assert.True(t, strings.ContainsRune(codeAlphabet, r), "unexpected rune %q", r)
		}
		seen[c] = true
	}
	assert.Len(t, seen, 1000)
}

func TestNormalizeCode(t *testing.T) {
	assert.Equal(t, "AB12CD34", NormalizeCode("ab12-cd34"))
	assert.Equal(t, "011", NormalizeCode("o i l"))
	assert.Equal(t, "", NormalizeCode(" - "))
}

func TestUID(t *testing.T) {
	assert.Len(t, UID(), 36)
	assert.NotEqual(t, UID(), UID())
}

// Package secret generates and hashes random identifiers, tokens and codes.
package secret

import (
	"crypto/rand"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/base64"
	"encoding/hex"
	"strings"

	"github.com/google/uuid"
)

// codeAlphabet is Crockford's base32 alphabet. It omits I, L, O and U to avoid ambiguity when codes are
// read and typed by people.
const codeAlphabet = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"

// UID returns a new random identifier suitable for public use.
func UID() string {
	return uuid.NewString()
}

// Token returns a URL-safe random string with nbytes of entropy.
func Token(nbytes int) string {
	b := make([]byte, nbytes)
	if _, err := rand.Read(b); err != nil {
		// crypto/rand.Read never returns an error on supported platforms.
		panic(err)
	}
	return base64.RawURLEncoding.EncodeToString(b)
}

// Hash returns the hex encoded SHA-256 of s. It is used to store high-entropy secrets (tokens,
// API keys, codes) so that a copy of the database does not reveal usable credentials.
func Hash(s string) string {
	sum := sha256.Sum256([]byte(s))
	return hex.EncodeToString(sum[:])
}

// EqualHash compares two hashes in constant time.
func EqualHash(a, b string) bool {
	return subtle.ConstantTimeCompare([]byte(a), []byte(b)) == 1
}

// Code returns a random code of n characters from the Crockford base32 alphabet (5 bits per character).
func Code(n int) string {
	b := make([]byte, n)
	if _, err := rand.Read(b); err != nil {
		panic(err)
	}
	out := make([]byte, n)
	for i, v := range b {
		// 256 is a multiple of 32, so the modulo does not introduce bias.
		out[i] = codeAlphabet[int(v)%len(codeAlphabet)]
	}
	return string(out)
}

// NormalizeCode converts user input into the canonical code form: upper case, without separators,
// and with commonly confused characters mapped to the characters used in the alphabet.
func NormalizeCode(input string) string {
	var sb strings.Builder
	for _, r := range strings.ToUpper(input) {
		switch r {
		case '-', ' ', '\t':
			continue
		case 'O':
			r = '0'
		case 'I', 'L':
			r = '1'
		}
		sb.WriteRune(r)
	}
	return sb.String()
}

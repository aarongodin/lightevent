package repository

import (
	"crypto/rand"
	"encoding/hex"
	"strings"
)

func randomHexUpper(n int) (string, error) {
	bytes := make([]byte, n)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return strings.ToUpper(hex.EncodeToString(bytes)), nil
}

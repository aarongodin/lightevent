package repository

import (
	"crypto/rand"
	"encoding/hex"
	"strings"
)

type ErrValidationFailed struct {
	Argument string
	Reason   string
}

func (e ErrValidationFailed) Error() string {
	return e.Reason
}

func randomHexUpper(n int) (string, error) {
	bytes := make([]byte, n)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return strings.ToUpper(hex.EncodeToString(bytes)), nil
}

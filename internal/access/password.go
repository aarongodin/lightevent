package access

import (
	"golang.org/x/crypto/bcrypt"
)

// BcryptCost is the work factor for password hashes. Tests may lower it.
var BcryptCost = 12

// dummyHash is compared against when a username does not exist, so that response timing does not reveal
// which usernames are valid.
var dummyHash, _ = bcrypt.GenerateFromPassword([]byte("lightevent-dummy-password"), BcryptCost)

// HashPassword returns a bcrypt hash of the password.
func HashPassword(password string) (string, error) {
	h, err := bcrypt.GenerateFromPassword([]byte(password), BcryptCost)
	return string(h), err
}

// CheckPassword reports whether password matches hash.
func CheckPassword(hash, password string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)) == nil
}

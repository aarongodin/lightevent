package model

import (
	"regexp"
	"strings"
)

var Validate = &Validator{}
var identRegex = regexp.MustCompile("^[a-zA-Z0-9-_]+$")

type Validator struct{}

type ErrValidationFailed struct {
	Argument string
	Reason   string
}

func (e ErrValidationFailed) Error() string {
	return e.Reason
}

// Identifier cleans and validates a string, returning an error if it is not a valid string identifier.
func (v Validator) Identifier(arg string, value string) (string, error) {
	trimmed := strings.TrimSpace(value)
	if len(trimmed) == 0 {
		return "", ErrValidationFailed{arg, "must not be blank"}
	}
	if !identRegex.MatchString(trimmed) {
		return "", ErrValidationFailed{arg, "must be a valid identifier"}
	}
	return trimmed, nil
}

// Title cleans and validates a string, returning an error if it is not a valid title.
func (v Validator) Title(arg string, value string) (string, error) {
	trimmed := strings.TrimSpace(value)
	if len(trimmed) == 0 {
		return "", ErrValidationFailed{arg, "must not be blank"}
	}
	if len(trimmed) > 100 {
		return "", ErrValidationFailed{arg, "must be at most 100 characters"}
	}
	return trimmed, nil
}

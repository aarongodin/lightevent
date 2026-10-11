// Package model validates and normalizes input received through the API.
package model

import (
	"fmt"
	"net"
	"net/mail"
	"net/url"
	"regexp"
	"strings"
	"time"
	"unicode"
	"unicode/utf8"

	"github.com/aarongodin/lightevent/internal/config"
)

// ErrValidationFailed describes an invalid field in a request.
type ErrValidationFailed struct {
	Field  string
	Reason string
}

func (e ErrValidationFailed) Error() string {
	return fmt.Sprintf("%s: %s", e.Field, e.Reason)
}

func invalid(field, reason string) error {
	return ErrValidationFailed{Field: field, Reason: reason}
}

const (
	MaxEventNameLength   = 64
	MaxTitleLength       = 100
	MaxDescriptionLength = 5000
	MaxPersonNameLength  = 100
	MaxEmailLength       = 254
	MaxCapacity          = 100000
	MaxEventDates        = 500
	MaxEventTags         = 50
	MaxTagLabelLength    = 50
	MaxAllowedOrigins    = 20
	// MaxPasswordBytes is bcrypt's input limit.
	MaxPasswordBytes = 72
)

var (
	eventNameRegex = regexp.MustCompile(`^[a-z0-9]+(?:[-_][a-z0-9]+)*$`)
	usernameRegex  = regexp.MustCompile(`^[a-zA-Z0-9._-]{3,64}$`)
)

// EventName validates the URL-safe identifier of an event. It is trimmed and lower-cased.
func EventName(field, value string) (string, error) {
	v := strings.ToLower(strings.TrimSpace(value))
	if v == "" {
		return "", invalid(field, "must not be blank")
	}
	if len(v) > MaxEventNameLength {
		return "", invalid(field, fmt.Sprintf("must be at most %d characters", MaxEventNameLength))
	}
	if !eventNameRegex.MatchString(v) {
		return "", invalid(field, "may only contain letters, numbers, and single dashes or underscores between them")
	}
	return v, nil
}

// TagName validates the URL-safe identifier of a tag. It follows the same rules as event names.
func TagName(field, value string) (string, error) {
	return EventName(field, value)
}

// TagLabel validates the display label of a tag.
func TagLabel(field, value string) (string, error) {
	v, err := Title(field, value)
	if err != nil {
		return "", err
	}
	if utf8.RuneCountInString(v) > MaxTagLabelLength {
		return "", invalid(field, fmt.Sprintf("must be at most %d characters", MaxTagLabelLength))
	}
	return v, nil
}

// Origin validates and normalizes a web origin such as "https://www.example.com". Paths, queries and
// credentials are rejected, and default ports are removed.
func Origin(field, value string) (string, error) {
	v := strings.TrimSuffix(strings.TrimSpace(value), "/")
	u, err := url.Parse(v)
	if err != nil || (u.Scheme != "http" && u.Scheme != "https") || u.Host == "" || u.Path != "" ||
		u.RawQuery != "" || u.Fragment != "" || u.User != nil || u.Opaque != "" {
		return "", invalid(field, "must be an origin such as https://www.example.com")
	}
	host := strings.ToLower(u.Hostname())
	port := u.Port()
	if (u.Scheme == "http" && port == "80") || (u.Scheme == "https" && port == "443") {
		port = ""
	}
	if port != "" {
		host = net.JoinHostPort(host, port)
	} else if strings.Contains(host, ":") {
		host = "[" + host + "]"
	}
	return u.Scheme + "://" + host, nil
}

// Title validates a required single-line title.
func Title(field, value string) (string, error) {
	v := strings.TrimSpace(value)
	if v == "" {
		return "", invalid(field, "must not be blank")
	}
	if utf8.RuneCountInString(v) > MaxTitleLength {
		return "", invalid(field, fmt.Sprintf("must be at most %d characters", MaxTitleLength))
	}
	if strings.ContainsAny(v, "\r\n") {
		return "", invalid(field, "must be a single line")
	}
	return v, nil
}

// Description validates an optional multi-line description.
func Description(field, value string) (string, error) {
	v := strings.TrimSpace(value)
	if utf8.RuneCountInString(v) > MaxDescriptionLength {
		return "", invalid(field, fmt.Sprintf("must be at most %d characters", MaxDescriptionLength))
	}
	return v, nil
}

// Capacity validates an event capacity, where 0 means unlimited.
func Capacity(field string, value int32) (int64, error) {
	if value < 0 || value > MaxCapacity {
		return 0, invalid(field, fmt.Sprintf("must be between 0 (unlimited) and %d", MaxCapacity))
	}
	return int64(value), nil
}

// Email validates and normalizes (trim, lower case) an email address.
func Email(field, value string) (string, error) {
	v := strings.ToLower(strings.TrimSpace(value))
	if v == "" {
		return "", invalid(field, "must not be blank")
	}
	if len(v) > MaxEmailLength {
		return "", invalid(field, "is too long")
	}
	addr, err := mail.ParseAddress(v)
	if err != nil || addr.Address != v || addr.Name != "" {
		return "", invalid(field, "must be a valid email address")
	}
	if _, domain, _ := strings.Cut(v, "@"); !strings.Contains(domain, ".") {
		return "", invalid(field, "must be a valid email address")
	}
	return v, nil
}

// OptionalEmail validates an email address that may be blank.
func OptionalEmail(field, value string) (string, error) {
	if strings.TrimSpace(value) == "" {
		return "", nil
	}
	return Email(field, value)
}

// PersonName validates an optional first or last name.
func PersonName(field, value string) (string, error) {
	v := strings.TrimSpace(value)
	if utf8.RuneCountInString(v) > MaxPersonNameLength {
		return "", invalid(field, fmt.Sprintf("must be at most %d characters", MaxPersonNameLength))
	}
	for _, r := range v {
		if unicode.IsControl(r) {
			return "", invalid(field, "must not contain control characters")
		}
	}
	return v, nil
}

// Username validates a user's login name.
func Username(field, value string) (string, error) {
	v := strings.TrimSpace(value)
	if !usernameRegex.MatchString(v) {
		return "", invalid(field, "must be 3-64 characters of letters, numbers, '.', '_' or '-'")
	}
	return v, nil
}

// Password validates a new password. It is not trimmed.
func Password(field, value string) (string, error) {
	if utf8.RuneCountInString(value) < config.MinPasswordLength {
		return "", invalid(field, fmt.Sprintf("must be at least %d characters", config.MinPasswordLength))
	}
	if len(value) > MaxPasswordBytes {
		return "", invalid(field, fmt.Sprintf("must be at most %d bytes", MaxPasswordBytes))
	}
	return value, nil
}

// APIKeyName validates the display name of an API key.
func APIKeyName(field, value string) (string, error) {
	v := strings.TrimSpace(value)
	if v == "" {
		return "", invalid(field, "must not be blank")
	}
	if utf8.RuneCountInString(v) > 64 {
		return "", invalid(field, "must be at most 64 characters")
	}
	return v, nil
}

// Timezone validates an IANA timezone name. Blank means UTC.
func Timezone(field, value string) (string, error) {
	v := strings.TrimSpace(value)
	if v == "" {
		return "", nil
	}
	if _, err := time.LoadLocation(v); err != nil {
		return "", invalid(field, "must be a valid IANA timezone, e.g. America/New_York")
	}
	return v, nil
}

// Timestamp parses an RFC 3339 timestamp and returns it in UTC, truncated to the second.
func Timestamp(field, value string) (time.Time, error) {
	t, err := time.Parse(time.RFC3339, strings.TrimSpace(value))
	if err != nil {
		return time.Time{}, invalid(field, "must be an RFC 3339 timestamp")
	}
	return t.UTC().Truncate(time.Second), nil
}

// Required ensures a string identifier is present.
func Required(field, value string) (string, error) {
	v := strings.TrimSpace(value)
	if v == "" {
		return "", invalid(field, "is required")
	}
	return v, nil
}

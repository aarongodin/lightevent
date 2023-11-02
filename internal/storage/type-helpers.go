package storage

import "database/sql"

// SetInt64FromBool will update the dest with a number representation of the given bool.
// This is required for sqlite which does not have a boolean type. As such, integers are used in storage and translated.
func SetInt64FromBool(dest *int64, value bool) {
	if value {
		*dest = 1
	} else {
		*dest = 0
	}
}

// SetBoolFromInt64 will update the dest with a bool representation of the given int64.
// This is required for sqlite which does not have a boolean type. As such, integers are used in storage and translated.
func SetBoolFromInt64(dest *bool, value int64) {
	if value == 1 {
		*dest = true
	} else {
		*dest = false
	}
}

// SetOptionalString helps with setting a sql.NullString based on a possible string value from the request.
func SetOptionalString(dest *sql.NullString, value *string) {
	if value == nil {
		return
	}
	if *value != "" {
		*dest = sql.NullString{String: *value, Valid: true}
	}
}

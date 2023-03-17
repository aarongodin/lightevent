package repository

import "errors"

var (
	// signalEOF is an internal error for tracking the premature end of an enumerating storm query
	errSignalEOF = errors.New("signal_eof")
)

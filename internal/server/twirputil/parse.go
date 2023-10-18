package twirputil

import "strings"

// ParseTwirpPath is taken verbatim from the twirp-generated go client.
func ParseTwirpPath(path string) (string, string, string) {
	parts := strings.Split(path, "/")
	if len(parts) < 2 {
		return "", "", ""
	}
	method := parts[len(parts)-1]
	pkgService := parts[len(parts)-2]
	prefix := strings.Join(parts[0:len(parts)-2], "/")
	return prefix, pkgService, method
}

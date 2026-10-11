package web

import (
	"io/fs"
	"net/http"
)

// ClientBundleFile is the name of the built client app script.
const ClientBundleFile = "lightevent-client.js"

// ClientBundle serves the client app script that websites include to embed LightEvent. The URL does not change
// between versions, so the script is cached briefly.
func ClientBundle(fsys fs.FS) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		script, err := fs.ReadFile(fsys, ClientBundleFile)
		if err != nil {
			http.Error(w, "The client app has not been built. Run `make build-client` and rebuild the server.", http.StatusServiceUnavailable)
			return
		}
		h := w.Header()
		h.Set("Content-Type", "text/javascript; charset=utf-8")
		h.Set("Cache-Control", "public, max-age=300")
		// The script is loaded by pages on other origins, including ones that require CORP.
		h.Set("Cross-Origin-Resource-Policy", "cross-origin")
		w.Write(script) //nolint:errcheck
	})
}

package util

import (
	"encoding/json"
	"net/http"

	"github.com/twitchtv/twirp"
)

func WriteJSON(w http.ResponseWriter, status int, value any) {
	out, err := json.Marshal(value)
	if err != nil {
		twirp.WriteError(w, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	w.Write(out)
}

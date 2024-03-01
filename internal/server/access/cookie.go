package access

import (
	"net/http"

	"github.com/aarongodin/lightevent/internal/config"
	"github.com/gorilla/securecookie"
	"github.com/rs/zerolog/log"
)

const (
	COOKIE_USER_SESSION   = "lightevent-user-session"
	COOKIE_MEMBER_SESSION = "lightevent-member-session"
)

var sc *securecookie.SecureCookie

func InitCookies(cfg *config.RuntimeConfig) {
	hashKey := []byte(cfg.CookieHMACSecret)
	if len(hashKey) == 0 {
		log.Warn().Msg("securecookie: no hashKey specified; falling back to generated key. " +
			"This key will not be persisted and will invalidate user and member sessions upon application restart. " +
			"Specify the environment variable COOKIE_HMAC_SECRET with a secure alphanumeric value.")
		hashKey = securecookie.GenerateRandomKey(32)
	}
	sc = securecookie.New(hashKey, nil)
}

// encodeCookie performs the hash encoding on a value and sets it on the cookie
func EncodeCookie(cookie *http.Cookie, value any) error {
	v, err := sc.Encode(cookie.Name, cookie.Value)
	if err != nil {
		return err
	}
	cookie.Value = v
	return nil
}

// SetCookie calls the http.SetCookie func after encoding the cookie value
func SetCookie(w http.ResponseWriter, encode bool, cookie *http.Cookie) error {
	if encode {
		if err := EncodeCookie(cookie, cookie.Value); err != nil {
			return err
		}
	}
	http.SetCookie(w, cookie)
	return nil
}

// GetCookie returns the cookie after decoding the cookie value
func GetCookie(r *http.Request, name string) (*http.Cookie, error) {
	cookie, err := r.Cookie(name)
	if err != nil {
		return nil, err
	}
	if err := sc.Decode(name, cookie.Value, &cookie.Value); err != nil {
		return nil, err
	}
	return cookie, nil
}

// NewCookie is a helper for keeping cookie settings consistent across any usage of http.Cookie.
// Do not create your own instance of http.Cookie and use this instead, to avoid failing
// to set important security values.
func NewCookie(name string, value string, maxAge int, secure bool) *http.Cookie {
	return &http.Cookie{
		Name:     name,
		Value:    value,
		HttpOnly: true,
		MaxAge:   maxAge,
		Secure:   secure,
		Path:     "/",
		SameSite: http.SameSiteStrictMode,
	}
}

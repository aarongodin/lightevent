package access

import (
	"net/http"

	"github.com/aarongodin/spectral/internal/server/config"
	"github.com/gorilla/securecookie"
)

const (
	COOKIE_USER_SESSION   = "spectral-user-session"
	COOKIE_MEMBER_SESSION = "spectral-member-session"
)

var sc *securecookie.SecureCookie

func InitCookies(cfg *config.RuntimeConfig) {
	hashKey := []byte(cfg.CookieHMACSecret)
	if len(hashKey) == 0 {
		// TODO(aarongodin): warn the user that they are using a generated key
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

// setCookie calls the http.SetCookie func after encoding the cookie value
func SetCookie(w http.ResponseWriter, cookie *http.Cookie) error {
	if err := EncodeCookie(cookie, cookie.Value); err != nil {
		return err
	}
	http.SetCookie(w, cookie)
	return nil
}

// getCookie returns the cookie after decoding the cookie value
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

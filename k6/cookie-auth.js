import { check } from "k6"
import http from "k6/http"

const BASE_URL = __ENV.LIGHTEVENT_URL || "http://localhost:8080"
const USERNAME = __ENV.LIGHTEVENT_USERNAME || "admin"
const PASSWORD = __ENV.LIGHTEVENT_PASSWORD

export default function () {
  const response = http.post(
    `${BASE_URL}/auth/login`,
    { username: USERNAME, password: PASSWORD },
    { redirects: 0, headers: { "Content-Type": "application/x-www-form-urlencoded" } },
  )
  check(response, {
    "login status is 303": (r) => r.status === 303,
    "login succeeded": (r) => r.headers.Location === "/",
    "cookie is set": (r) => r.cookies["lightevent-user-session"] !== undefined,
  })
  const response2 = http.post(`${BASE_URL}/rpc/lightevent.v1.LightEventService/Ping`, "{}", {
    headers: { "content-type": "application/json" },
  })
  check(response2, {
    "ping status is 200": (r) => r.status === 200,
    "subject is correct": (r) => JSON.parse(r.body).displayName === USERNAME,
  })
  const response3 = http.post(`${BASE_URL}/auth/logout`)
  check(response3, {
    "logout status is 204": (r) => r.status === 204,
  })
}

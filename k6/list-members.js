import { check } from "k6"
import http from "k6/http"

const BASE_URL = __ENV.LIGHTEVENT_URL || "http://localhost:8080"
const API_KEY = __ENV.LIGHTEVENT_API_KEY

export default function () {
  const response = http.post(`${BASE_URL}/rpc/lightevent.v1.LightEventService/ListMembers`, "{}", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
  })
  check(response, {
    "status is 200": (r) => r.status === 200,
  })
}

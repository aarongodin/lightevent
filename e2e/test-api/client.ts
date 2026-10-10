import { type Client, createClient, type Interceptor } from "@connectrpc/connect"
import { createConnectTransport } from "@connectrpc/connect-node"

import { LightEventService } from "../src/gen/lightevent/v1/service_pb"

// The API tests run against a server started separately (see CONTRIBUTING.md). Create an API key in the
// admin UI (Settings → API keys) and export it as LIGHTEVENT_API_KEY.
const baseUrl = process.env.LIGHTEVENT_URL ?? "http://127.0.0.1:8080"

export function buildClient(headers: Record<string, string> = {}): Client<typeof LightEventService> {
  const withHeaders: Interceptor = (next) => (req) => {
    for (const [key, value] of Object.entries(headers)) {
      req.header.set(key, value)
    }
    return next(req)
  }
  return createClient(
    LightEventService,
    createConnectTransport({ baseUrl: `${baseUrl}/rpc`, httpVersion: "1.1", interceptors: [withHeaders] }),
  )
}

export const adminClient = buildClient({ Authorization: `Bearer ${process.env.LIGHTEVENT_API_KEY ?? ""}` })

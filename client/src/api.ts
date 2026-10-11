import type {
  BeginVerificationResponseJson,
  CompleteVerificationResponseJson,
  GetClientConfigResponseJson,
  GetEventResponseJson,
  GetMyProfileResponseJson,
  GetRegistrationResponseJson,
  ListEventsResponseJson,
  ListMyRegistrationsResponseJson,
  RegisterRequestJson,
  RegisterResponseJson,
} from "./gen/lightevent/v1/service_pb"

// The client calls the Connect API with plain JSON over fetch. Only the generated JSON types are imported (as
// types), which keeps the protobuf runtime out of the bundle.

export class ApiError extends Error {
  constructor(
    // code is a Connect error code such as "not_found", or "unavailable" when the server could not be reached.
    readonly code: string,
    message: string,
  ) {
    super(message)
  }
}

// SessionStore keeps the member's session token.
export class SessionStore {
  private memory: string | null = null
  private key: string

  constructor(
    baseURL: string,
    private kind: "local" | "session" | "memory",
  ) {
    this.key = `lightevent:session:${baseURL}`
  }

  private storage(): Storage | null {
    try {
      return this.kind === "local" ? window.localStorage : this.kind === "session" ? window.sessionStorage : null
    } catch {
      // Storage can be unavailable, e.g. when blocked by privacy settings.
      return null
    }
  }

  get(): string | null {
    try {
      return this.storage()?.getItem(this.key) ?? this.memory
    } catch {
      return this.memory
    }
  }

  set(token: string | null) {
    this.memory = token
    try {
      const storage = this.storage()
      if (token) {
        storage?.setItem(this.key, token)
      } else {
        storage?.removeItem(this.key)
      }
    } catch {
      // The token is still kept in memory.
    }
  }
}

export type Api = ReturnType<typeof createApi>

export function createApi(baseURL: string, session: SessionStore, onSessionExpired: () => void) {
  async function call<T>(method: string, body: object = {}, retry = true): Promise<T> {
    const token = session.get()
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Connect-Protocol-Version": "1",
    }
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    let resp: Response
    try {
      resp = await fetch(`${baseURL}/rpc/lightevent.v1.LightEventService/${method}`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        credentials: "omit",
      })
    } catch {
      throw new ApiError("unavailable", "We couldn't reach the server. Check your connection and try again.")
    }
    const json = await resp.json().catch(() => ({}))
    if (resp.ok) {
      return json as T
    }

    const code: string = json.code ?? "unknown"
    if (code === "unauthenticated" && token) {
      // The session expired or was revoked. Forget it, and retry public calls without it.
      session.set(null)
      onSessionExpired()
      if (retry) {
        return call<T>(method, body, false)
      }
    }
    throw new ApiError(code, json.message || "Something went wrong. Please try again.")
  }

  return {
    getConfig: () => call<GetClientConfigResponseJson>("GetClientConfig"),
    listEvents: (tags: string[]) => call<ListEventsResponseJson>("ListEvents", { tags, limit: 200 }),
    getEvent: (name: string) => call<GetEventResponseJson>("GetEvent", { name }),
    beginVerification: (email: string) => call<BeginVerificationResponseJson>("BeginVerification", { email }),
    completeVerification: (key: string, code: string) =>
      call<CompleteVerificationResponseJson>("CompleteVerification", { key, code }),
    getProfile: () => call<GetMyProfileResponseJson>("GetMyProfile"),
    register: (req: RegisterRequestJson) => call<RegisterResponseJson>("Register", req),
    listMyRegistrations: () => call<ListMyRegistrationsResponseJson>("ListMyRegistrations"),
    getRegistration: (confCode: string) => call<GetRegistrationResponseJson>("GetRegistration", { confCode }),
    cancelRegistration: (confCode: string) => call("CancelMyRegistration", { confCode }),
    endSession: () => call("EndMemberSession"),
  }
}

import { createContext, useContext } from "react"

import type { PingResponse } from "../gen/lightevent/v1/service_pb"

export const IdentityContext = createContext<PingResponse | null>(null)

// useIdentity returns the signed-in user. It is always available below the root of the app.
export function useIdentity(): PingResponse {
  const identity = useContext(IdentityContext)
  if (identity === null) {
    throw new Error("useIdentity must be used within IdentityContext")
  }
  return identity
}

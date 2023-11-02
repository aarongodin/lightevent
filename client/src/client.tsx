import { createContext } from "preact"
import { useContext } from "preact/hooks"

import { LightEventClientJSON } from "./rpc/service.twirp"

export const ClientContext = createContext<LightEventClientJSON | null>(null)

export function useClient(): LightEventClientJSON {
  const v = useContext(ClientContext)
  if (v === null) {
    throw new Error("uninitialized client")
  }
  return v
}

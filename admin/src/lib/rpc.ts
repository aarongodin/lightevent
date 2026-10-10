import { Code, ConnectError, createClient } from "@connectrpc/connect"
import { createConnectTransport } from "@connectrpc/connect-web"
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query"

import { LightEventService } from "../gen/lightevent/v1/service_pb"

export const transport = createConnectTransport({
  baseUrl: `${window.location.origin}/rpc`,
  fetch: (input, init) => fetch(input, { ...init, credentials: "same-origin" }),
})

// client is used for imperative calls outside of React Query hooks.
export const client = createClient(LightEventService, transport)

export { LightEventService }

export function redirectToLogin() {
  window.location.assign("/login")
}

function handleGlobalError(err: unknown) {
  // A session that expires while the app is open sends the user back to the login page.
  if (err instanceof ConnectError && err.code === Code.Unauthenticated) {
    redirectToLogin()
  }
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: handleGlobalError }),
  mutationCache: new MutationCache({ onError: handleGlobalError }),
  defaultOptions: {
    queries: {
      staleTime: 10_000,
      refetchOnWindowFocus: false,
      retry: (count, err) => {
        if (err instanceof ConnectError && err.code !== Code.Unavailable && err.code !== Code.Unknown) {
          return false
        }
        return count < 2
      },
    },
  },
})

// invalidateAll marks every cached query stale after a change. The admin UI is small, so refetching what is
// on screen is simpler and more reliable than tracking which queries a mutation affects.
export function invalidateAll() {
  return queryClient.invalidateQueries()
}

// errorMessage returns a message suitable for showing to the user.
export function errorMessage(err: unknown): string {
  if (err instanceof ConnectError) {
    return err.rawMessage || err.code.toString()
  }
  if (err instanceof Error) {
    return err.message
  }
  return "Something went wrong."
}

export function isNotFound(err: unknown): boolean {
  return err instanceof ConnectError && err.code === Code.NotFound
}

export async function logout() {
  await fetch("/auth/logout", { method: "POST", credentials: "same-origin" })
  redirectToLogin()
}

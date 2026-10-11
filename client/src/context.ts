import { createContext } from "preact"
import { useContext, useEffect, useState } from "preact/hooks"

import { type Api, ApiError } from "./api"
import type { ClientConfigJson, MemberJson } from "./gen/lightevent/v1/service_pb"
import type { Formatter } from "./model"
import type { ResolvedOptions } from "./options"
import { type NavigateOptions, parseRoute, type Router } from "./router"

export type AppContextValue = {
  api: Api
  router: Router
  cache: QueryCache
  options: ResolvedOptions
  config: ClientConfigJson
  format: Formatter
  // member is the signed-in member, or null when signed out.
  member: MemberJson | null
  signIn(token: string, member: MemberJson): void
  signOut(): Promise<void>
}

export const AppContext = createContext<AppContextValue>(null as unknown as AppContextValue)

export function useApp(): AppContextValue {
  return useContext(AppContext)
}

// useRoute returns the current route and re-renders when it changes.
export function useRoute() {
  const { router } = useApp()
  const [route, setRoute] = useState(router.route)
  useEffect(() => {
    setRoute(router.route)
    return router.subscribe(setRoute)
  }, [router])
  return { route, ...parseRoute(route) }
}

export function useNavigate(): (route: string, opts?: NavigateOptions) => void {
  const { router } = useApp()
  return (route, opts) => router.navigate(route, opts)
}

// QueryCache keeps API responses for the lifetime of the app, so navigating back to a page shows it immediately
// while it is refreshed in the background.
type Entry = { data?: unknown; promise?: Promise<unknown>; time: number }

const staleAfter = 15_000

export class QueryCache {
  private entries = new Map<string, Entry>()
  private listeners = new Set<() => void>()

  peek<T>(key: string): T | undefined {
    return this.entries.get(key)?.data as T | undefined
  }

  isFresh(key: string): boolean {
    const entry = this.entries.get(key)
    return !!entry && entry.data !== undefined && Date.now() - entry.time < staleAfter
  }

  fetch<T>(key: string, fn: () => Promise<T>): Promise<T> {
    const entry = this.entries.get(key) ?? { time: 0 }
    if (!entry.promise) {
      entry.promise = fn().then(
        (data) => {
          this.entries.set(key, { data, time: Date.now() })
          return data
        },
        (err) => {
          entry.promise = undefined
          throw err
        },
      )
      this.entries.set(key, entry)
    }
    return entry.promise as Promise<T>
  }

  // invalidate marks every response stale and refreshes the queries on screen, e.g. after registering.
  invalidate() {
    for (const entry of this.entries.values()) {
      entry.time = 0
    }
    for (const listener of this.listeners) {
      listener()
    }
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }
}

export type QueryState<T> = { data?: T; error?: ApiError; loading: boolean; reload(): void }

// useQuery loads data for key (or nothing when key is null), sharing responses through the QueryCache.
export function useQuery<T>(key: string | null, fn: () => Promise<T>): QueryState<T> {
  const { cache } = useApp()
  const [version, setVersion] = useState(0)
  const [state, setState] = useState<{ key: string | null; data?: T; error?: ApiError }>({ key: null })

  useEffect(() => cache.subscribe(() => setVersion((v) => v + 1)), [cache])

  useEffect(() => {
    if (key === null) {
      return
    }
    let active = true
    const cached = cache.peek<T>(key)
    setState((s) => ({ key, data: cached ?? (s.key === key ? s.data : undefined) }))
    if (!cache.isFresh(key)) {
      cache.fetch(key, fn).then(
        (data) => active && setState({ key, data }),
        (err) =>
          active &&
          setState((s) => ({
            key,
            data: s.key === key ? s.data : undefined,
            error: err instanceof ApiError ? err : new ApiError("unknown", String(err)),
          })),
      )
    }
    return () => {
      active = false
    }
    // fn is recreated on every render; the key identifies the query.
  }, [cache, key, version])

  const current = state.key === key ? state : { key }
  return {
    data: current.data,
    error: current.error,
    loading: key !== null && current.data === undefined && !current.error,
    reload: () => cache.invalidate(),
  }
}

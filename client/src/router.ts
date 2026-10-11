import type { NavigationOptions } from "./options"

// A route is the app's location as a path with an optional query, e.g. "/events/yoga?tags=vinyasa". How it is
// stored in the browser URL depends on the navigation mode; see NavigationMode.

export type ParsedRoute = { path: string; query: URLSearchParams }

export function parseRoute(route: string): ParsedRoute {
  const i = route.indexOf("?")
  const path = (i < 0 ? route : route.slice(0, i)) || "/"
  return { path: path.startsWith("/") ? path : `/${path}`, query: new URLSearchParams(i < 0 ? "" : route.slice(i + 1)) }
}

// buildRoute joins a path and query parameters, leaving out empty values.
export function buildRoute(path: string, query: Record<string, string | undefined> = {}): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value) {
      params.set(key, value)
    }
  }
  const search = params.toString()
  return search ? `${path}?${search}` : path
}

// LocationAdapter reads and writes the route in one place, such as a query parameter of the page URL.
type LocationAdapter = {
  read(): string
  href(route: string): string
  write(route: string, replace: boolean): void
  listen(onChange: () => void): () => void
}

// encodeRoute escapes a route for use in a query parameter while keeping it readable.
function encodeRoute(route: string): string {
  return encodeURIComponent(route).replace(/%2F/g, "/").replace(/%3F/g, "?").replace(/%3D/g, "=").replace(/%2C/g, ",")
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value.replace(/\+/g, " "))
  } catch {
    return value
  }
}

// withParam returns the query string with param set to value (or removed when value is null), keeping the
// other parameters of the host page exactly as they are.
function withParam(search: string, param: string, value: string | null): string {
  const parts = search
    .replace(/^\?/, "")
    .split("&")
    .filter((part) => part && safeDecode(part.split("=")[0]) !== param)
  if (value !== null) {
    parts.push(`${encodeURIComponent(param)}=${encodeRoute(value)}`)
  }
  return parts.length ? `?${parts.join("&")}` : ""
}

function browserAdapter(read: () => string, href: (route: string) => string, hash: boolean): LocationAdapter {
  return {
    read,
    href,
    write(route, replace) {
      // Keep the host page's history state, which its own router may rely on.
      const state = window.history.state
      if (replace) {
        window.history.replaceState(state, "", href(route))
      } else {
        window.history.pushState(state, "", href(route))
      }
    },
    listen(onChange) {
      window.addEventListener("popstate", onChange)
      if (hash) {
        window.addEventListener("hashchange", onChange)
      }
      return () => {
        window.removeEventListener("popstate", onChange)
        window.removeEventListener("hashchange", onChange)
      }
    },
  }
}

function queryAdapter(param: string): LocationAdapter {
  return browserAdapter(
    () => new URLSearchParams(window.location.search).get(param) || "/",
    (route) => {
      const { pathname, search, hash } = window.location
      return pathname + withParam(search, param, route === "/" ? null : route) + hash
    },
    false,
  )
}

function hashAdapter(): LocationAdapter {
  return browserAdapter(
    () => {
      const hash = window.location.hash
      // Fragments that are not routes (such as in-page anchors) show the start page.
      return hash.startsWith("#/") ? safeDecode(hash.slice(1)) : "/"
    },
    (route) => window.location.pathname + window.location.search + (route === "/" ? "" : `#${route}`),
    true,
  )
}

function pathAdapter(basePath: string): LocationAdapter {
  return browserAdapter(
    () => {
      const { pathname, search } = window.location
      if (pathname !== basePath && !pathname.startsWith(`${basePath}/`)) {
        return "/"
      }
      return (safeDecode(pathname.slice(basePath.length)) || "/") + search
    },
    (route) => {
      const { path, query } = parseRoute(route)
      const search = query.toString()
      return (path === "/" ? basePath || "/" : basePath + path) + (search ? `?${search}` : "")
    },
    false,
  )
}

function memoryAdapter(): LocationAdapter {
  let current = "/"
  return {
    read: () => current,
    href: () => "#",
    write(route) {
      current = route
    },
    listen: () => () => {},
  }
}

export type NavigateOptions = { replace?: boolean }

// Router keeps the current route in sync with the browser URL according to the navigation options.
export class Router {
  route: string
  private adapter: LocationAdapter
  private listeners = new Set<(route: string, pop: boolean) => void>()
  private unlisten: () => void

  constructor(private options: Required<NavigationOptions>) {
    switch (options.mode) {
      case "hash":
        this.adapter = hashAdapter()
        break
      case "path":
        this.adapter = pathAdapter(options.basePath)
        break
      case "memory":
        this.adapter = memoryAdapter()
        break
      default:
        this.adapter = queryAdapter(options.param)
    }
    this.route = this.adapter.read()
    this.unlisten = this.adapter.listen(() => {
      const route = this.adapter.read()
      if (route !== this.route) {
        this.route = route
        this.emit(true)
      }
    })
  }

  // usesBrowserURL reports whether links have a real URL (they do not in memory mode).
  get usesBrowserURL(): boolean {
    return this.options.mode !== "memory"
  }

  href(route: string): string {
    return this.adapter.href(route)
  }

  navigate(route: string, opts: NavigateOptions = {}) {
    if (route === this.route) {
      return
    }
    this.adapter.write(route, opts.replace || this.options.history === "replace")
    this.route = route
    this.emit(false)
  }

  subscribe(listener: (route: string, pop: boolean) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  destroy() {
    this.unlisten()
    this.listeners.clear()
  }

  private emit(pop: boolean) {
    for (const listener of this.listeners) {
      listener(this.route, pop)
    }
  }
}

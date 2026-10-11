// NavigationMode selects how the app's current page is reflected in the browser URL.
//   - "query" (default): a query parameter on the host page, e.g. /classes?le=/events/yoga. Deep links and
//     back/forward work without any server configuration, and the host page keeps its #hash.
//   - "hash": the URL fragment, e.g. /classes#/events/yoga.
//   - "path": real paths under basePath, e.g. /classes/events/yoga. The host website must serve the embedding
//     page for every path under basePath.
//   - "memory": the URL never changes. Back/forward do not navigate within the app.
export type NavigationMode = "query" | "hash" | "path" | "memory"

export type NavigationOptions = {
  mode?: NavigationMode
  // history decides whether navigating within the app adds browser history entries ("push", the default) or
  // only updates the URL of the current entry ("replace"). Ignored in memory mode.
  history?: "push" | "replace"
  // param is the query parameter used in query mode. Defaults to "le".
  param?: string
  // basePath is the path the app is mounted at in path mode. Defaults to "/".
  basePath?: string
  // scroll brings the top of the app into view after navigating, when it is scrolled out of view. Defaults to
  // true.
  scroll?: boolean
}

// Theme values are applied as CSS custom properties on the container, so they can also be set from the host
// page's stylesheet (e.g. `#events { --le-color-primary: #0a7; }`).
export type Theme = {
  primaryColor?: string
  primaryTextColor?: string
  textColor?: string
  backgroundColor?: string
  borderRadius?: string
  fontFamily?: string
}

export type InitOptions = {
  // baseURL is the URL of the LightEvent server, e.g. "https://events.example.com".
  baseURL: string
  // element is the container the app renders into, as an element or a CSS selector.
  element: Element | string
  navigation?: NavigationOptions
  // tags limits the app to events with at least one of these tags (by tag name), for pages dedicated to a kind
  // of event. Members can still filter within them.
  tags?: string[]
  // locale for dates and numbers. Defaults to the browser's locale.
  locale?: string
  // timeZone overrides the time zone used to show event dates. Defaults to the time zone configured on the
  // server, or the visitor's time zone when none is configured.
  timeZone?: string
  // storage is where the member's session is kept. "local" (default) keeps members signed in across visits,
  // "session" until the tab is closed, and "memory" until the page is reloaded.
  storage?: "local" | "session" | "memory"
  theme?: Theme
  // onNavigate is called with the app's route after every navigation, e.g. for analytics.
  onNavigate?: (route: string) => void
}

export type ResolvedOptions = {
  baseURL: string
  container: Element
  navigation: Required<NavigationOptions>
  tags: string[]
  locale: string | undefined
  timeZone: string | undefined
  storage: "local" | "session" | "memory"
  theme: Theme
  onNavigate: ((route: string) => void) | undefined
}

const modes: NavigationMode[] = ["query", "hash", "path", "memory"]

function fail(message: string): never {
  throw new Error(`LightEventClient: ${message}`)
}

export function resolveOptions(options: InitOptions): ResolvedOptions {
  if (!options || typeof options !== "object") {
    fail("init() requires an options object")
  }
  if (!options.baseURL) {
    fail("the baseURL option is required")
  }
  let baseURL: string
  try {
    baseURL = new URL(options.baseURL, window.location.href).href.replace(/\/+$/, "")
  } catch {
    fail(`baseURL ${JSON.stringify(options.baseURL)} is not a valid URL`)
  }

  const container = typeof options.element === "string" ? document.querySelector(options.element) : options.element
  if (!(container instanceof Element)) {
    fail(`the element ${JSON.stringify(options.element)} was not found`)
  }

  const nav = options.navigation ?? {}
  const mode = nav.mode ?? "query"
  if (!modes.includes(mode)) {
    fail(`navigation.mode must be one of ${modes.join(", ")}`)
  }
  let basePath = `/${(nav.basePath ?? "/").replace(/^\/+|\/+$/g, "")}`
  if (basePath === "/") {
    basePath = ""
  }

  return {
    baseURL,
    container,
    navigation: {
      mode,
      history: nav.history === "replace" ? "replace" : "push",
      param: nav.param || "le",
      basePath,
      scroll: nav.scroll ?? true,
    },
    tags: options.tags ?? [],
    locale: options.locale,
    timeZone: options.timeZone,
    storage: options.storage ?? "local",
    theme: options.theme ?? {},
    onNavigate: options.onNavigate,
  }
}

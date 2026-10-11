import type { VNode } from "preact"
import { useEffect, useMemo, useRef, useState } from "preact/hooks"

import { createApi, SessionStore } from "./api"
import { AppContext, type AppContextValue, QueryCache, useApp, useRoute } from "./context"
import type { ClientConfigJson, MemberJson } from "./gen/lightevent/v1/service_pb"
import { createFormatter } from "./model"
import type { ResolvedOptions } from "./options"
import type { Router } from "./router"
import { ErrorMessage, Link, Loading, Notice } from "./ui"
import { AccountView, ConfirmationView } from "./views/account"
import { EventView } from "./views/event"
import { EventsView } from "./views/events"
import { RegisterView } from "./views/register"

const routes: [RegExp, (params: string[]) => VNode][] = [
  [/^\/$/, () => <EventsView />],
  [/^\/events\/([^/]+)$/, ([name]) => <EventView name={name} />],
  [/^\/events\/([^/]+)\/register$/, ([name]) => <RegisterView eventName={name} />],
  [/^\/events\/([^/]+)\/dates\/([^/]+)\/register$/, ([name, uid]) => <RegisterView eventName={name} dateUid={uid} />],
  [/^\/account$/, () => <AccountView />],
  [/^\/registrations\/([^/]+)$/, ([code]) => <ConfirmationView confCode={code} />],
]

function decode(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function View({ path }: { path: string }) {
  for (const [pattern, render] of routes) {
    const match = pattern.exec(path)
    if (match) {
      return render(match.slice(1).map(decode))
    }
  }
  return (
    <section>
      <h2 class="le-heading" tabIndex={-1}>
        Page not found
      </h2>
      <Notice>
        This page does not exist. <Link to="/">Browse events</Link>
      </Notice>
    </section>
  )
}

function Shell() {
  const { router, options, member } = useApp()
  const { path } = useRoute()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    options.onNavigate?.(router.route)
    return router.subscribe((route, pop) => {
      options.onNavigate?.(route)
      if (pop) {
        return
      }
      // After navigating within the app, move focus to the new page's heading for screen readers, and bring the
      // app into view if the visitor scrolled past its top.
      requestAnimationFrame(() => {
        ref.current?.querySelector<HTMLElement>(".le-heading")?.focus({ preventScroll: true })
        if (options.navigation.scroll && options.container.getBoundingClientRect().top < 0) {
          options.container.scrollIntoView({ block: "start" })
        }
      })
    })
  }, [router, options])

  return (
    <div class="le-app" ref={ref}>
      <nav class="le-nav" aria-label="Events navigation">
        <Link to="/" aria-current={path === "/" ? "page" : undefined}>
          Events
        </Link>
        <Link to="/account" aria-current={path === "/account" ? "page" : undefined}>
          {member ? "My registrations" : "Sign in"}
        </Link>
      </nav>
      <main class="le-main">
        <View key={path} path={path} />
      </main>
    </div>
  )
}

export function App({ options, router }: { options: ResolvedOptions; router: Router }) {
  const [config, setConfig] = useState<ClientConfigJson | null>(null)
  const [configError, setConfigError] = useState<Error | null>(null)
  const [attempt, setAttempt] = useState(0)
  const session = useMemo(() => new SessionStore(options.baseURL, options.storage), [options])
  // undefined while the stored session is being checked.
  const [member, setMember] = useState<MemberJson | null | undefined>(() => (session.get() ? undefined : null))
  const cache = useMemo(() => new QueryCache(), [])
  const api = useMemo(() => createApi(options.baseURL, session, () => setMember(null)), [options, session])

  useEffect(() => {
    setConfigError(null)
    api.getConfig().then(
      (resp) => setConfig(resp.config ?? {}),
      (err) => setConfigError(err),
    )
  }, [api, attempt])

  useEffect(() => {
    if (session.get()) {
      api.getProfile().then(
        (resp) => setMember(resp.member ?? null),
        () => setMember(null),
      )
    }
  }, [api, session])

  const value = useMemo<AppContextValue | null>(() => {
    if (!config || member === undefined) {
      return null
    }
    return {
      api,
      router,
      cache,
      options,
      config,
      member,
      format: createFormatter(options.locale, options.timeZone || config.timezone),
      signIn(token, signedIn) {
        session.set(token)
        setMember(signedIn)
        cache.invalidate()
      },
      async signOut() {
        await api.endSession().catch(() => {})
        session.set(null)
        setMember(null)
        cache.invalidate()
      },
    }
  }, [api, router, cache, options, config, member, session])

  if (configError) {
    return (
      <div class="le-app">
        <ErrorMessage
          error="Events could not be loaded. Please try again later."
          onRetry={() => setAttempt((n) => n + 1)}
        />
      </div>
    )
  }
  if (!value) {
    return (
      <div class="le-app">
        <Loading label="Loading events…" />
      </div>
    )
  }
  return (
    <AppContext.Provider value={value}>
      <Shell />
    </AppContext.Provider>
  )
}

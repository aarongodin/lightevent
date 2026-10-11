import type { AnchorHTMLAttributes, ComponentChildren } from "preact"

import type { ApiError } from "./api"
import { useApp } from "./context"
import type { TagJson } from "./gen/lightevent/v1/service_pb"
import type { DateAvailability } from "./model"

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "role"> & {
  to: string
  replace?: boolean
  children: ComponentChildren
}

// Link renders a real link to a route, so opening it in a new tab works, and navigates within the app on a
// plain click.
export function Link({ to, replace, children, ...props }: LinkProps) {
  const { router } = useApp()
  return (
    <a
      {...props}
      href={router.href(to)}
      onClick={(e) => {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
          return
        }
        e.preventDefault()
        router.navigate(to, { replace })
      }}
    >
      {children}
    </a>
  )
}

export function Loading({ label = "Loading…" }: { label?: string }) {
  return (
    <p class="le-loading" role="status">
      {label}
    </p>
  )
}

export function ErrorMessage({ error, onRetry }: { error: ApiError | string; onRetry?: () => void }) {
  return (
    <div class="le-alert le-alert-error" role="alert">
      <span>{typeof error === "string" ? error : error.message}</span>
      {onRetry && (
        <button type="button" class="le-link-button" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  )
}

export function Notice({ children }: { children: ComponentChildren }) {
  return <div class="le-alert">{children}</div>
}

export function TagList({ names }: { names: string[] | undefined }) {
  const { config } = useApp()
  if (!names?.length) {
    return null
  }
  const labels = new Map((config.tags ?? []).map((t: TagJson) => [t.name, t.label]))
  return (
    <ul class="le-tags" aria-label="Tags">
      {names.map((name) => (
        <li key={name} class="le-tag">
          {labels.get(name) ?? name}
        </li>
      ))}
    </ul>
  )
}

const statusLabels: Record<string, string> = {
  registered: "Registered",
  cancelled: "Cancelled",
  past: "Past",
  closed: "Registration closed",
  full: "Full",
}

export function Availability({ availability }: { availability: DateAvailability }) {
  const { config } = useApp()
  const { status, spotsLeft } = availability
  if (status === "open") {
    if (config.showRemainingSpots && spotsLeft !== undefined) {
      return (
        <span class="le-status">
          {spotsLeft} {spotsLeft === 1 ? "spot" : "spots"} left
        </span>
      )
    }
    return null
  }
  return <span class={`le-status le-status-${status}`}>{statusLabels[status]}</span>
}

export function BackLink({ to = "/", children = "All events" }: { to?: string; children?: ComponentChildren }) {
  return (
    <Link to={to} class="le-back">
      ← {children}
    </Link>
  )
}

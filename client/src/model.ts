import type { ClientConfigJson, EventDateJson, EventJson, RegistrationJson } from "./gen/lightevent/v1/service_pb"

// Fields with default values are omitted from JSON responses, so every field may be undefined.

export type DateStatus = "registered" | "cancelled" | "past" | "closed" | "full" | "open"

export type DateAvailability = { status: DateStatus; spotsLeft?: number }

export function isUpcoming(date: EventDateJson, now = Date.now()): boolean {
  return Date.parse(date.value ?? "") > now
}

// upcomingDates returns the dates of an event that have not started, including cancelled ones.
export function upcomingDates(event: EventJson, now = Date.now()): EventDateJson[] {
  return (event.dates ?? []).filter((d) => isUpcoming(d, now))
}

function spotsLeft(event: EventJson, date: EventDateJson): number | undefined {
  return event.capacity ? Math.max(0, event.capacity - (date.registrationCount ?? 0)) : undefined
}

export function hasSeriesRegistration(event: EventJson, regs: RegistrationJson[]): boolean {
  return regs.some((r) => r.kind === "REGISTRATION_KIND_SERIES" && r.eventName === event.name)
}

export function dateAvailability(event: EventJson, date: EventDateJson, regs: RegistrationJson[]): DateAvailability {
  const registered =
    hasSeriesRegistration(event, regs) ||
    regs.some((r) => r.kind === "REGISTRATION_KIND_ONCE" && r.eventDate?.uid === date.uid)
  const spots = spotsLeft(event, date)
  if (registered) {
    return { status: "registered" }
  }
  if (date.cancelled) {
    return { status: "cancelled" }
  }
  if (!isUpcoming(date)) {
    return { status: "past" }
  }
  if (event.closed) {
    return { status: "closed" }
  }
  if (spots === 0) {
    return { status: "full" }
  }
  return { status: "open", spotsLeft: spots }
}

export type SeriesAvailability = "unavailable" | "registered" | "closed" | "full" | "open"

// seriesAvailability mirrors the server's rules for registering for every date of an event.
export function seriesAvailability(
  event: EventJson,
  regs: RegistrationJson[],
  config: ClientConfigJson,
): SeriesAvailability {
  const dates = upcomingDates(event).filter((d) => !d.cancelled)
  if (!config.seriesRegistrationEnabled || dates.length < 2) {
    return "unavailable"
  }
  if (hasSeriesRegistration(event, regs)) {
    return "registered"
  }
  if (event.closed) {
    return "closed"
  }
  if (dates.some((d) => spotsLeft(event, d) === 0)) {
    return "full"
  }
  return "open"
}

export type Formatter = {
  date(iso: string | undefined): string
  time(iso: string | undefined): string
  dateTime(iso: string | undefined): string
}

export function createFormatter(locale: string | undefined, timeZone: string | undefined): Formatter {
  let zone = timeZone || undefined
  try {
    new Intl.DateTimeFormat(locale, { timeZone: zone })
  } catch {
    zone = undefined
  }
  const localZone = new Intl.DateTimeFormat().resolvedOptions().timeZone
  const thisYear = new Date().getFullYear()
  const dateWithYear = new Intl.DateTimeFormat(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: zone,
  })
  const date = new Intl.DateTimeFormat(locale, { weekday: "short", month: "short", day: "numeric", timeZone: zone })
  const time = new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
    timeZone: zone,
    // Name the time zone only when it differs from the visitor's.
    timeZoneName: zone && zone !== localZone ? "short" : undefined,
  })

  const parse = (iso: string | undefined) => new Date(iso ?? 0)
  return {
    date: (iso) => {
      const d = parse(iso)
      return (d.getFullYear() === thisYear ? date : dateWithYear).format(d)
    },
    time: (iso) => time.format(parse(iso)),
    dateTime(iso) {
      return `${this.date(iso)}, ${this.time(iso)}`
    },
  }
}

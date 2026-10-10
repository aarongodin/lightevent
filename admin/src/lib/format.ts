const dateTimeFormat = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZoneName: "short",
})

const dateFormat = new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "numeric" })

// formatDateTime formats an RFC 3339 timestamp in the browser's time zone, including the zone name.
export function formatDateTime(value: string): string {
  if (!value) {
    return "—"
  }
  return dateTimeFormat.format(new Date(value))
}

export function formatDate(value: string): string {
  if (!value) {
    return "—"
  }
  return dateFormat.format(new Date(value))
}

export function isPast(value: string): boolean {
  return new Date(value).getTime() <= Date.now()
}

export const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

const pad = (n: number) => n.toString().padStart(2, "0")

// toDateTimeLocal converts an RFC 3339 timestamp into the value format of <input type="datetime-local">.
export function toDateTimeLocal(value: string): string {
  if (!value) {
    return ""
  }
  const d = new Date(value)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// fromDateTimeLocal converts a datetime-local value (interpreted in the browser's time zone) into RFC 3339.
export function fromDateTimeLocal(value: string): string {
  return new Date(value).toISOString()
}

export function formatConfCode(code: string): string {
  return code.length === 8 ? `${code.slice(0, 4)}-${code.slice(4)}` : code
}

export function formatName(first: string, last: string): string {
  return [first, last].filter(Boolean).join(" ")
}

export function formatCapacity(count: number, capacity: number): string {
  return capacity > 0 ? `${count} / ${capacity}` : `${count}`
}

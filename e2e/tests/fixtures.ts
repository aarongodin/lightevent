import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

import { type APIRequestContext, type Browser, test as base, expect, type Page } from "@playwright/test"

export { expect }

export const ADMIN_USERNAME = process.env.E2E_ADMIN_USERNAME ?? "admin"
export const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "e2e-admin-password"
export const TIME_ZONE = "America/Chicago"

const serverLog = fileURLToPath(new URL("../.tmp/server.log", import.meta.url))

let counter = 0

// unique returns a lowercase identifier that is unique across tests and workers, so tests can share one server
// and database without interfering with each other.
export function unique(prefix: string): string {
  counter++
  return `${prefix}-${process.pid.toString(36)}${Date.now().toString(36)}${counter}`.toLowerCase()
}

// isoIn returns an RFC 3339 timestamp `days` days from now at the given local hour in TIME_ZONE.
export function isoIn(days: number, hour = 9, minute = 0): string {
  const local = localParts(new Date(Date.now() + days * 86_400_000))
  // Find the UTC instant whose local time in TIME_ZONE is the requested wall clock time.
  const guess = Date.UTC(local.year, local.month - 1, local.day, hour, minute)
  const offset = offsetMinutes(new Date(guess))
  return new Date(guess - offset * 60_000).toISOString().replace(/\.\d{3}Z$/, "Z")
}

// inputValue formats an RFC 3339 timestamp as a datetime-local input value in TIME_ZONE.
export function inputValue(iso: string): string {
  const p = localParts(new Date(iso))
  const pad = (n: number) => n.toString().padStart(2, "0")
  return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`
}

// formatDateTime matches the admin UI's date format for an RFC 3339 timestamp.
export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
    timeZone: TIME_ZONE,
  }).format(new Date(iso))
}

function localParts(d: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
  }).formatToParts(d)
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value)
  return { year: get("year"), month: get("month"), day: get("day"), hour: get("hour"), minute: get("minute") }
}

function offsetMinutes(d: Date): number {
  const p = localParts(d)
  return (Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute) - d.getTime()) / 60_000
}

export type EventInput = {
  name: string
  title?: string
  description?: string
  capacity?: number
  hidden?: boolean
  closed?: boolean
  dates?: string[]
  tags?: string[]
}

export type EventDate = { uid: string; value: string; cancelled?: boolean; registrationCount?: number }
export type Event = { name: string; title: string; dates: EventDate[]; capacity?: number }
export type Member = { uid: string; email: string; firstName?: string; lastName?: string }
export type Registration = { confCode: string }

// Api seeds data through the JSON API using the signed-in admin's session, so tests can focus their browser
// steps on the behavior under test.
export class Api {
  constructor(private request: APIRequestContext) {}

  async call<T>(method: string, body: object = {}): Promise<T> {
    const resp = await this.request.post(`/rpc/lightevent.v1.LightEventService/${method}`, { data: body })
    const json = await resp.json()
    if (!resp.ok()) {
      throw new Error(`${method} failed with ${resp.status()}: ${JSON.stringify(json)}`)
    }
    return json as T
  }

  async createEvent(input: EventInput): Promise<Event> {
    const { event } = await this.call<{ event: Event }>("CreateEvent", {
      event: {
        name: input.name,
        title: input.title ?? input.name,
        description: input.description ?? "",
        capacity: input.capacity ?? 0,
        hidden: input.hidden ?? false,
        closed: input.closed ?? false,
        dates: (input.dates ?? [isoIn(10)]).map((value) => ({ value })),
        tags: input.tags ?? [],
      },
    })
    return event
  }

  async createTag(name: string, label: string) {
    await this.call("CreateTag", { tag: { name, label } })
  }

  async cancelDate(uid: string) {
    await this.call("CancelEventDate", { eventDateUid: uid })
  }

  async archiveEvent(name: string, archived = true) {
    await this.call("SetEventArchived", { name, archived })
  }

  async createMember(email: string, firstName = "", lastName = ""): Promise<Member> {
    const { member } = await this.call<{ member: Member }>("CreateMember", { email, firstName, lastName })
    return member
  }

  async register(memberUid: string, eventName: string, eventDateUid?: string): Promise<Registration> {
    const { registration } = await this.call<{ registration: Registration }>("CreateRegistration", {
      memberUid,
      registration: {
        kind: eventDateUid ? "REGISTRATION_KIND_ONCE" : "REGISTRATION_KIND_SERIES",
        eventName,
        eventDateUid,
      },
    })
    return registration
  }

  async createUser(username: string, password: string) {
    const { user } = await this.call<{ user: { uid: string } }>("CreateUser", { username, password })
    return user
  }
}

export type Email = { to: string; subject: string; text: string }

// emailsTo returns the emails written to the server log by the "log" email provider for an address.
export function emailsTo(address: string): Email[] {
  return readFileSync(serverLog, "utf8")
    .split("\n")
    .filter((line) => line.includes("email (log provider)"))
    .map((line) => JSON.parse(line) as Email)
    .filter((e) => e.to === address)
}

// signIn signs in through the login form.
export async function signIn(page: Page, username: string, password: string) {
  await page.goto("/login")
  await page.getByLabel("Username").fill(username)
  await page.getByLabel("Password").fill(password)
  await page.getByRole("button", { name: "Sign in" }).click()
}

// confirmDialog returns the open confirmation dialog.
export function dialog(page: Page) {
  return page.getByRole("dialog")
}

// clientIP returns a distinct address for X-Forwarded-For. The test server trusts the header, so each test
// (and each extra browser context) is rate limited independently instead of sharing 127.0.0.1.
let ipCounter = 0
export function clientIP(): string {
  ipCounter++
  return `10.${process.pid % 250}.${Math.floor(ipCounter / 250) % 250}.${(ipCounter % 250) + 1}`
}

export const signedOut = { storageState: { cookies: [], origins: [] } }

// newSignedOutContext opens a separate browser context, e.g. to sign in as another user.
export async function newSignedOutContext(browser: Browser, baseURL: string | undefined) {
  return browser.newContext({ baseURL, ...signedOut, extraHTTPHeaders: { "X-Forwarded-For": clientIP() } })
}

export const test = base.extend<{ api: Api }>({
  extraHTTPHeaders: async ({ extraHTTPHeaders }, use) => {
    await use({ ...extraHTTPHeaders, "X-Forwarded-For": clientIP() })
  },
  api: async ({ request }, use) => {
    await use(new Api(request))
  },
})

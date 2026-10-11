import type { Page } from "@playwright/test"

import { hostURL } from "../playwright.config"
import { test as base, emailsTo, expect } from "./fixtures"

// test drops the X-Forwarded-For header the other tests send: Playwright adds it to the app's cross-origin
// requests, which the server's CORS policy (correctly) does not allow. Verification requests are therefore rate
// limited by the browser's own address, which leaves plenty of room for these tests.
export const test = base.extend({
  // biome-ignore lint/correctness/noEmptyPattern: Playwright requires a destructuring pattern.
  extraHTTPHeaders: async ({}, use) => {
    await use({})
  },
})

// Options passed to LightEventClient.init() on the host page, in addition to baseURL and element.
export type ClientOptions = {
  navigation?: { mode?: string; history?: string; param?: string; basePath?: string }
  tags?: string[]
  storage?: string
}

// openClient opens the host page (another origin than the server) with the client app embedded. Tests usually
// limit the app to their own tags, because all tests share one server.
export async function openClient(page: Page, options: ClientOptions, path = "/") {
  await page.addInitScript((opts) => {
    ;(window as unknown as { __LE_OPTIONS: unknown }).__LE_OPTIONS = opts
  }, options)
  await page.goto(hostURL + path)
}

// app returns the client app. Locators pierce its (open) shadow root.
export function app(page: Page) {
  return page.locator("#events")
}

// codesFor returns the verification codes emailed to an address, oldest first.
function codesFor(email: string): string[] {
  return emailsTo(email)
    .map((e) => /\b([0-9A-Z]{4}-[0-9A-Z]{4})\b/.exec(e.text)?.[1])
    .filter((c): c is string => !!c)
}

// verificationCode waits for a code beyond the first `previous` codes emailed to an address.
export async function verificationCode(email: string, previous = 0): Promise<string> {
  await expect.poll(() => codesFor(email).length).toBeGreaterThan(previous)
  return codesFor(email)[previous]
}

// signIn completes the email verification form shown by the client app.
export async function signIn(page: Page, email: string) {
  const before = codesFor(email).length
  await app(page).getByLabel("Email address").fill(email)
  await app(page).getByRole("button", { name: "Send code" }).click()
  const code = await verificationCode(email, before)
  await app(page).getByLabel("Verification code").fill(code)
  await app(page).getByRole("button", { name: "Verify" }).click()
}

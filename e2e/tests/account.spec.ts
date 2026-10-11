import type { Browser } from "@playwright/test"

import { expect, newSignedOutContext, signIn, test, unique } from "./fixtures"

const PASSWORD = "account-password-1"

// These tests sign in as a dedicated user in separate browser contexts so that changing passwords and revoking
// sessions does not affect the shared admin session (which seeds the users through the API).

async function newSession(browser: Browser, baseURL: string | undefined, username: string, password: string) {
  const context = await newSignedOutContext(browser, baseURL)
  const page = await context.newPage()
  await signIn(page, username, password)
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible()
  return { context, page }
}

test("changes your own password", async ({ api, browser, baseURL }) => {
  const username = unique("acct")
  await api.createUser(username, PASSWORD)
  const { context, page } = await newSession(browser, baseURL, username, PASSWORD)

  await page.goto("/settings/account")
  const form = page.getByRole("region", { name: "Change password" })
  await form.getByLabel("Current password").fill("wrong-password-x")
  await form.getByLabel(/^New password/).fill("another-password-2")
  await form.getByLabel("Confirm new password").fill("different-password")
  await form.getByRole("button", { name: "Change password" }).click()
  await expect(form.getByText("Passwords do not match")).toBeVisible()

  await form.getByLabel("Confirm new password").fill("another-password-2")
  await form.getByRole("button", { name: "Change password" }).click()
  await expect(form.getByRole("alert")).toContainText("current_password: is incorrect")

  await form.getByLabel("Current password").fill(PASSWORD)
  await form.getByRole("button", { name: "Change password" }).click()
  await expect(page.getByText("Password changed. Other sessions were signed out.")).toBeVisible()
  await expect(form.getByLabel(/^New password/)).toHaveValue("")

  // This session stays signed in; the new password works for new sessions.
  await page.goto("/events")
  await expect(page.getByRole("heading", { name: "Events" })).toBeVisible()
  const second = await newSession(browser, baseURL, username, "another-password-2")
  await second.context.close()
  await context.close()
})

test("lists sessions and signs out another session", async ({ api, browser, baseURL }) => {
  const username = unique("sessions")
  await api.createUser(username, PASSWORD)
  const first = await newSession(browser, baseURL, username, PASSWORD)
  const second = await newSession(browser, baseURL, username, PASSWORD)

  await first.page.goto("/settings/account")
  const sessions = first.page.getByRole("region", { name: "Sessions" })
  await expect(sessions.locator("tbody tr")).toHaveCount(2)
  const current = sessions.locator("tbody tr").filter({ hasText: "This session" })
  await expect(current).toHaveCount(1)
  await expect(current.getByRole("button", { name: "Sign out" })).toHaveCount(0)

  await sessions
    .locator("tbody tr")
    .filter({ hasNotText: "This session" })
    .getByRole("button", { name: "Sign out" })
    .click()
  await expect(first.page.getByText("Session signed out")).toBeVisible()
  await expect(sessions.locator("tbody tr")).toHaveCount(1)

  // The revoked session is sent back to the login page on its next request.
  await second.page.goto("/members")
  await expect(second.page).toHaveURL(/\/login$/)

  await first.context.close()
  await second.context.close()
})

test("changing your password signs out your other sessions", async ({ api, browser, baseURL }) => {
  const username = unique("signout")
  await api.createUser(username, PASSWORD)
  const first = await newSession(browser, baseURL, username, PASSWORD)
  const second = await newSession(browser, baseURL, username, PASSWORD)

  await first.page.goto("/settings/account")
  const form = first.page.getByRole("region", { name: "Change password" })
  await form.getByLabel("Current password").fill(PASSWORD)
  await form.getByLabel(/^New password/).fill("rotated-password-3")
  await form.getByLabel("Confirm new password").fill("rotated-password-3")
  await form.getByRole("button", { name: "Change password" }).click()
  await expect(first.page.getByText("Password changed.", { exact: false })).toBeVisible()

  await second.page.goto("/members")
  await expect(second.page).toHaveURL(/\/login$/)
  await first.context.close()
  await second.context.close()
})

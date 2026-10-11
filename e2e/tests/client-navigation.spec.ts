import type { Page } from "@playwright/test"

import { hostURL } from "../playwright.config"
import { app, openClient, test } from "./client-fixtures"
import { type Api, expect, unique } from "./fixtures"

async function createEvent(api: Api) {
  const tag = unique("nav")
  await api.createTag(tag, tag)
  const event = await api.createEvent({ name: unique("nav"), title: `Navigation ${tag}`, tags: [tag] })
  return { tag, event }
}

async function openEvent(page: Page, title: string) {
  await app(page).getByRole("article", { name: title }).getByRole("link", { name: title, exact: true }).click()
  await expect(app(page).getByRole("heading", { name: title, level: 2 })).toBeVisible()
}

async function expectList(page: Page) {
  await expect(app(page).getByRole("heading", { name: "Upcoming events" })).toBeVisible()
}

test("query mode keeps the host page's URL and supports back, forward and deep links", async ({ page, api }) => {
  const { tag, event } = await createEvent(api)
  await openClient(page, { tags: [tag] }, "/classes?utm_source=newsletter#top")
  await expectList(page)

  await openEvent(page, event.title)
  await expect(page).toHaveURL(`${hostURL}/classes?utm_source=newsletter&le=/events/${event.name}#top`)

  await page.goBack()
  await expectList(page)
  await expect(page).toHaveURL(`${hostURL}/classes?utm_source=newsletter#top`)
  await page.goForward()
  await expect(app(page).getByRole("heading", { name: event.title, level: 2 })).toBeVisible()

  // Deep links open the page directly.
  await page.reload()
  await expect(app(page).getByRole("heading", { name: event.title, level: 2 })).toBeVisible()

  // In-page anchors of the host page keep working.
  await page.getByRole("link", { name: "About us" }).click()
  await expect(page).toHaveURL(/#about$/)
  await expect(app(page).getByRole("heading", { name: event.title, level: 2 })).toBeVisible()
})

test("query mode uses a custom parameter name", async ({ page, api }) => {
  const { tag, event } = await createEvent(api)
  await openClient(page, { tags: [tag], navigation: { param: "events" } })
  await openEvent(page, event.title)
  await expect(page).toHaveURL(`${hostURL}/?events=/events/${event.name}`)
})

test("links open in a new tab with the right URL", async ({ page, api }) => {
  const { tag, event } = await createEvent(api)
  await openClient(page, { tags: [tag] })
  const link = app(page)
    .getByRole("article", { name: event.title })
    .getByRole("link", { name: event.title, exact: true })
  await expect(link).toHaveAttribute("href", `/?le=/events/${event.name}`)
})

test("hash mode stores the route in the fragment", async ({ page, api }) => {
  const { tag, event } = await createEvent(api)
  await openClient(page, { tags: [tag], navigation: { mode: "hash" } }, "/classes")
  await openEvent(page, event.title)
  await expect(page).toHaveURL(`${hostURL}/classes#/events/${event.name}`)

  await page.goBack()
  await expectList(page)
  await expect(page).toHaveURL(`${hostURL}/classes`)

  await page.goto(`${hostURL}/classes#/events/${event.name}`)
  await expect(app(page).getByRole("heading", { name: event.title, level: 2 })).toBeVisible()
})

test("path mode uses real paths under the base path", async ({ page, api }) => {
  const { tag, event } = await createEvent(api)
  await openClient(page, { tags: [tag], navigation: { mode: "path", basePath: "/classes/" } }, "/classes")
  await openEvent(page, event.title)
  await expect(page).toHaveURL(`${hostURL}/classes/events/${event.name}`)

  await page.reload()
  await expect(app(page).getByRole("heading", { name: event.title, level: 2 })).toBeVisible()

  await page.goBack()
  await expectList(page)
  await expect(page).toHaveURL(`${hostURL}/classes`)
})

test("memory mode never changes the URL", async ({ page, api }) => {
  const { tag, event } = await createEvent(api)
  await openClient(page, { tags: [tag], navigation: { mode: "memory" } }, "/classes")
  await openEvent(page, event.title)
  await expect(page).toHaveURL(`${hostURL}/classes`)

  await app(page).getByRole("link", { name: "All events" }).click()
  await expectList(page)
})

test("replace history updates the URL without adding history entries", async ({ page, api }) => {
  const { tag, event } = await createEvent(api)
  await page.goto(`${hostURL}/previous`)
  await openClient(page, { tags: [tag], navigation: { history: "replace" } }, "/classes")
  await openEvent(page, event.title)
  await expect(page).toHaveURL(`${hostURL}/classes?le=/events/${event.name}`)

  // Back leaves the page instead of returning to the list.
  await page.goBack()
  await expect(page).toHaveURL(`${hostURL}/previous`)
})

test("shows a not found page for unknown routes", async ({ page, api }) => {
  const { tag } = await createEvent(api)
  await openClient(page, { tags: [tag] }, "/?le=/nope")
  await expect(app(page).getByRole("heading", { name: "Page not found" })).toBeVisible()
  await openClient(page, { tags: [tag] }, "/?le=/events/does-not-exist")
  await expect(app(page).getByText("This event could not be found.")).toBeVisible()
})

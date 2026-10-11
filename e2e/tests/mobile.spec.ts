import { devices } from "@playwright/test"

import { expect, isoIn, test, unique } from "./fixtures"

test.use({ viewport: devices["iPhone 13"].viewport, hasTouch: true, isMobile: true })

test("pages fit a phone screen without horizontal page scrolling", async ({ page, api }) => {
  const name = unique("mobile")
  const event = await api.createEvent({ name, title: `Mobile ${name}`, dates: [isoIn(4)] })
  const member = await api.createMember(`${name}@example.com`)
  await api.register(member.uid, name, event.dates[0].uid)

  for (const path of ["/", "/events", `/events/${name}`, "/members", "/settings/users", "/events/_create"]) {
    await page.goto(path)
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    expect(overflow, `${path} scrolls horizontally`).toBeLessThanOrEqual(0)
  }

  await page.goto(`/events/${name}`)
  for (const action of ["Delete", "Archive"]) {
    await expect(page.getByRole("button", { name: action })).toBeInViewport()
  }
  await expect(page.getByRole("link", { name: "Edit", exact: true })).toBeInViewport()
  await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Settings" })).toBeVisible()
})

import { expect, formatDateTime, test, unique } from "./fixtures"

test("shows upcoming dates with registration counts and capacity", async ({ page, api }) => {
  const name = unique("dash")
  // Earlier than the dates other tests use, so it is among the eight dates the dashboard shows.
  const soon = new Date(Date.now() + 20 * 60_000)
  soon.setUTCSeconds(0, 0)
  const value = soon.toISOString().replace(/\.\d{3}Z$/, "Z")
  const event = await api.createEvent({ name, title: `Dashboard ${name}`, capacity: 1, dates: [value] })
  const member = await api.createMember(`${name}@example.com`)
  await api.register(member.uid, name, event.dates[0].uid)

  await page.goto("/")
  const card = page.locator("div.rounded-lg").filter({ has: page.getByRole("link", { name: `Dashboard ${name}` }) })
  await expect(card).toBeVisible()
  await expect(card).toContainText(formatDateTime(value))
  await expect(card).toContainText("1 / 1 registered")
  await expect(card.getByText("Full")).toBeVisible()
  await expect(card.getByText("Single date1")).toBeVisible()
  await expect(card.getByText("All dates0")).toBeVisible()

  await card.getByRole("link", { name: `Dashboard ${name}` }).click()
  await expect(page).toHaveURL(`/events/${name}`)
})

test("links to creating a new event", async ({ page }) => {
  await page.goto("/")
  await page.getByRole("link", { name: "New event" }).click()
  await expect(page).toHaveURL("/events/_create")
  await expect(page.getByRole("heading", { name: "New event" })).toBeVisible()
})

import { dialog, expect, formatDateTime, isoIn, test, unique } from "./fixtures"

test("shows event details, status and dates split into upcoming and past", async ({ page, api }) => {
  const name = unique("detail")
  const past = isoIn(-2)
  const upcoming = isoIn(4)
  await api.createEvent({
    name,
    title: `Detail ${name}`,
    description: "Line one\nLine two",
    capacity: 5,
    dates: [upcoming, past],
  })

  await page.goto(`/events/${name}`)
  await expect(page).toHaveTitle(`Detail ${name} · LightEvent`)
  await expect(page.getByRole("link", { name: "← Events" })).toHaveAttribute("href", "/events")
  const details = page.getByRole("region", { name: "Details" })
  await expect(details).toContainText("Visible")
  await expect(details).toContainText("Registration open")
  await expect(details).toContainText("Line one")
  await expect(details).toContainText("Line two")
  await expect(details).toContainText("5 per date")

  const dates = page.getByRole("region", { name: "Dates" })
  const upcomingList = dates.getByRole("list").first()
  const pastList = dates.getByRole("list").nth(1)
  await expect(dates.getByRole("heading", { name: "Upcoming" })).toBeVisible()
  await expect(dates.getByRole("heading", { name: "Past" })).toBeVisible()
  await expect(upcomingList).toContainText(formatDateTime(upcoming))
  await expect(upcomingList.getByRole("button", { name: "Cancel date" })).toBeVisible()
  await expect(pastList).toContainText(formatDateTime(past))
  await expect(pastList.getByRole("button", { name: "Cancel date" })).toHaveCount(0)

  await expect(page.getByRole("region", { name: "Registrations" })).toContainText("No registrations yet.")
})

test("cancels a date after confirmation", async ({ page, api }) => {
  const name = unique("canceldate")
  const value = isoIn(4)
  await api.createEvent({ name, dates: [value, isoIn(5)] })

  await page.goto(`/events/${name}`)
  const row = page.getByRole("listitem").filter({ hasText: formatDateTime(value) })
  await row.getByRole("button", { name: "Cancel date" }).click()
  await expect(dialog(page)).toContainText("Cancel this date?")
  // Escape dismisses the dialog without cancelling.
  await page.keyboard.press("Escape")
  await expect(dialog(page)).toBeHidden()
  await expect(row.getByText("Cancelled")).toHaveCount(0)

  await row.getByRole("button", { name: "Cancel date" }).click()
  await dialog(page).getByRole("button", { name: "Cancel date" }).click()
  await expect(page.getByText("Date cancelled")).toBeVisible()
  await expect(row.getByText("Cancelled")).toBeVisible()
  await expect(row.getByRole("button", { name: "Cancel date" })).toHaveCount(0)
})

test("archives and restores an event", async ({ page }) => {
  const name = unique("archive")
  await page.request.post("/rpc/lightevent.v1.LightEventService/CreateEvent", {
    data: { event: { name, title: `Archive ${name}`, dates: [{ value: isoIn(4) }] } },
  })

  await page.goto(`/events/${name}`)
  await page.getByRole("button", { name: "Archive" }).click()
  await expect(dialog(page)).toContainText("Archive event?")
  await dialog(page).getByRole("button", { name: "Archive" }).click()
  await expect(page.getByText("Event archived")).toBeVisible()
  await expect(page.getByRole("region", { name: "Details" })).toContainText("Archived")
  await expect(page.getByRole("link", { name: "Add registration" })).toHaveCount(0)

  await page.goto(`/events?filter=archived&q=${name}`)
  await expect(page.getByRole("link", { name: `Archive ${name}` })).toBeVisible()

  await page.getByRole("link", { name: `Archive ${name}` }).click()
  await page.getByRole("button", { name: "Restore" }).click()
  await expect(page.getByText("Event restored")).toBeVisible()
  await expect(page.getByRole("link", { name: "Add registration" })).toBeVisible()
})

test("deletes an event without registrations", async ({ page, api }) => {
  const name = unique("delete")
  await api.createEvent({ name })
  await page.goto(`/events/${name}`)
  await page.getByRole("button", { name: "Delete" }).click()
  await expect(dialog(page)).toContainText("Delete event?")
  await dialog(page).getByRole("button", { name: "Delete event" }).click()
  await expect(page).toHaveURL("/events")
  await expect(page.getByText("Event deleted")).toBeVisible()

  await page.goto(`/events/${name}`)
  await expect(page.getByText("The event you requested does not exist")).toBeVisible()
})

test("refuses to delete an event with registrations", async ({ page, api }) => {
  const name = unique("nodelete")
  await api.createEvent({ name })
  const member = await api.createMember(`${name}@example.com`)
  await api.register(member.uid, name)

  await page.goto(`/events/${name}`)
  await page.getByRole("button", { name: "Delete" }).click()
  await dialog(page).getByRole("button", { name: "Delete event" }).click()
  await expect(page.getByRole("alert")).toContainText("archive the event instead")
  await expect(page).toHaveURL(`/events/${name}`)
})

test("shows not found for an unknown event", async ({ page }) => {
  await page.goto(`/events/${unique("missing")}`)
  await expect(page.getByRole("heading", { name: "Not found" })).toBeVisible()
  await expect(page.getByText("The event you requested does not exist")).toBeVisible()
  await page.getByRole("link", { name: "Back to events" }).click()
  await expect(page).toHaveURL("/events")
})

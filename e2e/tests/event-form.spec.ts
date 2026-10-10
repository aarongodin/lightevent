import { dialog, expect, formatDateTime, inputValue, isoIn, test, unique } from "./fixtures"

test.describe("create event", () => {
  test("creates an event with several dates", async ({ page }) => {
    const suffix = unique("x")
    const title = `Morning Yoga ${suffix}`
    const first = isoIn(5, 9)
    const second = isoIn(12, 9)

    await page.goto("/events/_create")
    await page.getByLabel("Title").fill(title)
    // The name is suggested from the title.
    await expect(page.getByLabel("Name")).toHaveValue(`morning-yoga-${suffix}`)
    await page.getByLabel("Description").fill("A gentle flow class.\nBring a mat.")
    await page.getByLabel("Capacity per date").fill("3")
    await expect(page.getByLabel("Hidden")).not.toBeChecked()
    await expect(page.getByLabel("Registration closed")).not.toBeChecked()
    await expect(page.getByText("Times are in your time zone (America/Chicago).")).toBeVisible()
    await page.getByLabel("Date 1", { exact: true }).fill(inputValue(first))
    await page.getByRole("button", { name: "Add date" }).click()
    await page.getByLabel("Date 2", { exact: true }).fill(inputValue(second))
    await page.getByRole("button", { name: "Create event" }).click()

    await expect(page).toHaveURL(`/events/morning-yoga-${suffix}`)
    await expect(page.getByText("Event created")).toBeVisible()
    await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible()
    await expect(page.getByText(`morning-yoga-${suffix}`)).toBeVisible()
    await expect(page.getByText("A gentle flow class.")).toBeVisible()
    await expect(page.getByText("3 per date")).toBeVisible()
    await expect(page.getByText(formatDateTime(first))).toBeVisible()
    await expect(page.getByText(formatDateTime(second))).toBeVisible()
    await expect(page.getByText("0 / 3 registered")).toHaveCount(2)
  })

  test("keeps a hand-edited name when the title changes", async ({ page }) => {
    await page.goto("/events/_create")
    await page.getByLabel("Title").fill("First title")
    await page.getByLabel("Name").fill("custom-name")
    await page.getByLabel("Title").fill("Second title")
    await expect(page.getByLabel("Name")).toHaveValue("custom-name")
  })

  test("validates required fields and the name format", async ({ page }) => {
    await page.goto("/events/_create")
    await page.getByRole("button", { name: "Create event" }).click()
    await expect(page.getByText("Title is required")).toBeVisible()
    await expect(page.getByText("Name is required")).toBeVisible()
    await expect(page.getByText("Choose a date and time")).toBeVisible()
    await expect(page.getByLabel("Title")).toHaveAttribute("aria-invalid", "true")

    await page.getByLabel("Title").fill("Title")
    await page.getByLabel("Name").fill("Not Valid!")
    await page.getByRole("button", { name: "Create event" }).click()
    await expect(
      page.getByText("Use lowercase letters, numbers, and single dashes or underscores between them"),
    ).toBeVisible()
    await expect(page).toHaveURL("/events/_create")
  })

  test("only allows removing a date when more than one remains", async ({ page }) => {
    await page.goto("/events/_create")
    await expect(page.getByRole("button", { name: "Remove date 1" })).toBeDisabled()
    await page.getByRole("button", { name: "Add date" }).click()
    await expect(page.getByRole("button", { name: "Remove date 1" })).toBeEnabled()
    await page.getByRole("button", { name: "Remove date 2" }).click()
    await expect(page.getByLabel("Date 2", { exact: true })).toHaveCount(0)
  })

  test("shows server errors such as a duplicate name", async ({ page, api }) => {
    const name = unique("dup")
    await api.createEvent({ name })
    await page.goto("/events/_create")
    await page.getByLabel("Title").fill("Duplicate")
    await page.getByLabel("Name").fill(name)
    await page.getByLabel("Date 1", { exact: true }).fill(inputValue(isoIn(3)))
    await page.getByRole("button", { name: "Create event" }).click()
    await expect(page.getByRole("alert")).toContainText("Could not save the event")
    await expect(page.getByRole("alert")).toContainText("event already exists")
    await expect(page).toHaveURL("/events/_create")
  })

  test("cancel leaves immediately without changes and asks to discard changes", async ({ page }) => {
    await page.goto("/events/_create")
    await page.getByRole("button", { name: "Cancel" }).click()
    await expect(page).toHaveURL("/events")

    await page.goto("/events/_create")
    await page.getByLabel("Title").fill("Unsaved")
    await page.getByRole("button", { name: "Cancel" }).click()
    await expect(dialog(page)).toContainText("Discard changes?")
    await dialog(page).getByRole("button", { name: "Cancel" }).click()
    await expect(dialog(page)).toBeHidden()
    await expect(page.getByLabel("Title")).toHaveValue("Unsaved")

    await page.getByRole("button", { name: "Cancel" }).click()
    await dialog(page).getByRole("button", { name: "Discard" }).click()
    await expect(page).toHaveURL("/events")
  })
})

test.describe("edit event", () => {
  test("updates details and dates", async ({ page, api }) => {
    const name = unique("edit")
    const keep = isoIn(6)
    const drop = isoIn(7)
    const added = isoIn(9, 18, 30)
    await api.createEvent({ name, title: "Before", dates: [keep, drop] })

    await page.goto(`/events/${name}`)
    await page.getByRole("link", { name: "Edit", exact: true }).click()
    await expect(page).toHaveURL(`/events/${name}/_edit`)
    await expect(page.getByRole("heading", { level: 1, name: "Edit Before" })).toBeVisible()
    await expect(page.getByLabel("Name")).toBeDisabled()
    await expect(page.getByText("The name cannot be changed after the event is created.")).toBeVisible()
    await expect(page.getByLabel("Date 1", { exact: true })).toHaveValue(inputValue(keep))

    await page.getByLabel("Title").fill("After")
    await page.getByLabel("Description").fill("Updated description")
    await page.getByLabel("Capacity per date").fill("10")
    await page.getByLabel("Hidden").check()
    await page.getByLabel("Registration closed").check()
    await page.getByRole("button", { name: "Remove date 2" }).click()
    await page.getByRole("button", { name: "Add date" }).click()
    await page.getByLabel("Date 2", { exact: true }).fill(inputValue(added))
    await page.getByRole("button", { name: "Save changes" }).click()

    await expect(page).toHaveURL(`/events/${name}`)
    await expect(page.getByText("Event saved")).toBeVisible()
    await expect(page.getByRole("heading", { level: 1, name: "After" })).toBeVisible()
    await expect(page.getByText("Updated description")).toBeVisible()
    await expect(page.getByText("10 per date")).toBeVisible()
    await expect(page.getByText("Hidden", { exact: true })).toBeVisible()
    await expect(page.getByText("Registration closed")).toBeVisible()
    await expect(page.getByText(formatDateTime(keep))).toBeVisible()
    await expect(page.getByText(formatDateTime(added))).toBeVisible()
    await expect(page.getByText(formatDateTime(drop))).toHaveCount(0)
  })

  test("refuses to remove a date that has registrations", async ({ page, api }) => {
    const name = unique("busy")
    const event = await api.createEvent({ name, dates: [isoIn(6), isoIn(7)] })
    const member = await api.createMember(`${name}@example.com`)
    await api.register(member.uid, name, event.dates[0].uid)

    await page.goto(`/events/${name}/_edit`)
    await expect(page.getByText("1 registered")).toBeVisible()
    await page.getByRole("button", { name: "Remove date 1" }).click()
    await page.getByRole("button", { name: "Save changes" }).click()
    await expect(page.getByRole("alert")).toContainText("cannot be removed; cancel the date instead")
    await expect(page).toHaveURL(`/events/${name}/_edit`)
  })

  test("shows cancelled dates as read-only", async ({ page, api }) => {
    const name = unique("cancelled")
    const event = await api.createEvent({ name, dates: [isoIn(6), isoIn(7)] })
    await api.cancelDate(event.dates[0].uid)

    await page.goto(`/events/${name}/_edit`)
    await expect(page.getByLabel("Date 1", { exact: true })).toBeDisabled()
    await expect(page.getByText("Cancelled", { exact: true })).toBeVisible()
    await expect(page.getByRole("button", { name: "Remove date 1" })).toHaveCount(0)
  })

  test("shows not found for an unknown event", async ({ page }) => {
    await page.goto(`/events/${unique("missing")}/_edit`)
    await expect(page.getByText("The event you requested does not exist")).toBeVisible()
    await page.getByRole("link", { name: "Back to events" }).click()
    await expect(page).toHaveURL("/events")
  })
})

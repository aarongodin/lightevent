import { dialog, emailsTo, expect, formatDateTime, isoIn, test, unique } from "./fixtures"

test.describe("add registration", () => {
  test("registers a member for a single date and emails a confirmation", async ({ page, api }) => {
    const name = unique("reg")
    const value = isoIn(4)
    await api.createEvent({ name, title: `Reg ${name}`, capacity: 5, dates: [value, isoIn(5)] })
    const email = `${name}@example.com`
    await api.createMember(email, "Sam", "Lee")

    await page.goto(`/events/${name}`)
    await page.getByRole("link", { name: "Add registration" }).click()
    await expect(page).toHaveURL(`/events/${name}/registrations/_create`)
    await expect(page.getByRole("link", { name: `← Reg ${name}` })).toBeVisible()

    // Pick the member with the keyboard.
    const combobox = page.getByRole("combobox", { name: "Member" })
    await combobox.fill(email)
    await expect(page.getByRole("option", { name: /Sam Lee/ })).toBeVisible()
    await combobox.press("ArrowDown")
    await combobox.press("Enter")
    await expect(page.getByText("Sam Lee")).toBeVisible()

    await expect(page.getByLabel("A single date")).toBeChecked()
    const dateSelect = page.getByRole("combobox", { name: "Date", exact: true })
    await dateSelect.selectOption({ index: 1 })
    await expect(dateSelect.locator("option:checked")).toContainText(formatDateTime(value))
    await expect(dateSelect.locator("option:checked")).toContainText("0 / 5 registered")
    await expect(page.getByLabel("Email a confirmation to the member")).toBeChecked()
    await page.getByRole("button", { name: "Add registration" }).click()

    await expect(page).toHaveURL(`/events/${name}`)
    await expect(page.getByText("Registration added")).toBeVisible()
    const row = page.getByRole("row").filter({ hasText: email })
    await expect(row).toContainText("Sam Lee")
    await expect(row).toContainText("Single date")
    await expect(row).toContainText(formatDateTime(value))
    await expect(row.getByText(/^[0-9A-Z]{4}-[0-9A-Z]{4}$/)).toBeVisible()
    await expect(page.getByRole("listitem").filter({ hasText: formatDateTime(value) })).toContainText(
      "1 / 5 registered",
    )

    await expect.poll(() => emailsTo(email).map((e) => e.subject)).toContain(`Registration confirmed: Reg ${name}`)
    const confirmation = emailsTo(email).find((e) => e.subject === `Registration confirmed: Reg ${name}`)
    expect(confirmation?.text).toContain("Hi Sam Lee")
  })

  test("registers a member for all dates without emailing them", async ({ page, api }) => {
    const name = unique("series")
    await api.createEvent({ name, dates: [isoIn(4), isoIn(5)] })
    const email = `${name}@example.com`
    await api.createMember(email)

    await page.goto(`/events/${name}/registrations/_create`)
    await page.getByRole("combobox", { name: "Member" }).fill(email)
    await page.getByRole("option", { name: email }).click()
    await page.getByLabel("All dates of this event").check()
    await expect(page.getByRole("combobox", { name: "Date", exact: true })).toHaveCount(0)
    await page.getByLabel("Email a confirmation to the member").uncheck()
    await page.getByRole("button", { name: "Add registration" }).click()

    await expect(page).toHaveURL(`/events/${name}`)
    const row = page.getByRole("row").filter({ hasText: email })
    await expect(row).toContainText("All dates")
    await expect(page.getByText("1 registered")).toHaveCount(2)
    // Give a background email time to be written if one were sent.
    await page.waitForTimeout(500)
    expect(emailsTo(email)).toEqual([])
  })

  test("validates the form", async ({ page, api }) => {
    const name = unique("validate")
    await api.createEvent({ name })
    await page.goto(`/events/${name}/registrations/_create`)
    await page.getByRole("button", { name: "Add registration" }).click()
    await expect(page.getByText("Choose a member")).toBeVisible()
    await expect(page.getByText("Choose a date", { exact: true })).toBeVisible()

    await page.getByRole("combobox", { name: "Member" }).fill(unique("nomatch"))
    await expect(page.getByRole("listbox")).toContainText("No members found.")
  })

  test("lets the chosen member be changed", async ({ page, api }) => {
    const name = unique("change")
    await api.createEvent({ name })
    const email = `${name}@example.com`
    await api.createMember(email)
    await page.goto(`/events/${name}/registrations/_create`)
    await page.getByRole("combobox", { name: "Member" }).fill(email)
    await page.getByRole("option", { name: email }).click()
    await page.getByRole("button", { name: "Choose a different member" }).click()
    await expect(page.getByRole("combobox", { name: "Member" })).toHaveValue("")
  })

  test("disables full dates and reports capacity and duplicate errors", async ({ page, api }) => {
    const name = unique("full")
    const fullDate = isoIn(4)
    const event = await api.createEvent({ name, capacity: 1, dates: [fullDate, isoIn(5)] })
    const first = await api.createMember(`${name}-a@example.com`)
    await api.register(first.uid, name, event.dates[0].uid)
    const second = `${name}-b@example.com`
    await api.createMember(second)

    await page.goto(`/events/${name}/registrations/_create`)
    const fullOption = page.getByRole("combobox", { name: "Date", exact: true }).locator("option").nth(1)
    await expect(fullOption).toContainText(formatDateTime(fullDate))
    await expect(fullOption).toContainText("1 / 1 registered (full)")
    await expect(fullOption).toBeDisabled()

    await page.getByRole("combobox", { name: "Member" }).fill(second)
    await page.getByRole("option", { name: second }).click()
    await page.getByLabel("All dates of this event").check()
    await page.getByRole("button", { name: "Add registration" }).click()
    await expect(page.getByRole("alert")).toContainText("one or more dates of this event are full")

    // The first member is already registered for the full date's event.
    await page.getByRole("button", { name: "Choose a different member" }).click()
    await page.getByRole("combobox", { name: "Member" }).fill(first.email)
    await page.getByRole("option", { name: first.email }).click()
    await page.getByLabel("A single date").check()
    await page.getByRole("combobox", { name: "Date", exact: true }).selectOption({ index: 2 })
    await page.getByLabel("All dates of this event").check()
    await page.getByRole("button", { name: "Add registration" }).click()
    await expect(page.getByRole("alert")).toContainText("already registered")
  })
})

test.describe("cancel registration", () => {
  test("cancels from the event page and emails the member", async ({ page, api }) => {
    const name = unique("cancelreg")
    const event = await api.createEvent({ name, title: `Cancel ${name}` })
    const email = `${name}@example.com`
    const member = await api.createMember(email)
    await api.register(member.uid, name, event.dates[0].uid)

    await page.goto(`/events/${name}`)
    const row = page.getByRole("row").filter({ hasText: email })
    await row.getByRole("button", { name: "Cancel" }).click()
    await expect(dialog(page)).toContainText("Cancel registration?")
    await expect(dialog(page).getByLabel("Email the member about the cancellation")).toBeChecked()
    await dialog(page).getByRole("button", { name: "Cancel registration" }).click()

    await expect(page.getByText("Registration cancelled")).toBeVisible()
    await expect(row).toHaveCount(0)
    await expect(page.getByText("No registrations yet.")).toBeVisible()
    await expect.poll(() => emailsTo(email).map((e) => e.subject)).toContain(`Registration cancelled: Cancel ${name}`)
  })

  test("cancels without emailing when the option is unchecked", async ({ page, api }) => {
    const name = unique("quietcancel")
    await api.createEvent({ name })
    const email = `${name}@example.com`
    const member = await api.createMember(email)
    await api.register(member.uid, name)

    await page.goto(`/events/${name}`)
    await page.getByRole("row").filter({ hasText: email }).getByRole("button", { name: "Cancel" }).click()
    await dialog(page).getByLabel("Email the member about the cancellation").uncheck()
    await dialog(page).getByRole("button", { name: "Cancel registration" }).click()
    await expect(page.getByText("No registrations yet.")).toBeVisible()
    await page.waitForTimeout(500)
    expect(emailsTo(email)).toEqual([])
  })
})

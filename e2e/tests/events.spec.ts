import { expect, isoIn, test, unique } from "./fixtures"

test.describe("events list", () => {
  test("filters upcoming, past, archived and all events", async ({ page, api }) => {
    const prefix = unique("filter")
    await api.createEvent({ name: `${prefix}-upcoming`, title: `${prefix} Upcoming` })
    await api.createEvent({ name: `${prefix}-hidden`, title: `${prefix} Hidden`, hidden: true, closed: true })
    await api.createEvent({ name: `${prefix}-past`, title: `${prefix} Past`, dates: [isoIn(-3)] })
    await api.createEvent({ name: `${prefix}-archived`, title: `${prefix} Archived` })
    await api.archiveEvent(`${prefix}-archived`)

    await page.goto(`/events?q=${prefix}`)
    const rows = page.getByRole("row")
    const filters = page.getByRole("navigation", { name: "Event filter" })
    // Retrying assertion: while the next filter loads, the previous results stay on screen.
    const titles = page.locator("tbody tr td:first-child a")

    await expect(filters.getByRole("button", { name: "Upcoming" })).toHaveAttribute("aria-pressed", "true")
    // Ordered by next date, then most recently created.
    await expect(titles).toHaveText([`${prefix} Hidden`, `${prefix} Upcoming`])

    const hiddenRow = rows.filter({ hasText: `${prefix} Hidden` })
    await expect(hiddenRow.getByText("Hidden", { exact: true })).toBeVisible()
    await expect(hiddenRow.getByText("Registration closed")).toBeVisible()
    const upcomingRow = rows.filter({ hasText: `${prefix} Upcoming` })
    await expect(upcomingRow.getByText("Visible")).toBeVisible()
    await expect(upcomingRow.getByText("Registration open")).toBeVisible()
    await expect(upcomingRow.getByText("Unlimited")).toBeVisible()

    await filters.getByRole("button", { name: "Past" }).click()
    await expect(page).toHaveURL(/filter=past/)
    await expect(titles).toHaveText([`${prefix} Past`])
    await expect(rows.filter({ hasText: `${prefix} Past` }).getByText("Past", { exact: true })).toBeVisible()

    await filters.getByRole("button", { name: "Archived" }).click()
    await expect(titles).toHaveText([`${prefix} Archived`])
    await expect(rows.filter({ hasText: `${prefix} Archived` }).getByText("Archived", { exact: true })).toBeVisible()

    await filters.getByRole("button", { name: "All" }).click()
    // Archived events are excluded; past events come after upcoming ones.
    await expect(titles).toHaveText([`${prefix} Hidden`, `${prefix} Upcoming`, `${prefix} Past`])
  })

  test("searches by name or title and keeps the search in the URL", async ({ page, api }) => {
    const prefix = unique("search")
    await api.createEvent({ name: `${prefix}-yoga`, title: "Sunrise Yoga" })
    await api.createEvent({ name: `${prefix}-run`, title: "Evening Run" })

    await page.goto("/events")
    await page.getByRole("searchbox", { name: "Search events" }).fill(`${prefix}-yo`)
    await expect(page).toHaveURL(new RegExp(`q=${prefix}-yo`))
    await expect(page.getByRole("link", { name: "Sunrise Yoga" })).toBeVisible()
    await expect(page.getByRole("link", { name: "Evening Run" })).toHaveCount(0)

    await page.reload()
    await expect(page.getByRole("searchbox", { name: "Search events" })).toHaveValue(`${prefix}-yo`)
    await expect(page.getByRole("link", { name: "Sunrise Yoga" })).toBeVisible()

    await page.getByRole("searchbox", { name: "Search events" }).fill(`${prefix}-nothing`)
    await expect(page.getByText(`No events match “${prefix}-nothing”.`)).toBeVisible()
  })

  test("paginates results", async ({ page, api }) => {
    const prefix = unique("page")
    await Promise.all(
      Array.from({ length: 26 }, (_, i) =>
        api.createEvent({ name: `${prefix}-${String(i).padStart(2, "0")}`, dates: [isoIn(40 + i)] }),
      ),
    )
    await page.goto(`/events?q=${prefix}`)
    const pagination = page.getByRole("navigation", { name: "Pagination" })
    await expect(pagination).toContainText("Showing 1–25 of 26")
    await expect(page.locator("tbody tr")).toHaveCount(25)
    await expect(pagination.getByRole("button", { name: "Previous" })).toBeDisabled()

    await pagination.getByRole("button", { name: "Next" }).click()
    await expect(page).toHaveURL(/offset=25/)
    await expect(pagination).toContainText("Showing 26–26 of 26")
    await expect(page.locator("tbody tr")).toHaveCount(1)
    await expect(page.getByRole("link", { name: `${prefix}-25` })).toBeVisible()
    await expect(pagination.getByRole("button", { name: "Next" })).toBeDisabled()

    await pagination.getByRole("button", { name: "Previous" }).click()
    await expect(pagination).toContainText("Showing 1–25 of 26")
  })

  test("opens an event from the list", async ({ page, api }) => {
    const name = unique("open")
    await api.createEvent({ name, title: `Open ${name}` })
    await page.goto(`/events?q=${name}`)
    await page.getByRole("link", { name: `Open ${name}` }).click()
    await expect(page).toHaveURL(`/events/${name}`)
    await expect(page.getByRole("heading", { level: 1, name: `Open ${name}` })).toBeVisible()
  })
})

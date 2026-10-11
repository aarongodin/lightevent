import { dialog, expect, formatDateTime, isoIn, test, unique } from "./fixtures"

test.describe("members", () => {
  test("creates a member", async ({ page }) => {
    const email = `${unique("new")}@example.com`
    await page.goto("/members")
    await page.getByRole("link", { name: "New member" }).click()
    await expect(page).toHaveURL("/members/_create")

    await page.getByRole("button", { name: "Create member" }).click()
    await expect(page.getByText("Email is required")).toBeVisible()
    await page.getByLabel("Email address").fill("not-an-email")
    await page.getByRole("button", { name: "Create member" }).click()
    await expect(page.getByText("Enter a valid email address")).toBeVisible()

    await page.getByLabel("Email address").fill(email.toUpperCase())
    await page.getByLabel("First name").fill("Ada")
    await page.getByLabel("Last name").fill("Lovelace")
    await page.getByRole("button", { name: "Create member" }).click()

    await expect(page).toHaveURL(/\/members\/[0-9a-f-]{36}$/)
    await expect(page.getByText("Member created")).toBeVisible()
    await expect(page.getByRole("heading", { level: 1, name: "Ada Lovelace" })).toBeVisible()
    const details = page.getByRole("region", { name: "Details" })
    await expect(details).toContainText(email) // stored in lower case
    await expect(details).toContainText("Verified")
    await expect(details).toContainText("Yes")
    await expect(page.getByText("This member has no registrations.")).toBeVisible()
  })

  test("reports a duplicate email", async ({ page, api }) => {
    const email = `${unique("dup")}@example.com`
    await api.createMember(email)
    await page.goto("/members/_create")
    await page.getByLabel("Email address").fill(email)
    await page.getByRole("button", { name: "Create member" }).click()
    await expect(page.getByRole("alert")).toContainText("member already exists")
  })

  test("searches and paginates members", async ({ page, api }) => {
    const prefix = unique("bulk")
    await Promise.all(
      Array.from({ length: 51 }, (_, i) => api.createMember(`${prefix}-${String(i).padStart(2, "0")}@example.com`)),
    )
    await api.createMember(`${unique("other")}@example.com`, `Zed${prefix}`, "Quinn")

    await page.goto("/members")
    await page.getByRole("searchbox", { name: "Search members" }).fill(prefix)
    await expect(page).toHaveURL(new RegExp(`q=${prefix}`))
    const pagination = page.getByRole("navigation", { name: "Pagination" })
    await expect(pagination).toContainText("Showing 1–50 of 52")
    await pagination.getByRole("button", { name: "Next" }).click()
    await expect(pagination).toContainText("Showing 51–52 of 52")

    // Names are searched too, case-insensitively.
    await page.getByRole("searchbox", { name: "Search members" }).fill(`zed${prefix}`)
    await expect(page.locator("tbody tr")).toHaveCount(1)
    await expect(page.locator("tbody tr")).toContainText("Zed")
    await expect(page.locator("tbody tr")).toContainText("Verified")

    await page.getByRole("searchbox", { name: "Search members" }).fill(unique("none"))
    await expect(page.getByText(/No members match/)).toBeVisible()
  })

  test("edits a member", async ({ page, api }) => {
    const email = `${unique("edit")}@example.com`
    const newEmail = `${unique("edited")}@example.com`
    const member = await api.createMember(email, "Old", "Name")

    await page.goto(`/members/${member.uid}`)
    await page.getByRole("link", { name: "Edit", exact: true }).click()
    await expect(page).toHaveURL(`/members/${member.uid}/_edit`)
    await expect(page.getByLabel("Email address")).toHaveValue(email)

    // Cancel without changes leaves immediately.
    await page.getByRole("button", { name: "Cancel" }).click()
    await expect(page).toHaveURL(`/members/${member.uid}`)

    await page.getByRole("link", { name: "Edit", exact: true }).click()
    await page.getByLabel("Email address").fill(newEmail)
    await page.getByLabel("First name").fill("New")
    await page.getByLabel("Last name").fill("")
    await page.getByRole("button", { name: "Save changes" }).click()
    await expect(page).toHaveURL(`/members/${member.uid}`)
    await expect(page.getByText("Member saved")).toBeVisible()
    await expect(page.getByRole("heading", { level: 1, name: "New" })).toBeVisible()
    await expect(page.getByRole("region", { name: "Details" })).toContainText(newEmail)
  })

  test("lists and cancels a member's registrations", async ({ page, api }) => {
    const name = unique("memberreg")
    const value = isoIn(4)
    const event = await api.createEvent({ name, title: `Member Reg ${name}`, dates: [value] })
    const member = await api.createMember(`${name}@example.com`)
    await api.register(member.uid, name, event.dates[0].uid)

    await page.goto(`/members/${member.uid}`)
    const row = page.getByRole("row").filter({ hasText: `Member Reg ${name}` })
    await expect(row).toContainText("Single date")
    await expect(row).toContainText(formatDateTime(value))

    await row.getByRole("button", { name: "Cancel" }).click()
    await dialog(page).getByRole("button", { name: "Cancel registration" }).click()
    await expect(page.getByText("This member has no registrations.")).toBeVisible()

    await api.register(member.uid, name)
    await page.reload()
    await page.getByRole("link", { name: `Member Reg ${name}` }).click()
    await expect(page).toHaveURL(`/events/${name}`)
  })

  test("deletes a member and their registrations", async ({ page, api }) => {
    const name = unique("delmember")
    await api.createEvent({ name })
    const member = await api.createMember(`${name}@example.com`)
    await api.register(member.uid, name)

    await page.goto(`/members/${member.uid}`)
    await page.getByRole("button", { name: "Delete" }).click()
    await expect(dialog(page)).toContainText("all of their registrations will be permanently deleted")
    await dialog(page).getByRole("button", { name: "Delete member" }).click()
    await expect(page).toHaveURL("/members")
    await expect(page.getByText("Member deleted")).toBeVisible()

    await page.goto(`/events/${name}`)
    await expect(page.getByText("No registrations yet.")).toBeVisible()
    await page.goto(`/members/${member.uid}`)
    await expect(page.getByText("The member you requested does not exist")).toBeVisible()
  })
})

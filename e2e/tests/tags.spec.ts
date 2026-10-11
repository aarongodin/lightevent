import { hostURL } from "../playwright.config"
import { app, test as clientTest, openClient } from "./client-fixtures"
import { dialog, expect, test, unique } from "./fixtures"

test("creates, renames and deletes a tag", async ({ page, api }) => {
  const suffix = unique("t")
  await page.goto("/settings/tags")
  await page.getByRole("button", { name: "New tag" }).click()
  await dialog(page).getByLabel("Label").fill(`Vinyasa ${suffix}`)
  // The name is suggested from the label.
  await expect(dialog(page).getByLabel("Name")).toHaveValue(`vinyasa-${suffix}`)
  await dialog(page).getByRole("button", { name: "Create tag" }).click()
  await expect(page.getByText("Tag created")).toBeVisible()
  const row = page.getByRole("row", { name: new RegExp(`vinyasa-${suffix}`) })
  await expect(row).toContainText(`Vinyasa ${suffix}`)

  // Duplicate names are reported.
  await page.getByRole("button", { name: "New tag" }).click()
  await dialog(page).getByLabel("Label").fill(`Vinyasa ${suffix}`)
  await dialog(page).getByRole("button", { name: "Create tag" }).click()
  await expect(dialog(page).getByText("tag already exists")).toBeVisible()
  await dialog(page).getByRole("button", { name: "Cancel" }).click()

  await row.getByRole("button", { name: `Edit Vinyasa ${suffix}` }).click()
  await expect(dialog(page).getByLabel("Name")).toBeDisabled()
  await dialog(page).getByLabel("Label").fill(`Vinyasa Flow ${suffix}`)
  await dialog(page).getByRole("button", { name: "Save tag" }).click()
  await expect(row).toContainText(`Vinyasa Flow ${suffix}`)

  const event = await api.createEvent({ name: unique("tagged"), tags: [`vinyasa-${suffix}`] })
  await page.reload()
  await expect(row.getByRole("cell").nth(2)).toHaveText("1")
  await row.getByRole("button", { name: `Delete Vinyasa Flow ${suffix}` }).click()
  await expect(dialog(page)).toContainText("will be removed from 1 event")
  await dialog(page).getByRole("button", { name: "Delete tag" }).click()
  await expect(page.getByText("Tag deleted")).toBeVisible()
  await expect(row).toHaveCount(0)

  const { event: after } = await api.call<{ event: { tags?: string[] } }>("GetEvent", { name: event.name })
  expect(after.tags ?? []).toEqual([])
})

test("assigns tags to an event", async ({ page, api }) => {
  const [a, b] = [unique("a"), unique("b")]
  await api.createTag(a, `Label ${a}`)
  await api.createTag(b, `Label ${b}`)
  const event = await api.createEvent({ name: unique("ev"), tags: [a] })

  await page.goto(`/events/${event.name}/_edit`)
  const tags = page.getByRole("group", { name: "Tags" })
  await expect(tags.getByLabel(`Label ${a}`)).toBeChecked()
  await tags.getByLabel(`Label ${a}`).uncheck()
  await tags.getByLabel(`Label ${b}`).check()
  await page.getByRole("button", { name: "Save changes" }).click()
  await expect(page.getByText("Event saved")).toBeVisible()
  await expect(page.getByText(`Label ${b}`)).toBeVisible()
  await expect(page.getByText(`Label ${a}`)).toHaveCount(0)
})

clientTest.describe("client app settings", () => {
  // The settings apply to every test; only this test changes them.
  clientTest("saves settings that change the client app", async ({ page, api }) => {
    await page.goto("/settings/client")
    await expect(page.getByText('<script src="http://127.0.0.1:')).toBeVisible()
    const origins = page.getByLabel("Website origins")

    await origins.fill("not an origin")
    await page.getByRole("button", { name: "Save settings" }).click()
    await expect(page.getByText("must be an origin such as https://www.example.com")).toBeVisible()

    await origins.fill(`https://www.example.com/\n${hostURL}`)
    await page.getByLabel("Show remaining spots").check()
    await page.getByRole("button", { name: "Save settings" }).click()
    await expect(page.getByText("Settings saved")).toBeVisible()
    await page.reload()
    await expect(origins).toHaveValue(`https://www.example.com\n${hostURL}`)
    await expect(page.getByLabel("Show remaining spots")).toBeChecked()

    const tag = unique("spots")
    await api.createTag(tag, tag)
    const event = await api.createEvent({ name: unique("spots"), title: `Spots ${tag}`, capacity: 5, tags: [tag] })
    await openClient(page, { tags: [tag] })
    await expect(app(page).getByRole("article", { name: event.title }).getByText("5 spots left")).toBeVisible()
  })
})

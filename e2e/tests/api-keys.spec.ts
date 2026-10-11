import { dialog, expect, test, unique } from "./fixtures"

test("creates an API key, shows it once, and deletes it", async ({ page, playwright, baseURL }) => {
  const name = unique("key")
  await page.goto("/settings/api-keys")
  await page.getByRole("button", { name: "New API key" }).click()
  await expect(dialog(page).getByRole("button", { name: "Create key" })).toBeDisabled()
  await dialog(page).getByLabel("Name").fill(name)
  await dialog(page).getByRole("button", { name: "Create key" }).click()

  await expect(dialog(page)).toContainText("API key created")
  await expect(dialog(page)).toContainText("It will not be shown again.")
  const secret = (await dialog(page).locator("code").first().textContent()) ?? ""
  expect(secret).toMatch(/^le_[A-Za-z0-9_-]{43}$/)
  await dialog(page).getByRole("button", { name: "Done" }).click()
  await expect(dialog(page)).toBeHidden()

  const row = page.getByRole("row").filter({ hasText: name })
  await expect(row).toContainText(`${secret.slice(0, 9)}…`)
  await expect(row).toContainText("Never")
  await expect(page.getByText(secret)).toHaveCount(0)

  // The key authenticates API requests.
  const api = await playwright.request.newContext({ baseURL })
  const ping = () =>
    api.post("/rpc/lightevent.v1.LightEventService/Ping", { data: {}, headers: { Authorization: `Bearer ${secret}` } })
  const resp = await ping()
  expect(resp.status()).toBe(200)
  expect(await resp.json()).toMatchObject({ scheme: "api-key", displayName: name })

  await page.reload()
  await expect(row).not.toContainText("Never")

  await row.getByRole("button", { name: "Delete" }).click()
  await expect(dialog(page)).toContainText(`Integrations using “${name}” will stop working immediately.`)
  await dialog(page).getByRole("button", { name: "Delete key" }).click()
  await expect(page.getByText("API key deleted")).toBeVisible()
  await expect(row).toHaveCount(0)
  expect((await ping()).status()).toBe(401)
  await api.dispose()
})

test("reports a duplicate API key name", async ({ page, api }) => {
  const name = unique("dupkey")
  await api.call("CreateAPIKey", { name })
  await page.goto("/settings/api-keys")
  await page.getByRole("button", { name: "New API key" }).click()
  await dialog(page).getByLabel("Name").fill(name)
  await dialog(page).getByRole("button", { name: "Create key" }).click()
  await expect(dialog(page).getByRole("alert")).toContainText("API key already exists")
  await dialog(page).getByRole("button", { name: "Cancel" }).click()
  await expect(dialog(page)).toBeHidden()
})

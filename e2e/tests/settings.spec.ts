import { expect, test } from "./fixtures"

test("redirects to application settings and shows the settings tabs", async ({ page }) => {
  await page.goto("/settings")
  await expect(page).toHaveURL("/settings/application")
  const tabs = page.getByRole("navigation", { name: "Settings" })
  for (const [tab, path] of [
    ["Your account", "/settings/account"],
    ["Users", "/settings/users"],
    ["API keys", "/settings/api-keys"],
    ["Application", "/settings/application"],
  ]) {
    await tabs.getByRole("link", { name: tab }).click()
    await expect(page).toHaveURL(path)
    await expect(tabs.getByRole("link", { name: tab })).toHaveAttribute("aria-current", "page")
  }
})

test("saves application settings", async ({ page }) => {
  await page.goto("/settings/application")
  const save = page.getByRole("button", { name: "Save settings" })
  await expect(save).toBeDisabled()

  await page.getByLabel("Support email").fill("not-an-email")
  await save.click()
  await expect(page.getByText("Enter a valid email address")).toBeVisible()

  await page.getByLabel("Organization name").fill("Sunrise Studio")
  await page.getByLabel("Support email").fill("Help@Sunrise.example")
  await page.getByLabel("Time zone").selectOption("America/Chicago")
  await save.click()
  await expect(page.getByText("Settings saved")).toBeVisible()
  await expect(save).toBeDisabled()

  await page.reload()
  await expect(page.getByLabel("Organization name")).toHaveValue("Sunrise Studio")
  await expect(page.getByLabel("Support email")).toHaveValue("help@sunrise.example")
  await expect(page.getByLabel("Time zone")).toHaveValue("America/Chicago")
})

import { expect, test } from "./fixtures"

test("main navigation links to each section and marks the current page", async ({ page }) => {
  await page.goto("/")
  const nav = page.getByRole("navigation", { name: "Main" })
  for (const [link, heading, path] of [
    ["Events", "Events", "/events"],
    ["Members", "Members", "/members"],
    ["Settings", "Settings", "/settings/application"],
    ["Dashboard", "Dashboard", "/"],
  ]) {
    await nav.getByRole("link", { name: link }).click()
    await expect(page).toHaveURL(path)
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible()
    await expect(nav.getByRole("link", { name: link })).toHaveAttribute("aria-current", "page")
    await expect(page).toHaveTitle(`${heading} · LightEvent`)
  }
})

test("unknown routes show a not found page inside the layout", async ({ page }) => {
  await page.goto("/does/not/exist")
  await expect(page.getByRole("heading", { name: "Not found" })).toBeVisible()
  await expect(page.getByText("The page you requested does not exist")).toBeVisible()
  // Navigation stays available.
  await expect(page.getByRole("navigation", { name: "Main" })).toBeVisible()
  await page.getByRole("link", { name: "Go to the dashboard" }).click()
  await expect(page).toHaveURL("/")
})

test("a skip link jumps to the main content", async ({ page }) => {
  await page.goto("/events")
  await page.keyboard.press("Tab")
  const skip = page.getByRole("link", { name: "Skip to content" })
  await expect(skip).toBeFocused()
  await expect(skip).toBeVisible()
})

test("the admin UI is served with a strict content security policy", async ({ page }) => {
  const errors: string[] = []
  page.on("console", (msg) => {
    if (msg.type() === "error" && msg.text().includes("Content Security Policy")) {
      errors.push(msg.text())
    }
  })
  const resp = await page.goto("/events")
  expect(resp?.headers()["content-security-policy"]).toContain("script-src 'self'")
  await expect(page.getByRole("heading", { name: "Events" })).toBeVisible()
  expect(errors).toEqual([])
})

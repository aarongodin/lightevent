import { ADMIN_PASSWORD, ADMIN_USERNAME, expect, signedOut, signIn, test, unique } from "./fixtures"

test.use(signedOut)

test.describe("sign in", () => {
  test("redirects to the login page when signed out", async ({ page }) => {
    await page.goto("/events")
    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible()
    await expect(page).toHaveTitle(/Sign in/)
  })

  test("shows an error for wrong credentials", async ({ page, context }) => {
    await signIn(page, ADMIN_USERNAME, "not-the-password")
    await expect(page).toHaveURL(/\/login\?error=invalid$/)
    await expect(page.getByRole("alert")).toHaveText("Invalid username or password.")
    expect(await context.cookies()).toHaveLength(0)
  })

  test("does not render arbitrary error text from the URL", async ({ page }) => {
    await page.goto("/login?error=<b>you have been hacked</b>")
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible()
    await expect(page.getByRole("alert")).toHaveCount(0)
    await expect(page.getByText("hacked")).toHaveCount(0)
  })

  test("signs in, skips the login page while signed in, and signs out", async ({ page }) => {
    await signIn(page, ADMIN_USERNAME, ADMIN_PASSWORD)
    await expect(page).toHaveURL("/")
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible()
    await expect(page.getByText(ADMIN_USERNAME, { exact: true })).toBeVisible()

    await page.goto("/login")
    await expect(page).toHaveURL("/")

    await page.getByRole("button", { name: "Sign out" }).click()
    await expect(page).toHaveURL(/\/login$/)
    await page.goto("/members")
    await expect(page).toHaveURL(/\/login$/)
  })

  test("rate limits repeated failed sign-ins for a username", async ({ page }) => {
    const username = unique("nobody")
    for (let i = 0; i < 10; i++) {
      await signIn(page, username, "wrong-password")
      await expect(page.getByRole("alert")).toHaveText("Invalid username or password.")
    }
    await signIn(page, username, "wrong-password")
    await expect(page.getByRole("alert")).toContainText("Too many sign-in attempts")
  })
})

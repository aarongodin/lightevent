import { test as setup } from "@playwright/test"

import { adminStorageState } from "../playwright.config"
import { ADMIN_PASSWORD, ADMIN_USERNAME, expect, signIn } from "./fixtures"

// Signs in once and saves the session for the other tests.
setup("sign in as the bootstrap admin", async ({ page }) => {
  await signIn(page, ADMIN_USERNAME, ADMIN_PASSWORD)
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible()
  await page.context().storageState({ path: adminStorageState })
})

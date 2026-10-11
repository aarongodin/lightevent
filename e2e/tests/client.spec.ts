import { baseURL, hostURL } from "../playwright.config"
import { app, openClient, signIn, test } from "./client-fixtures"
import { emailsTo, expect, isoIn, unique } from "./fixtures"

test("serves the client bundle", async ({ request }) => {
  const resp = await request.get("/client/lightevent-client.js")
  expect(resp.ok()).toBe(true)
  expect(resp.headers()["content-type"]).toContain("text/javascript")
  expect((await resp.body()).length).toBeLessThan(100 * 1024)
})

test("lists upcoming dates organized by event", async ({ page, api }) => {
  const tag = unique("tag")
  await api.createTag(tag, `Tag ${tag}`)
  const yoga = await api.createEvent({
    name: unique("yoga"),
    title: `Yoga ${tag}`,
    description: "Morning flow.",
    dates: [isoIn(-2), isoIn(3), isoIn(10), isoIn(17)],
    tags: [tag],
  })
  await api.cancelDate(yoga.dates[3].uid)
  const pottery = await api.createEvent({
    name: unique("pottery"),
    title: `Pottery ${tag}`,
    dates: [isoIn(5)],
    tags: [tag],
  })
  await api.createEvent({ name: unique("hidden"), title: `Hidden ${tag}`, hidden: true, tags: [tag] })

  await openClient(page, { tags: [tag] })
  await expect(app(page).getByRole("heading", { name: "Upcoming events" })).toBeVisible()

  const yogaCard = app(page).getByRole("article", { name: yoga.title })
  await expect(yogaCard.getByText("Morning flow.")).toBeVisible()
  await expect(yogaCard.getByText(`Tag ${tag}`)).toBeVisible()
  // Past dates are not listed, and cancelled dates cannot be registered for.
  await expect(yogaCard.locator(".le-date-row")).toHaveCount(3)
  await expect(yogaCard.getByRole("link", { name: /^Register for .* on / })).toHaveCount(2)
  await expect(yogaCard.locator('[data-status="cancelled"]')).toContainText("Cancelled")
  await expect(yogaCard.getByRole("link", { name: "Register for all dates" })).toBeVisible()

  await expect(app(page).getByRole("article", { name: pottery.title })).toBeVisible()
  await expect(app(page).getByRole("article", { name: `Hidden ${tag}` })).toHaveCount(0)

  // The host page's styles do not leak into the app.
  await expect(yogaCard.getByRole("link", { name: /^Register for .* on / }).first()).not.toHaveCSS(
    "color",
    "rgb(255, 0, 0)",
  )
})

test("filters events by tag and keeps the filter in the URL", async ({ page, api }) => {
  const [yoga, hiit] = [unique("yoga"), unique("hiit")]
  await api.createTag(yoga, `Yoga ${yoga}`)
  await api.createTag(hiit, `HIIT ${hiit}`)
  const flow = await api.createEvent({ name: unique("flow"), title: `Flow ${yoga}`, tags: [yoga] })
  const burn = await api.createEvent({ name: unique("burn"), title: `Burn ${hiit}`, tags: [hiit] })

  await openClient(page, { tags: [yoga, hiit] })
  const filters = app(page).getByRole("group", { name: "Filter events" })
  await expect(app(page).getByRole("article")).toHaveCount(2)

  await filters.getByRole("button", { name: `Yoga ${yoga}` }).click()
  await expect(filters.getByRole("button", { name: `Yoga ${yoga}` })).toHaveAttribute("aria-pressed", "true")
  await expect(app(page).getByRole("article", { name: flow.title })).toBeVisible()
  await expect(app(page).getByRole("article", { name: burn.title })).toHaveCount(0)
  await expect(page).toHaveURL(`${hostURL}/?le=/?tags=${yoga}`)

  // The filter survives a reload.
  await page.reload()
  await expect(app(page).getByRole("article", { name: flow.title })).toBeVisible()
  await expect(app(page).getByRole("article", { name: burn.title })).toHaveCount(0)

  await filters.getByRole("button", { name: "Clear filters" }).click()
  await expect(app(page).getByRole("article")).toHaveCount(2)
  await expect(page).toHaveURL(`${hostURL}/`)
})

test("a member registers for a date, sees it and cancels it", async ({ page, api }) => {
  const tag = unique("tag")
  await api.createTag(tag, tag)
  const event = await api.createEvent({
    name: unique("reg"),
    title: `Class ${tag}`,
    capacity: 5,
    tags: [tag],
    dates: [isoIn(6), isoIn(13)],
  })
  const email = `${unique("member")}@example.com`

  await openClient(page, { tags: [tag] })
  const card = app(page).getByRole("article", { name: event.title })
  await card
    .getByRole("link", { name: /^Register for .* on / })
    .first()
    .click()

  await expect(app(page).getByRole("heading", { name: `Register for ${event.title}` })).toBeVisible()
  await signIn(page, email)
  await expect(app(page).getByText(`Signed in as ${email}`)).toBeVisible()
  await app(page).getByLabel("First name").fill("Ada")
  await app(page).getByLabel("Last name").fill("Lovelace")
  await app(page).getByRole("button", { name: "Confirm registration" }).click()

  await expect(app(page).getByRole("heading", { name: "You're registered!" })).toBeVisible()
  const code = (await app(page).locator(".le-code").textContent()) ?? ""
  expect(code).not.toBe("")
  await expect(page).toHaveURL(`${hostURL}/?le=/registrations/${code}`)
  await expect.poll(() => emailsTo(email).map((e) => e.subject)).toContain(`Registration confirmed: ${event.title}`)

  // The registration is stored for the member, with their name.
  const regs = await api.call<{ registrations: { confCode: string; member: { firstName: string } }[] }>(
    "ListEventRegistrations",
    { eventName: event.name },
  )
  expect(regs.registrations.map((r) => [r.confCode, r.member.firstName])).toEqual([[code, "Ada"]])

  // Going back skips the registration form, which was replaced by the confirmation.
  await page.goBack()
  await expect(app(page).getByRole("heading", { name: "Upcoming events" })).toBeVisible()
  await expect(card.locator('[data-status="registered"]')).toHaveCount(1)
  await expect(card.getByRole("link", { name: /^Register for .* on / })).toHaveCount(1)

  // The member stays signed in across reloads.
  await page.reload()
  await app(page).getByRole("link", { name: "My registrations" }).click()
  const upcoming = app(page).getByRole("list", { name: "Upcoming registrations" })
  await expect(upcoming.getByRole("listitem")).toHaveCount(1)
  await expect(upcoming.getByText(code)).toBeVisible()

  await upcoming.getByRole("button", { name: `Cancel registration ${code}` }).click()
  await upcoming.getByRole("button", { name: "Yes, cancel" }).click()
  await expect(app(page).getByText("You have no upcoming registrations.")).toBeVisible()

  await app(page).getByRole("button", { name: "Sign out" }).click()
  await expect(app(page).getByRole("link", { name: "Sign in" })).toBeVisible()
  await expect(app(page).getByLabel("Email address")).toBeVisible()
})

test("registers for every date of an event", async ({ page, api }) => {
  const tag = unique("tag")
  await api.createTag(tag, tag)
  const event = await api.createEvent({
    name: unique("series"),
    title: `Series ${tag}`,
    tags: [tag],
    dates: [isoIn(2), isoIn(9), isoIn(16)],
  })

  await openClient(page, { tags: [tag] })
  await app(page).getByRole("link", { name: "Register for all dates" }).click()
  await expect(app(page).getByText(/Every date: 3 dates from/)).toBeVisible()
  await signIn(page, `${unique("series")}@example.com`)
  await app(page).getByLabel("First name").fill("Grace")
  await app(page).getByLabel("Last name").fill("Hopper")
  await app(page).getByRole("button", { name: "Confirm registration" }).click()
  await expect(app(page).getByRole("heading", { name: "You're registered!" })).toBeVisible()
  await expect(app(page).getByText("Every date")).toBeVisible()

  await app(page).getByRole("link", { name: event.title }).click()
  await expect(app(page).getByRole("heading", { name: event.title })).toBeVisible()
  await expect(app(page).locator('[data-status="registered"]')).toHaveCount(3)
  await expect(app(page).getByText("You're registered for every date.")).toBeVisible()
})

test("shows full and closed dates without registration links", async ({ page, api }) => {
  const tag = unique("tag")
  await api.createTag(tag, tag)
  const full = await api.createEvent({ name: unique("full"), title: `Full ${tag}`, capacity: 1, tags: [tag] })
  const member = await api.createMember(`${unique("m")}@example.com`)
  await api.register(member.uid, full.name, full.dates[0].uid)
  const closed = await api.createEvent({ name: unique("closed"), title: `Closed ${tag}`, closed: true, tags: [tag] })

  await openClient(page, { tags: [tag] })
  const fullCard = app(page).getByRole("article", { name: full.title })
  await expect(fullCard.getByText("Full", { exact: true })).toBeVisible()
  await expect(fullCard.getByRole("link", { name: /^Register/ })).toHaveCount(0)
  const closedCard = app(page).getByRole("article", { name: closed.title })
  await expect(closedCard.getByText("Registration closed")).toBeVisible()
  await expect(closedCard.getByRole("link", { name: /^Register/ })).toHaveCount(0)

  // Opening the registration page directly explains why registration is not possible.
  await openClient(page, { tags: [tag] }, `/?le=/events/${full.name}/dates/${full.dates[0].uid}/register`)
  await expect(app(page).getByText("This date is full.")).toBeVisible()
})

test("recovers from an expired member session", async ({ page, api }) => {
  const tag = unique("tag")
  await api.createTag(tag, tag)
  const event = await api.createEvent({ name: unique("expired"), title: `Expired ${tag}`, tags: [tag] })
  await openClient(page, { tags: [tag] })
  await expect(app(page).getByRole("article", { name: event.title })).toBeVisible()

  await page.evaluate((key) => localStorage.setItem(key, "lem_revoked"), `lightevent:session:${baseURL}`)
  await page.reload()
  await expect(app(page).getByRole("article", { name: event.title })).toBeVisible()
  await expect(app(page).getByRole("link", { name: "Sign in" })).toBeVisible()
  expect(await page.evaluate((key) => localStorage.getItem(key), `lightevent:session:${baseURL}`)).toBeNull()
})

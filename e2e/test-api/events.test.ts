import { adminClient } from "./client"

describe("events", () => {
  describe("CreateEvent", () => {
    it("should create an event", async () => {
      const name = `test-event-${Date.now()}`
      const value = new Date(Date.now() + 86_400_000).toISOString().replace(/\.\d{3}Z$/, "Z")
      const resp = await adminClient.createEvent({
        event: { name, title: "Test Event", description: "Test event", dates: [{ value }] },
      })
      expect(resp.event).toMatchObject({
        name,
        title: "Test Event",
        description: "Test event",
        closed: false,
        hidden: false,
        dates: [{ value, cancelled: false }],
      })
      expect(resp.event?.dates[0].uid).toEqual(expect.any(String))
    })
  })
})

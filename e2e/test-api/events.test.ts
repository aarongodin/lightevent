import { adminUserClient } from "./client"

describe("events", () => {
  describe("CreateEvent", () => {
    it("should create an event", async () => {
      await expect(
        adminUserClient.CreateEvent({
          name: "test-event",
          title: "Test Event",
          description: "Test event",
          closed: false,
          hidden: false,
          dates: [
            {
              value: "2023-10-16T19:43:49Z",
              cancelled: false,
              uid: "",
            },
          ],
        }),
      ).resolves.toEqual({
        name: "test-event",
        title: "Test Event",
        description: "Test event",
        closed: false,
        hidden: false,
        dates: [
          {
            value: "2023-10-16T19:43:49Z",
            cancelled: false,
            uid: expect.any(String),
          },
        ],
      })
    })
  })
})

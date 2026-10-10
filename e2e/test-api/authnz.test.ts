import { adminClient, buildClient } from "./client"

describe("authnz", () => {
  describe("no credentials", () => {
    it("should be unauthenticated", async () => {
      await expect(buildClient().ping({})).rejects.toThrow("authentication required")
    })
  })

  describe("API key credentials", () => {
    it("should error when the Authorization header is not correct", async () => {
      await expect(buildClient({ Authorization: "invalid" }).ping({})).rejects.toThrow("authorization header must be")
    })

    it("should error when the API key does not exist", async () => {
      await expect(buildClient({ Authorization: "Bearer asdf" }).ping({})).rejects.toThrow("invalid API key")
    })

    describe("given a new API key", () => {
      let secret: string
      const name = `test-${Date.now()}`
      beforeAll(async () => {
        secret = (await adminClient.createAPIKey({ name })).secret
      })

      it("should return the subject", async () => {
        const resp = await buildClient({ Authorization: `Bearer ${secret}` }).ping({})
        expect(resp.scheme).toEqual("api-key")
        expect(resp.displayName).toEqual(name)
      })
    })
  })
})

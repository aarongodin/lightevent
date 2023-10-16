import { APIKeyWithSecret } from "../src/rpc"
import { adminUserClient, buildClient } from "./client"

describe("authnz", () => {
  describe("no credentials", () => {
    const client = buildClient()
    it("should be unauthenticated", async () => {
      await expect(client.Ping({})).rejects.toMatchInlineSnapshot(`[Error: authentication required]`)
    })
  })

  describe("user basic auth", () => {
    it("should be authenticated", async () => {
      await expect(adminUserClient.Ping({})).resolves.toEqual({
        sub: "admin",
      })
    })
  })

  describe("API key credentials", () => {
    it("should error when the Authorization header is not correct", async () => {
      const client = buildClient({
        headers: {
          Authorization: "invalid",
        },
      })
      await expect(client.Ping({})).rejects.toMatchInlineSnapshot(`[Error: invalid authorization format]`)
    })

    it("should error when the API Key does not exist", async () => {
      const client = buildClient({
        headers: {
          Authorization: "Bearer asdf",
        },
      })
      await expect(client.Ping({})).rejects.toMatchInlineSnapshot(`[Error: authentication required]`)
    })

    describe("given the API key exists", () => {
      let apiKey: APIKeyWithSecret
      beforeAll(async () => {
        apiKey = await adminUserClient.CreateAPIKey({ name: "test" })
      })

      it("should return the subject", async () => {
        const client = buildClient({
          headers: {
            Authorization: `Bearer ${apiKey.secret}`,
          },
        })

        await expect(client.Ping({})).resolves.toEqual({
          sub: "test",
        })
      })
    })
  })
})

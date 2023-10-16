import { FetchRPC, FetchRPCOptions } from "twirp-ts"

import { SpectralClientProtobuf } from "../src/rpc"

export const adminUserClient = buildClient({
  headers: {
    Authorization: "Basic YWRtaW46YWRtaW4=",
  },
})

export function buildClient(opts: Omit<FetchRPCOptions, "baseUrl"> = {}) {
  return new SpectralClientProtobuf(
    FetchRPC({
      ...opts,
      baseUrl: "http://0.0.0.0:8080/rpc",
    }),
  )
}

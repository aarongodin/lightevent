import "./index.css"

import React from "react"
import ReactDOM from "react-dom/client"
import { RouterProvider } from "react-router-dom"
import { FetchRPC, TwirpError, TwirpErrorCode } from "twirp-ts"

import { ClientContext } from "./client"
import router from "./router"
import { SpectralClientProtobuf } from "./rpc"

const client = new SpectralClientProtobuf(
  FetchRPC({
    baseUrl: `${window.origin}/rpc`,
    credentials: "same-origin",
  }),
)

async function main() {
  try {
    await client.Ping({})
  } catch (err) {
    if (err instanceof TwirpError) {
      if (err.code === TwirpErrorCode.Unauthenticated) {
        window.location.href = "/login"
        return
      }
    }

    // TODO(aarongodin): render an error screen
    return
  }

  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <ClientContext.Provider value={client}>
        <RouterProvider router={router} />
      </ClientContext.Provider>
    </React.StrictMode>,
  )
}

main()

import "./index.css"

import React from "react"
import ReactDOM from "react-dom/client"
import { RouterProvider } from "react-router-dom"
import { FetchRPC, TwirpError, TwirpErrorCode } from "twirp-ts"

import { ClientContext } from "./client"
import { PromptProvider, PromptView } from "./prompt"
import router from "./router"
import { LightEventClientProtobuf } from "./rpc"
import UnexpectedError from "./unexpected"

const client = new LightEventClientProtobuf(
  FetchRPC({
    baseUrl: `${window.origin}/rpc`,
    credentials: "same-origin",
  }),
)

async function main() {
  try {
    await client.Ping({})
  } catch (err: any) {
    if (err instanceof TwirpError) {
      if (err.code === TwirpErrorCode.Unauthenticated) {
        window.location.href = "/login"
        return
      }
    }

    ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(<UnexpectedError error={err} />)
    return
  }

  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <ClientContext.Provider value={client}>
        <PromptProvider>
          <RouterProvider router={router} />
          <PromptView />
        </PromptProvider>
      </ClientContext.Provider>
    </React.StrictMode>,
  )
}

main()

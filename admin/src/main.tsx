import "./index.css"

import { Code, ConnectError } from "@connectrpc/connect"
import { TransportProvider } from "@connectrpc/connect-query"
import { QueryClientProvider } from "@tanstack/react-query"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider } from "react-router"

import { IdentityContext } from "./lib/identity"
import { client, errorMessage, queryClient, redirectToLogin, transport } from "./lib/rpc"
import { router } from "./router"
import { ConfirmProvider } from "./units/confirm"
import { ToastProvider } from "./units/toast"

async function main() {
  const root = createRoot(document.getElementById("root") as HTMLElement)

  let identity: Awaited<ReturnType<typeof client.ping>>
  try {
    identity = await client.ping({})
  } catch (err) {
    if (err instanceof ConnectError && err.code === Code.Unauthenticated) {
      redirectToLogin()
      return
    }
    root.render(
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="max-w-md text-center">
          <h1 className="text-lg font-bold">LightEvent is unavailable</h1>
          <p className="mt-2 text-sm text-gray-600">{errorMessage(err)}</p>
        </div>
      </div>,
    )
    return
  }

  root.render(
    <StrictMode>
      <TransportProvider transport={transport}>
        <QueryClientProvider client={queryClient}>
          <IdentityContext.Provider value={identity}>
            <ToastProvider>
              <ConfirmProvider>
                <RouterProvider router={router} />
              </ConfirmProvider>
            </ToastProvider>
          </IdentityContext.Provider>
        </QueryClientProvider>
      </TransportProvider>
    </StrictMode>,
  )
}

main()

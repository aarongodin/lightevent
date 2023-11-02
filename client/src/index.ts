import { h, render } from "preact"
import { FetchRPC } from "twirp-ts"

import App from "./app"
import styles from "./index.css?inline"
import { Route } from "./router"
import { LightEventClientJSON } from "./rpc"

type LightEventOptions = {
  rootID: string
  serverBaseURL?: string
  initialRoute?: Route
}

export function init(options: LightEventOptions) {
  const opts = {
    serverBaseURL: window.origin,
    initialRoute: {
      name: "events",
    },
    ...options,
  }

  const root = document.getElementById(opts.rootID)
  if (root === null) {
    // Log this to the user
    return
  }

  const client = new LightEventClientJSON(
    FetchRPC({
      baseUrl: `${opts.serverBaseURL}/rpc`,
      credentials: "same-origin",
    }),
  )

  const shadow = root.attachShadow({ mode: "closed" })
  const sheet = new CSSStyleSheet()
  sheet.replaceSync(styles)
  shadow.adoptedStyleSheets = [sheet]

  const app = document.createElement("div")
  app.id = "app"
  render(
    h(App, {
      client,
      initialRoute: opts.initialRoute,
    }),
    app,
  )

  shadow.appendChild(app)
}

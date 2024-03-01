import styles from "./index.css?inline"

type LightEventOptions = {
  rootID: string
  serverBaseURL?: string
}

function loadRoute(route: string) {
  fetch(route, {
    headers: {
      "Content-Type": "text/html",
    },
  })
    .then((content) => content.text())
    .then((content) => {
      console.log(content)
    })
}

export function init(options: LightEventOptions) {
  const opts = {
    serverBaseURL: window.origin,
    initialRoute: "/client/events",
    ...options,
  }

  const root = document.getElementById(opts.rootID)
  if (root === null) {
    // Log this to the user
    return
  }

  const shadow = root.attachShadow({ mode: "closed" })
  const sheet = new CSSStyleSheet()
  sheet.replaceSync(styles)
  shadow.adoptedStyleSheets = [sheet]

  const app = document.createElement("div")
  app.id = "app"

  shadow.appendChild(app)

  loadRoute(opts.initialRoute)
}

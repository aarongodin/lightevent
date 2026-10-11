import { h, render } from "preact"

import { App } from "./app"
import { type InitOptions, resolveOptions, type Theme } from "./options"
import { Router } from "./router"
import styles from "./styles.css?inline"

export type { InitOptions, NavigationMode, NavigationOptions, Theme } from "./options"

export type ClientInstance = {
  // route returns the app's current route, e.g. "/events/yoga".
  route(): string
  // navigate shows the given route.
  navigate(route: string, options?: { replace?: boolean }): void
  // destroy removes the app from the page and stops listening to navigation.
  destroy(): void
}

const themeProperties: Record<keyof Theme, string> = {
  primaryColor: "--le-color-primary",
  primaryTextColor: "--le-color-primary-text",
  textColor: "--le-color-text",
  backgroundColor: "--le-color-background",
  borderRadius: "--le-radius",
  fontFamily: "--le-font-family",
}

const mounted = new WeakMap<Element, ClientInstance>()

function shadowRootFor(container: Element): ShadowRoot {
  const root = container.shadowRoot ?? container.attachShadow({ mode: "open" })
  if ("adoptedStyleSheets" in root) {
    const sheet = new CSSStyleSheet()
    sheet.replaceSync(styles)
    root.adoptedStyleSheets = [sheet]
  } else {
    const style = document.createElement("style")
    style.textContent = styles
    ;(root as ShadowRoot).appendChild(style)
  }
  return root
}

// init renders the LightEvent client app into an element of the page. The app is rendered in a shadow root,
// so the page's styles do not affect it (and its styles do not leak into the page).
export function init(options: InitOptions): ClientInstance {
  const opts = resolveOptions(options)
  mounted.get(opts.container)?.destroy()

  for (const [key, property] of Object.entries(themeProperties)) {
    const value = opts.theme[key as keyof Theme]
    if (value) {
      ;(opts.container as HTMLElement).style.setProperty(property, value)
    }
  }

  const shadow = shadowRootFor(opts.container)
  const mount = document.createElement("div")
  shadow.appendChild(mount)

  const router = new Router(opts.navigation)
  render(h(App, { options: opts, router }), mount)

  const instance: ClientInstance = {
    route: () => router.route,
    navigate: (route, navOptions) => router.navigate(route, navOptions),
    destroy() {
      render(null, mount)
      mount.remove()
      router.destroy()
      mounted.delete(opts.container)
    },
  }
  mounted.set(opts.container, instance)
  return instance
}

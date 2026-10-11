# Client app

The client app is how members browse events and register. It is a single script that any website can include,
served by the LightEvent server at `/client/lightevent-client.js`.

## Installation

1. In the admin UI, open Settings → Client app and add the origin of each website that embeds the app (for example
   `https://www.example.com`). The API only accepts browser requests from these origins. Origins can also be set with
   the `CLIENT_ALLOWED_ORIGINS` environment variable (comma separated).
2. Add the script and a container to a page of the website:

```html
<div id="events"></div>
<script src="https://events.example.com/client/lightevent-client.js"></script>
<script>
  LightEventClient.init({
    baseURL: "https://events.example.com",
    element: "#events",
  })
</script>
```

The app renders into a shadow root inside the container, so the website's styles don't change it and its styles don't
leak into the website.

## What members can do

- See all upcoming event dates, organized by event, and filter them by tag.
- Open an event to see its description and every upcoming date.
- Register for one date, or for every date of an event. Members verify their email address with an emailed code the
  first time; there are no passwords. A confirmation email is sent after registering.
- See their registrations and cancel upcoming ones.

## Options

| Option | Default | Description |
| --- | --- | --- |
| `baseURL` | required | URL of the LightEvent server. |
| `element` | required | Container element, or a CSS selector for it. |
| `navigation.mode` | `"query"` | How the app's current page is kept in the URL; see below. |
| `navigation.history` | `"push"` | `"push"` adds a browser history entry for each page of the app. `"replace"` only updates the URL, so the back button leaves the website's page. |
| `navigation.param` | `"le"` | Query parameter used by the `query` mode. |
| `navigation.basePath` | `"/"` | Path the app is mounted at, for the `path` mode. |
| `navigation.scroll` | `true` | Scroll the top of the app into view after navigating, when it is scrolled out of view. |
| `tags` | all | Only show events with at least one of these tags (by tag name), e.g. for a page dedicated to yoga classes. |
| `locale` | browser | Locale for dates. |
| `timeZone` | server, then browser | Time zone for event dates. Defaults to the time zone in Settings → Application, or the visitor's own when none is set. |
| `storage` | `"local"` | Where the member's session is kept: `"local"` (stays signed in across visits), `"session"` (until the tab closes) or `"memory"` (until the page reloads). |
| `theme` | | Colors, radius and font; see Theming. |
| `onNavigate` | | Called with the app's route on load and after every navigation, e.g. for analytics. |

`init()` returns an object with `route()`, `navigate(route)` and `destroy()`.

Some behavior is managed on the server, in Settings → Client app, so it applies to every website at once: whether
members see how many spots are left, and whether they can register for every date of an event at once.

## Navigation

The app keeps its current page (its route, like `/events/morning-yoga`) in the browser URL, so links can be shared,
reloading keeps the page, and the back and forward buttons move between pages of the app. Links are real links, so
they can be opened in a new tab. Choose how the route is stored with `navigation.mode`:

| Mode | Example URL | Notes |
| --- | --- | --- |
| `query` | `/classes?le=/events/morning-yoga` | Default. Works on any page without server changes; other query parameters and the `#hash` of the page are kept. |
| `hash` | `/classes#/events/morning-yoga` | Uses the URL fragment. Fragments that are not routes, like in-page anchors, show the event list. |
| `path` | `/classes/events/morning-yoga` | Clean URLs under `basePath`. The website must serve the same page for every path under `basePath`. |
| `memory` | `/classes` | The URL never changes, and back/forward do not navigate within the app. |

Filtering by tag replaces the current history entry rather than adding one, so the back button leaves the list
instead of undoing filters one by one. The filter is still part of the URL, so a filtered list can be shared.

## Theming

The app inherits the text color and font of the website. Set colors with the `theme` option:

```js
LightEventClient.init({
  baseURL: "https://events.example.com",
  element: "#events",
  theme: { primaryColor: "#0f766e", borderRadius: "4px" },
})
```

or with CSS custom properties on the container: `--le-color-primary`, `--le-color-primary-text`, `--le-color-text`,
`--le-color-background`, `--le-radius` and `--le-font-family`.

## How it works

- The bundle is built with Vite as one IIFE script (CSS included) and checked against a 100 KB budget on every build.
  It uses Preact and calls the API with `fetch` and JSON, without the protobuf runtime.
- Requests go to the server's Connect API. The server sends CORS headers to allowed origins only, and never allows
  credentials (cookies).
- After verifying their email, members get a session token (`lem_…`), which the app keeps in `localStorage` (per the
  `storage` option) and sends as `Authorization: Bearer <token>`. Signing out revokes it on the server.

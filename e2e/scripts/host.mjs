// Serves a stand-in for a website that embeds the client app, on a different origin than the LightEvent server
// (localhost vs. 127.0.0.1), so the tests exercise the cross-origin setup that real websites use. Every path serves
// the same page, as a website configured for the client app's "path" navigation mode would. Tests pass init()
// options through window.__LE_OPTIONS (see clientPage in tests/client-fixtures.ts).
import { createServer } from "node:http"

const port = Number(process.env.E2E_HOST_PORT ?? "18081")
const serverURL = `http://127.0.0.1:${process.env.E2E_PORT ?? "18080"}`

const page = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Sunrise Studio</title>
    <style>
      body { font-family: Georgia, serif; color: #222; max-width: 48rem; margin: 0 auto; padding: 1rem; }
      /* Host page styles must not leak into the app. */
      button, a, h2, h3 { color: rgb(255, 0, 0) !important; font-size: 40px; }
    </style>
  </head>
  <body>
    <h1>Sunrise Studio</h1>
    <a href="#about">About us</a>
    <div id="events"></div>
    <p id="about">We are a studio.</p>
    <script src="${serverURL}/client/lightevent-client.js"></script>
    <script>
      window.lightevent = LightEventClient.init(
        Object.assign({ baseURL: "${serverURL}", element: "#events" }, window.__LE_OPTIONS || {}),
      )
    </script>
  </body>
</html>
`

createServer((req, res) => {
  if (req.url === "/favicon.ico") {
    res.writeHead(404).end()
    return
  }
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" })
  res.end(page)
}).listen(port, () => {
  console.log(`host page on http://localhost:${port}`)
})

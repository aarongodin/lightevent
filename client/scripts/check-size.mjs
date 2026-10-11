// Fails the build when the client bundle grows past its size budget. Websites load the bundle on every page
// that embeds LightEvent, so it should stay small.
import { readFileSync } from "node:fs"
import { gzipSync } from "node:zlib"

const BUDGET = 100 * 1024
const file = new URL("../dist/lightevent-client.js", import.meta.url)
const bytes = readFileSync(file)
const gzip = gzipSync(bytes, { level: 9 }).length
const kib = (n) => `${(n / 1024).toFixed(1)} KiB`

console.log(
  `lightevent-client.js: ${kib(bytes.length)} minified, ${kib(gzip)} gzipped (budget ${kib(BUDGET)} minified)`,
)
if (bytes.length > BUDGET) {
  console.error("The client bundle is over its size budget.")
  process.exit(1)
}

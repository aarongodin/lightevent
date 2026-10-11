import { writeFileSync } from "node:fs"
import { resolve } from "node:path"
import { defineConfig, type Plugin } from "vite"

// The server embeds client/dist with go:embed, which requires the directory to exist in a fresh checkout.
// Vite empties dist on every build, so restore the tracked placeholder afterwards.
function keepDistPlaceholder(): Plugin {
  return {
    name: "keep-dist-placeholder",
    apply: "build",
    closeBundle() {
      writeFileSync(resolve(import.meta.dirname, "dist/.gitkeep"), "")
    },
  }
}

// The client app is built as a single script (an IIFE that defines the LightEventClient global) with its CSS
// inlined, so websites embed it with one <script> tag. The dev server serves index.html, a playground page.
export default defineConfig({
  plugins: [keepDistPlaceholder()],
  oxc: {
    jsx: { runtime: "automatic", importSource: "preact" },
  },
  server: {
    port: 5600,
    strictPort: true,
  },
  build: {
    target: "es2020",
    lib: {
      entry: "src/index.ts",
      name: "LightEventClient",
      formats: ["iife"],
      fileName: () => "lightevent-client.js",
    },
  },
})

import { writeFileSync } from "node:fs"
import { resolve } from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, type Plugin } from "vite"

// The Go server address used by the dev server proxy.
const serverURL = `http://${process.env.HOST ?? "127.0.0.1"}:${process.env.PORT ?? "8080"}`

// The server embeds admin/dist with go:embed, which requires the directory to exist in a fresh checkout.
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

export default defineConfig({
  plugins: [react(), tailwindcss(), keepDistPlaceholder()],
  server: {
    port: 5500,
    strictPort: true,
    proxy: {
      "/login": serverURL,
      "/auth": serverURL,
      "/rpc": serverURL,
      "/healthz": serverURL,
    },
  },
  build: {
    // Rolldown's default full minification (`minify: true`) currently produces a bundle that crashes React 19
    // with error #525 on some pages. Explicit compress + mangle options produce a working bundle of similar
    // size, so Vite's minifier is disabled in favor of these output options.
    minify: false,
    cssMinify: true,
    rolldownOptions: {
      output: {
        minify: { compress: true, mangle: true, codegen: { removeWhitespace: true } },
      },
    },
    // The admin UI is a single bundle that is downloaded once and cached immutably by the server.
    chunkSizeWarningLimit: 800,
    // Keep the bundle free of inline scripts so the server's Content-Security-Policy can forbid them.
    modulePreload: { polyfill: false },
  },
})

import fs from "fs"
import path from "path"
import { defineConfig } from "vite"

import preact from "@preact/preset-vite"

const { HOST: host, PORT: port } = process.env
const serverURL = `http://${host}:${port}`

export default defineConfig({
  plugins: [preact()],
  server: {
    hmr: false,
    https: {
      key: fs.readFileSync(path.resolve(__dirname, "../.cert/key.pem")),
      cert: fs.readFileSync(path.resolve(__dirname, "../.cert/cert.pem")),
    },
    port: 6500,
    proxy: {
      "/login": serverURL,
      "/auth/login": serverURL,
      "/auth/logout": serverURL,
      "/rpc": serverURL,
    },
  },
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "LightEventClient",
      // the proper extensions will be added
      fileName: "lightevent-client",
    },
  },
})

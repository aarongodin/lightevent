import fs from "fs"
import path from "path"
import { defineConfig } from "vite"

import react from "@vitejs/plugin-react-swc"

const { HOST: host, PORT: port } = process.env
const serverURL = `http://${host}:${port}`

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, "../.cert/key.pem")),
      cert: fs.readFileSync(path.resolve(__dirname, "../.cert/cert.pem")),
    },
    port: 5500,
    proxy: {
      "/login": serverURL,
      "/auth/login": serverURL,
      "/auth/logout": serverURL,
      "/rpc": serverURL,
    },
  },
})

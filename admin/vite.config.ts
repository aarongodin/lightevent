import { defineConfig } from "vite"

import react from "@vitejs/plugin-react-swc"

const { HOST: host, PORT: port } = process.env
const serverURL = `http://${host}:${port}`

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5500,
    proxy: {
      "/login": serverURL,
      "/auth/login": serverURL,
      "/rpc": serverURL,
    },
  },
  resolve: {
    alias: {
      "../../google/protobuf/struct": "google-protobuf/google/protobuf/struct_pb",
    },
  },
})

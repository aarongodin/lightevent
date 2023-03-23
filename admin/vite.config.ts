import { defineConfig } from "vite"

import react from "@vitejs/plugin-react-swc"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5500,
    proxy: {
      "/login": "http://localhost:8080",
      "/auth/login": "http://localhost:8080",
      "/rpc": "http://localhost:8080",
    },
  },
})

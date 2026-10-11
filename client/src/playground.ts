// Development entry point for index.html (`npm -w client run dev`).
import { init } from "./index"

init({
  baseURL: import.meta.env.VITE_LIGHTEVENT_URL ?? "http://localhost:8080",
  element: "#events",
})

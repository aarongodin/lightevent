// Starts a LightEvent server for the browser tests: builds the admin UI and server binary, then runs it against
// a fresh database. Server output is also written to e2e/.tmp/server.log so tests can read emails sent through
// the "log" email provider.
import { spawn, spawnSync } from "node:child_process"
import { createWriteStream, mkdirSync, readFileSync, rmSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const e2eDir = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const repoRoot = resolve(e2eDir, "..")
const tmpDir = join(e2eDir, ".tmp")
const binary = join(tmpDir, process.platform === "win32" ? "lightevent.exe" : "lightevent")

rmSync(tmpDir, { recursive: true, force: true })
mkdirSync(tmpDir, { recursive: true })

function run(cmd, args) {
  const result = spawnSync(cmd, args, { cwd: repoRoot, stdio: "inherit", shell: process.platform === "win32" })
  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

if (process.env.E2E_SKIP_ADMIN_BUILD !== "1") {
  run("npm", ["-w", "admin", "run", "build"])
}
run("go", ["build", "-o", binary, "./cmd/server"])

const log = createWriteStream(join(tmpDir, "server.log"))
const server = spawn(binary, [], {
  cwd: tmpDir,
  env: {
    ...process.env,
    HOST: "127.0.0.1",
    PORT: process.env.E2E_PORT ?? "18080",
    DATABASE_FILE: join(tmpDir, "lightevent.sqlite3"),
    LOG_FORMAT: "json",
    COOKIE_SECURE: "false",
    // Tests send X-Forwarded-For so each test gets its own client IP for rate limiting.
    TRUST_PROXY_HEADERS: "true",
    EMAIL_PROVIDER: "log",
    BOOTSTRAP_USERNAME: process.env.E2E_ADMIN_USERNAME ?? "admin",
    BOOTSTRAP_PASSWORD: process.env.E2E_ADMIN_PASSWORD ?? "e2e-admin-password",
  },
  stdio: ["ignore", "pipe", "pipe"],
})
server.stdout.pipe(log)
server.stderr.pipe(log)

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.kill(signal))
}
server.on("exit", (code) => {
  if (code) {
    // Surface why the server stopped; the full log is in e2e/.tmp/server.log.
    const lines = readFileSync(join(tmpDir, "server.log"), "utf8").trim().split("\n")
    console.error(lines.slice(-20).join("\n"))
  }
  process.exit(code ?? 0)
})

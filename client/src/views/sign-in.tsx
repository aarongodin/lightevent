import { useState } from "preact/hooks"

import { ApiError } from "../api"
import { useApp } from "../context"
import { ErrorMessage } from "../ui"

function message(err: unknown): string {
  return err instanceof ApiError ? err.message : "Something went wrong. Please try again."
}

// SignIn verifies the member's email address with an emailed code. Members are created on their first
// sign-in, so there is no separate sign-up.
export function SignIn({ intro }: { intro: string }) {
  const { api, signIn } = useApp()
  const [email, setEmail] = useState("")
  const [key, setKey] = useState<string | null>(null)
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [resent, setResent] = useState(false)

  async function sendCode(e?: Event) {
    e?.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const resp = await api.beginVerification(email.trim())
      setKey(resp.key ?? null)
      setCode("")
      return true
    } catch (err) {
      setError(message(err))
      return false
    } finally {
      setBusy(false)
    }
  }

  async function verify(e: Event) {
    e.preventDefault()
    if (!key) {
      return
    }
    setBusy(true)
    setError(null)
    try {
      const resp = await api.completeVerification(key, code.trim())
      if (resp.sessionToken && resp.member) {
        signIn(resp.sessionToken, resp.member)
      }
    } catch (err) {
      setError(message(err))
      setBusy(false)
    }
  }

  if (!key) {
    return (
      <form class="le-form" onSubmit={sendCode} noValidate>
        <p>{intro}</p>
        <div class="le-field">
          <label for="le-email">Email address</label>
          <input
            id="le-email"
            type="email"
            autocomplete="email"
            required
            value={email}
            onInput={(e) => setEmail(e.currentTarget.value)}
          />
        </div>
        {error && <ErrorMessage error={error} />}
        <button type="submit" class="le-button" disabled={busy || !email.trim()}>
          {busy ? "Sending…" : "Send code"}
        </button>
      </form>
    )
  }

  return (
    <form class="le-form" onSubmit={verify} noValidate>
      <p>
        We sent a code to <strong>{email.trim()}</strong>. Enter it below to continue.
      </p>
      <div class="le-field">
        <label for="le-code">Verification code</label>
        <input
          id="le-code"
          autocomplete="one-time-code"
          autocapitalize="characters"
          spellcheck={false}
          required
          value={code}
          onInput={(e) => setCode(e.currentTarget.value)}
        />
      </div>
      {error && <ErrorMessage error={error} />}
      {resent && !error && <p class="le-muted">We sent a new code.</p>}
      <div class="le-actions">
        <button type="submit" class="le-button" disabled={busy || !code.trim()}>
          {busy ? "Verifying…" : "Verify"}
        </button>
        <button type="button" class="le-link-button" disabled={busy} onClick={async () => setResent(await sendCode())}>
          Send a new code
        </button>
        <button
          type="button"
          class="le-link-button"
          disabled={busy}
          onClick={() => {
            setKey(null)
            setError(null)
            setResent(false)
          }}
        >
          Use a different email
        </button>
      </div>
    </form>
  )
}

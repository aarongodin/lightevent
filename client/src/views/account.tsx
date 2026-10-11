import type { ComponentChildren } from "preact"
import { useState } from "preact/hooks"

import { ApiError } from "../api"
import { useApp, useQuery } from "../context"
import type { RegistrationJson } from "../gen/lightevent/v1/service_pb"
import { isUpcoming } from "../model"
import { ErrorMessage, Link, Loading, Notice } from "../ui"
import { eventRoute } from "./events"
import { SignIn } from "./sign-in"

function RegistrationDate({ registration }: { registration: RegistrationJson }) {
  const { format } = useApp()
  if (registration.kind === "REGISTRATION_KIND_SERIES") {
    return <>Every date</>
  }
  return <>{format.dateTime(registration.eventDate?.value)}</>
}

function RegistrationItem({ registration, upcoming }: { registration: RegistrationJson; upcoming: boolean }) {
  const { api, cache } = useApp()
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function cancel() {
    setBusy(true)
    setError(null)
    try {
      await api.cancelRegistration(registration.confCode ?? "")
      cache.invalidate()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.")
      setBusy(false)
    }
  }

  return (
    <li class="le-registration">
      <div>
        <Link to={eventRoute(registration.eventName ?? "")} class="le-registration-title">
          {registration.eventTitle}
        </Link>
        <div class="le-muted">
          <RegistrationDate registration={registration} /> · Confirmation code {registration.confCode}
        </div>
      </div>
      {upcoming && (
        <div class="le-actions">
          {confirming ? (
            <>
              <span>Cancel this registration?</span>
              <button type="button" class="le-button le-button-danger le-button-small" disabled={busy} onClick={cancel}>
                {busy ? "Cancelling…" : "Yes, cancel"}
              </button>
              <button type="button" class="le-link-button" disabled={busy} onClick={() => setConfirming(false)}>
                Keep it
              </button>
            </>
          ) : (
            <button
              type="button"
              class="le-button le-button-secondary le-button-small"
              aria-label={`Cancel registration ${registration.confCode}`}
              onClick={() => setConfirming(true)}
            >
              Cancel
            </button>
          )}
        </div>
      )}
      {error && <ErrorMessage error={error} />}
    </li>
  )
}

function Registrations() {
  const { api, member, signOut } = useApp()
  const query = useQuery(`my-registrations:${member?.uid}`, () => api.listMyRegistrations())
  if (query.error) {
    return <ErrorMessage error={query.error} onRetry={query.reload} />
  }
  if (!query.data) {
    return <Loading />
  }

  const all = query.data.registrations ?? []
  const upcoming = all.filter((r) => r.kind === "REGISTRATION_KIND_SERIES" || isUpcoming(r.eventDate ?? {}))
  const past = all.filter((r) => !upcoming.includes(r))
  return (
    <>
      <p class="le-muted">
        Signed in as <strong>{member?.email}</strong>.{" "}
        <button type="button" class="le-link-button" onClick={signOut}>
          Sign out
        </button>
      </p>
      {upcoming.length === 0 ? (
        <Notice>
          You have no upcoming registrations. <Link to="/">Browse events</Link>
        </Notice>
      ) : (
        <ul class="le-registrations" aria-label="Upcoming registrations">
          {upcoming.map((r) => (
            <RegistrationItem key={r.confCode} registration={r} upcoming />
          ))}
        </ul>
      )}
      {past.length > 0 && (
        <>
          <h3 class="le-subheading">Past</h3>
          <ul class="le-registrations" aria-label="Past registrations">
            {past.map((r) => (
              <RegistrationItem key={r.confCode} registration={r} upcoming={false} />
            ))}
          </ul>
        </>
      )}
    </>
  )
}

export function AccountView() {
  const { member } = useApp()
  return (
    <section aria-labelledby="le-account-heading">
      <h2 id="le-account-heading" class="le-heading" tabIndex={-1}>
        My registrations
      </h2>
      {member ? (
        <Registrations />
      ) : (
        <SignIn intro="Enter your email address to see your registrations. We'll send you a code to confirm it's you." />
      )}
    </section>
  )
}

export function ConfirmationView({ confCode }: { confCode: string }) {
  const { api, member, format } = useApp()
  const query = useQuery(member ? `registration:${confCode}` : null, () => api.getRegistration(confCode))

  let body: ComponentChildren
  if (!member) {
    body = <SignIn intro="Sign in to see this registration." />
  } else if (query.error) {
    body = (
      <ErrorMessage error={query.error.code === "not_found" ? "This registration could not be found." : query.error} />
    )
  } else if (!query.data?.registration) {
    body = <Loading />
  } else {
    const r = query.data.registration
    body = (
      <>
        <dl class="le-details">
          <dt>Event</dt>
          <dd>
            <Link to={eventRoute(r.eventName ?? "")}>{r.eventTitle}</Link>
          </dd>
          <dt>When</dt>
          <dd>{r.kind === "REGISTRATION_KIND_SERIES" ? "Every date" : format.dateTime(r.eventDate?.value)}</dd>
          <dt>Confirmation code</dt>
          <dd class="le-code">{r.confCode}</dd>
        </dl>
        <p>A confirmation has been sent to {member.email}.</p>
        <div class="le-actions">
          <Link to="/account" class="le-button le-button-secondary">
            My registrations
          </Link>
          <Link to="/" class="le-link">
            Browse more events
          </Link>
        </div>
      </>
    )
  }

  return (
    <section aria-labelledby="le-confirmation-heading">
      <h2 id="le-confirmation-heading" class="le-heading" tabIndex={-1}>
        {member && query.data ? "You're registered!" : "Registration"}
      </h2>
      {body}
    </section>
  )
}

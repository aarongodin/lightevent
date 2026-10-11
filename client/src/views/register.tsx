import type { ComponentChildren } from "preact"
import { useState } from "preact/hooks"

import { ApiError } from "../api"
import { useApp, useNavigate } from "../context"
import type { EventJson } from "../gen/lightevent/v1/service_pb"
import { dateAvailability, seriesAvailability, upcomingDates } from "../model"
import { BackLink, ErrorMessage, Link, Loading, Notice } from "../ui"
import { useEvent } from "./event"
import { eventRoute, useMyRegistrations } from "./events"
import { SignIn } from "./sign-in"

const unavailable: Record<string, string> = {
  cancelled: "This date has been cancelled.",
  past: "This date has already passed.",
  closed: "Registration for this event is closed.",
  full: "This date is full.",
  unavailable: "Registration for every date of this event is not available.",
}

function RegisterForm({ event, dateUid }: { event: EventJson; dateUid?: string }) {
  const { api, cache, member, signOut } = useApp()
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState(member?.firstName ?? "")
  const [lastName, setLastName] = useState(member?.lastName ?? "")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: Event) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const resp = await api.register({
        registration: {
          kind: dateUid ? "REGISTRATION_KIND_ONCE" : "REGISTRATION_KIND_SERIES",
          eventName: event.name,
          eventDateUid: dateUid,
        },
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      })
      cache.invalidate()
      // Replace the form in history, so going back from the confirmation does not show the form again.
      navigate(`/registrations/${encodeURIComponent(resp.registration?.confCode ?? "")}`, { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.")
      setBusy(false)
    }
  }

  return (
    <form class="le-form" onSubmit={submit} noValidate>
      <p class="le-muted">
        Signed in as <strong>{member?.email}</strong>.{" "}
        <button type="button" class="le-link-button" onClick={signOut}>
          Not you?
        </button>
      </p>
      <div class="le-field-row">
        <div class="le-field">
          <label for="le-first-name">First name</label>
          <input
            id="le-first-name"
            autocomplete="given-name"
            required
            value={firstName}
            onInput={(e) => setFirstName(e.currentTarget.value)}
          />
        </div>
        <div class="le-field">
          <label for="le-last-name">Last name</label>
          <input
            id="le-last-name"
            autocomplete="family-name"
            required
            value={lastName}
            onInput={(e) => setLastName(e.currentTarget.value)}
          />
        </div>
      </div>
      {error && <ErrorMessage error={error} />}
      <button type="submit" class="le-button" disabled={busy || !firstName.trim() || !lastName.trim()}>
        {busy ? "Registering…" : "Confirm registration"}
      </button>
    </form>
  )
}

export function RegisterView({ eventName, dateUid }: { eventName: string; dateUid?: string }) {
  const { config, format, member } = useApp()
  const query = useEvent(eventName)
  const { registrations, loading } = useMyRegistrations()
  const back = <BackLink to={eventRoute(eventName)}>Back to event</BackLink>

  if (query.error) {
    return (
      <>
        <BackLink />
        <ErrorMessage error={query.error.code === "not_found" ? "This event could not be found." : query.error} />
      </>
    )
  }
  const event = query.data?.event
  if (!event || loading) {
    return <Loading />
  }

  const date = dateUid ? event.dates?.find((d) => d.uid === dateUid) : undefined
  if (dateUid && !date) {
    return (
      <>
        {back}
        <Notice>This date could not be found.</Notice>
      </>
    )
  }
  const status = date
    ? dateAvailability(event, date, registrations).status
    : seriesAvailability(event, registrations, config)
  const dates = upcomingDates(event).filter((d) => !d.cancelled)

  let body: ComponentChildren
  if (status === "registered") {
    body = (
      <Notice>
        You're already registered. <Link to="/account">View your registrations</Link>
      </Notice>
    )
  } else if (status !== "open") {
    body = <Notice>{unavailable[status]}</Notice>
  } else if (!member) {
    body = <SignIn intro="Enter your email address to register. We'll send you a code to confirm it's you." />
  } else {
    body = <RegisterForm event={event} dateUid={dateUid} />
  }

  return (
    <section aria-labelledby="le-register-heading">
      {back}
      <h2 id="le-register-heading" class="le-heading" tabIndex={-1}>
        Register for {event.title}
      </h2>
      <p class="le-summary">
        {date ? (
          format.dateTime(date.value)
        ) : (
          <>
            Every date: {dates.length} dates from {format.date(dates[0]?.value)} to{" "}
            {format.date(dates[dates.length - 1]?.value)}
          </>
        )}
      </p>
      {body}
    </section>
  )
}

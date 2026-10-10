import { useMutation } from "@connectrpc/connect-query"
import { useState } from "react"
import { useNavigate } from "react-router"

import { type Event as Evt, type Member, RegistrationKind } from "../gen/lightevent/v1/service_pb"
import { formatCapacity, formatDateTime, isPast } from "../lib/format"
import { errorMessage, invalidateAll, LightEventService } from "../lib/rpc"
import { eventRoute } from "../router"
import { Alert } from "../units/alert"
import { Button } from "../units/button"
import { Checkbox, Field, inputClassName } from "../units/field"
import { Box } from "../units/layout"
import { useToast } from "../units/toast"
import { DiscardButton } from "./discard"
import { MemberSelect } from "./member-select"

export function RegistrationForm({ event }: { event: Evt }) {
  const navigate = useNavigate()
  const toast = useToast()
  const create = useMutation(LightEventService.method.createRegistration)
  const [member, setMember] = useState<Member | null>(null)
  const [kind, setKind] = useState<RegistrationKind>(RegistrationKind.ONCE)
  const [dateUid, setDateUid] = useState("")
  const [notify, setNotify] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const dates = event.dates.filter((d) => !d.cancelled)
  const upcoming = dates.filter((d) => !isPast(d.value))
  const past = dates.filter((d) => isPast(d.value))

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    setError(null)
    if (!member || (kind === RegistrationKind.ONCE && !dateUid)) {
      return
    }
    try {
      await create.mutateAsync({
        memberUid: member.uid,
        notifyMember: notify,
        registration: {
          kind,
          eventName: event.name,
          eventDateUid: kind === RegistrationKind.ONCE ? dateUid : undefined,
        },
      })
      await invalidateAll()
      toast.success("Registration added")
      navigate(eventRoute(event.name))
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  const dateOption = (d: Evt["dates"][number]) => {
    const full = event.capacity > 0 && d.registrationCount >= event.capacity
    return (
      <option key={d.uid} value={d.uid} disabled={full}>
        {formatDateTime(d.value)} — {formatCapacity(d.registrationCount, event.capacity)} registered
        {full ? " (full)" : ""}
      </option>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="mx-auto max-w-xl">
      <Box className="grid gap-5">
        <Field id="member" label="Member" required error={submitted && !member ? "Choose a member" : undefined}>
          <MemberSelect id="member" value={member} onChange={setMember} invalid={submitted && !member} />
        </Field>

        <fieldset className="grid gap-2">
          <legend className="text-sm font-medium text-gray-800">Register for</legend>
          {[
            { value: RegistrationKind.ONCE, label: "A single date" },
            { value: RegistrationKind.SERIES, label: "All dates of this event" },
          ].map((option) => (
            <label key={option.value} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="kind"
                className="size-4"
                checked={kind === option.value}
                onChange={() => setKind(option.value)}
              />
              {option.label}
            </label>
          ))}
        </fieldset>

        {kind === RegistrationKind.ONCE && (
          <Field id="eventDate" label="Date" required error={submitted && !dateUid ? "Choose a date" : undefined}>
            <select
              id="eventDate"
              className={inputClassName}
              value={dateUid}
              onChange={(e) => setDateUid(e.target.value)}
              aria-invalid={submitted && !dateUid}
            >
              <option value="">Choose a date…</option>
              {upcoming.length > 0 && <optgroup label="Upcoming">{upcoming.map(dateOption)}</optgroup>}
              {past.length > 0 && <optgroup label="Past">{past.map(dateOption)}</optgroup>}
            </select>
          </Field>
        )}

        <Checkbox
          id="notify"
          label="Email a confirmation to the member"
          checked={notify}
          onChange={(e) => setNotify(e.target.checked)}
        />
      </Box>

      {error && (
        <Alert variant="error" title="Could not add the registration" className="mt-4">
          {error}
        </Alert>
      )}

      <div className="mt-6 flex gap-2">
        <Button type="submit" disabled={create.isPending}>
          {create.isPending ? "Saving…" : "Add registration"}
        </Button>
        <DiscardButton to={eventRoute(event.name)} dirty={member !== null || dateUid !== ""} />
      </div>
    </form>
  )
}

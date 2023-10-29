import { DateTime } from "luxon"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { TwirpError } from "twirp-ts"

import { ErrorMessage } from "@hookform/error-message"

import { useClient } from "../client"
import { eventRoute } from "../router"
import { Event as Evt, RegistrationKind, registrationKindFromJSON, WriteableRegistration } from "../rpc"
import { Button } from "../units/button"
import { MemberSelect } from "./components/member-select"

type EventFormProps = {
  event: Evt
}

export function RegistrationForm({ event }: EventFormProps) {
  const { handleSubmit, register, unregister, watch, formState, setError } = useForm()
  const kind = watch("kind")
  const client = useClient()
  const navigate = useNavigate()

  useEffect(() => {
    if (parseInt(kind, 10) === RegistrationKind.REG_ONCE) {
      register("eventDateUid")
    } else {
      unregister("eventDateUid")
    }
  }, [register, unregister, kind])

  async function onSubmit(data: any) {
    const payload: WriteableRegistration = {
      memberEmail: data.memberEmail,
      kind: registrationKindFromJSON(parseInt(data.kind, 10)),
      eventName: event.name,
    }
    console.log(payload, data)
    if (data.eventDateUid && data.eventDateUid.length > 0) {
      payload.eventDateUid = data.eventDateUid
    }
    try {
      await client.CreateRegistration(payload)
    } catch (err) {
      let message = ""
      if (err instanceof TwirpError) {
        message = err.message
      } else {
        message = (err as Error).message
      }
      setError("root.submit", { type: "custom", message })
      return
    }
    navigate(eventRoute(event.name))
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="max-w-2xl mx-auto">
        <ErrorMessage name="root.submit" errors={formState.errors} />
        <div className="grid grid-cols-3 gap-4 max-w-xl bg-white p-4 rounded-lg drop-shadow">
          <label className="flex items-center justify-end text-sm text-gray-800" htmlFor="memberEmail">
            Member
          </label>
          <input
            className="col-span-2 rounded-md border-2 border-slate-200 px-2 py-1 focus:drop-shadow"
            {...register("memberEmail", { required: true })}
            required
          />
          <label className="flex items-center justify-end text-sm text-gray-800" htmlFor="kind">
            Kind
          </label>
          <select
            {...register("kind", { required: true })}
            className="col-span-2 rounded-md border-2 border-slate-200 px-1 py-1 focus:drop-shadow"
            required
          >
            <option value="" />
            <option value={RegistrationKind.REG_ONCE}>Once</option>
            <option value={RegistrationKind.REG_SERIES}>Series</option>
          </select>
          {parseInt(kind, 10) === RegistrationKind.REG_ONCE && (
            <>
              <label className="flex items-center justify-end text-sm text-gray-800" htmlFor="eventDateUid">
                Event Date
              </label>
              <select
                {...register("eventDateUid")}
                required
                className="col-span-2 rounded-md border-2 border-slate-200 px-1 py-1 focus:drop-shadow"
              >
                <option value="" />
                {event.dates.map((eventDate) => {
                  return (
                    <option key={eventDate.uid} value={eventDate.uid}>
                      {DateTime.fromISO(eventDate.value).toLocaleString(DateTime.DATETIME_SHORT)}
                    </option>
                  )
                })}
              </select>
            </>
          )}
        </div>
        <div className="mt-4">
          <Button color="primary" disabled={formState.isSubmitting}>
            Save Registration
          </Button>
        </div>
      </div>
    </form>
  )
}

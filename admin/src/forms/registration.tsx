import { DateTime } from "luxon"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"

import { useClient } from "../client"
import { eventRoute } from "../router"
import { Event as Evt, RegistrationKind, registrationKindFromJSON, WriteableRegistration } from "../rpc"
import { Button } from "../units/button"

type EventFormProps = {
  event: Evt
}

export function RegistrationForm({ event }: EventFormProps) {
  const { handleSubmit, register, unregister, watch, formState } = useForm()
  const kind = watch("kind")
  const client = useClient()
  const navigate = useNavigate()

  useEffect(() => {
    if (parseInt(kind, 10) === RegistrationKind.REG_ONCE) {
      register("eventDate")
    } else {
      unregister("eventDate")
    }
  }, [register, unregister, kind])

  async function onSubmit(data: any) {
    const payload: WriteableRegistration = {
      memberEmail: data.memberEmail,
      kind: registrationKindFromJSON(parseInt(data.kind, 10)),
      eventName: event.name,
    }
    if (data.eventDate && data.eventDate.length > 0) {
      payload.eventDate = data.eventDate
    }
    const resp = await client.CreateRegistration(payload)
    console.log(resp)
    navigate(eventRoute(event.name))
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="max-w-2xl mx-auto">
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
              <label className="flex items-center justify-end text-sm text-gray-800" htmlFor="eventDate">
                Event Date
              </label>
              <select
                {...register("eventDate")}
                required
                className="col-span-2 rounded-md border-2 border-slate-200 px-1 py-1 focus:drop-shadow"
              >
                <option value="" />
                {event.dates.map((eventDate) => {
                  return (
                    <option key={eventDate.id} value={eventDate.value}>
                      {DateTime.fromISO(eventDate.value).toLocaleString(DateTime.DATETIME_MED)}
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

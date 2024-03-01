import { useEffect } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { TwirpError } from "twirp-ts"

import { ErrorMessage } from "@hookform/error-message"

import { useClient } from "../client"
import dayjs from "../dayjs"
import { eventRoute } from "../router"
import { Event as Evt, RegistrationKind, registrationKindFromJSON, WriteableRegistration } from "../rpc"
import { Alert } from "../units/alert"
import { Button } from "../units/button"
import { MemberSelect } from "./components/member-select"

type EventFormProps = {
  event: Evt
}

export function RegistrationForm({ event }: EventFormProps) {
  const methods = useForm()
  const { handleSubmit, register, unregister, watch, formState, setError } = methods
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
      <FormProvider {...methods}>
        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-3 gap-4 max-w-xl bg-white p-4 md:rounded-lg drop-shadow">
            <label className="flex items-center justify-end text-sm text-gray-800" htmlFor="memberEmail">
              Member
            </label>
            <MemberSelect fieldName="memberEmail" />
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
                        {dayjs(eventDate.value).format("LLLL")}
                      </option>
                    )
                  })}
                </select>
              </>
            )}
          </div>
          <ErrorMessage
            name="root.submit"
            errors={formState.errors}
            render={({ message }) => <Alert variant="error" title="Error" content={message} />}
          />

          <div className="mt-4 px-4 md:p-0">
            <Button color="primary" disabled={formState.isSubmitting}>
              Save Registration
            </Button>
          </div>
        </div>
      </FormProvider>
    </form>
  )
}

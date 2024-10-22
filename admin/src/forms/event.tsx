import clsx from "clsx"
import dayjs from "dayjs"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { TwirpError } from "twirp-ts"

import { ErrorMessage } from "@hookform/error-message"

import { useClient } from "../client"
import { eventRoute } from "../router"
import { Event as Evt, EventDate } from "../rpc"
import { Alert } from "../units/alert"
import { Badge } from "../units/badge"
import { Button } from "../units/button"

type EventFormProps = {
  // event is only present on update
  event?: Evt
}

function EventDatesField({ control }: { control: any }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "dates",
  })

  const addDate: React.EventHandler<React.MouseEvent> = (e) => {
    e.preventDefault()
    append({ uid: "", value: "", cancelled: false })
  }

  const removeDate = (idx: number) => (e: React.MouseEvent) => {
    e.preventDefault()
    remove(idx)
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {fields.map((item, idx) => {
        const inputClassName = clsx("rounded-md border-2 border-slate-200 px-2 py-1 focus:drop-shadow grow mr-4", {
          "bg-gray-200 text-gray-600 opacity-40": item.cancelled,
        })
        return (
          <div key={item.id} className="flex justify-between">
            <Controller
              render={({ field }: any) => (
                <input type="datetime-local" {...field} disabled={item.cancelled} className={inputClassName} required />
              )}
              name={`dates.${idx}.value`}
              control={control}
            />
            {item.cancelled ? (
              <Badge variant="gray">Cancelled</Badge>
            ) : (
              <Button color="white" className="px-2" onClick={removeDate(idx)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            )}
          </div>
        )
      })}
      <Button color="white" onClick={addDate}>
        Add Date
      </Button>
    </div>
  )
}

function formValuesFromEventDates(eventDates: EventDate[]): EventDate[] {
  return eventDates.map((d) => ({
    ...d,
    value: dayjs(d.value).format("YYYY-MM-DDTHH:mm"),
  }))
}

export function EventForm({ event }: EventFormProps) {
  const { handleSubmit, register, formState, control, setError } = useForm({
    defaultValues: {
      ...event,
      dates: event !== undefined ? formValuesFromEventDates(event.dates) : [{ uid: "", value: "", cancelled: false }],
    },
  })
  const client = useClient()
  const navigate = useNavigate()

  async function onSubmit(data: any) {
    // TODO(aarongodin): improve this?
    const payload: Evt = {
      ...data,
      dates: data.dates.map((d: EventDate) => ({
        ...d,
        value: dayjs(d.value).toISOString(),
      })),
    }
    try {
      const resp = event === undefined ? await client.CreateEvent(payload) : await client.UpdateEvent(payload)
      navigate(eventRoute(resp.name))
    } catch (err) {
      const message = err instanceof TwirpError ? err.message : (err as Error).message
      setError("root.submit", { type: "custom", message })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* <div className="grid grid-cols-2 gap-6">
        <h3 className="mb-4">Basic Information</h3>
        <h3 className="mb-4">Dates</h3>
      </div> */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="mb-4 px-4 md:p-0">Basic Information</h3>
          <div className="grid grid-cols-3 gap-2 md:gap-4 bg-white p-4 md:rounded-lg drop-shadow">
            <label className="flex items-center md:justify-end text-sm text-gray-800" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              className="col-span-3 md:col-span-2 rounded-md border-2 border-slate-200 px-2 py-1 focus:drop-shadow disabled:bg-gray-100 disabled:text-gray-400"
              disabled={event !== undefined}
              {...register("name", { required: true })}
              required
            />
            <label className="flex items-center md:justify-end text-sm text-gray-800" htmlFor="title">
              Title
            </label>
            <input
              id="title"
              className="col-span-3 md:col-span-2 rounded-md border-2 border-slate-200 px-2 py-1 focus:drop-shadow"
              {...register("title", { required: true })}
              required
            />
            <label className="flex items-start md:justify-end text-sm text-gray-800 mt-1" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              className="col-span-3 md:col-span-2 rounded-md border-2 border-slate-200 px-2 py-1 focus:drop-shadow"
              {...register("description")}
            />
            <span className="hidden md:[display:inherit] flex items-center md:justify-end text-sm text-gray-800">
              Hidden
            </span>
            <label htmlFor="hidden" className="col-span-3 md:col-span-2 flex items-center gap-x-2">
              <input id="hidden" type="checkbox" {...register("hidden", { value: true })} className="w-4 h-4" />
              <span className="text-sm">Hide this event in the event listing</span>
            </label>
            <span className="hidden md:[display:inherit] flex items-center md:justify-end text-sm text-gray-800">
              Closed
            </span>
            <label htmlFor="closed" className="col-span-3 md:col-span-2 flex items-center gap-x-2">
              <input id="closed" type="checkbox" {...register("closed")} className="w-4 h-4" />
              <span className="text-sm">Close registrations for this event</span>
            </label>
          </div>
        </div>
        <div>
          <h3 className="mb-4 px-4 md:p-0">Dates</h3>
          <div className="bg-white p-4 md:rounded-lg drop-shadow">
            <EventDatesField control={control} />
          </div>
        </div>
      </div>
      <ErrorMessage
        name="root.submit"
        errors={formState.errors}
        render={({ message }) => <Alert variant="error" title="Error" content={message} />}
      />

      <div className="mt-4 px-4 p-0">
        <Button color="primary" disabled={formState.isSubmitting}>
          Save Event
        </Button>
      </div>
    </form>
  )
}

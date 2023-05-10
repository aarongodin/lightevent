import { Fragment } from "react"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"

import { useClient } from "../client"
import { eventRoute } from "../router"
import { Event as Evt } from "../rpc"
import { Button } from "../units/button"

type EventFormProps = {
  // event is only present on update
  event?: Evt
}

function EventDatesField({ control }: { control: any }) {
  const { fields, append } = useFieldArray({
    control,
    name: "dates",
  })

  const addDate: React.EventHandler<React.MouseEvent> = (e) => {
    e.preventDefault()
    append({ id: "", value: "" })
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {fields.map((item, idx) => {
        return (
          <Fragment key={item.id}>
            <Controller
              render={({ field }: any) => <input {...field} type="hidden" />}
              name={`dates.${idx}.id`}
              control={control}
            />
            <Controller
              render={({ field }: any) => (
                <input
                  {...field}
                  className="rounded-md border-2 border-slate-200 px-2 py-1 focus:drop-shadow"
                  required
                />
              )}
              name={`dates.${idx}.value`}
              control={control}
            />
          </Fragment>
        )
      })}
      <Button color="white" onClick={addDate}>
        Add Date
      </Button>
    </div>
  )
}

export function EventForm({ event }: EventFormProps) {
  const { handleSubmit, register, formState, control } = useForm({
    defaultValues: {
      ...event,
      dates: event !== undefined ? event.dates : [{ id: "", value: "" }],
    },
  })
  const client = useClient()
  const navigate = useNavigate()

  async function onSubmit(data: any) {
    const resp = event === undefined ? await client.CreateEvent(data) : await client.UpdateEvent(data)
    navigate(eventRoute(resp.name))
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-2 gap-6">
        <h3 className="mb-4">Basic Information</h3>
        <h3 className="mb-4">Dates</h3>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <div className="grid grid-cols-3 gap-4 max-w-xl bg-white p-4 rounded-lg drop-shadow">
            <label className="flex items-center justify-end text-sm text-gray-800" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              className="col-span-2 rounded-md border-2 border-slate-200 px-2 py-1 focus:drop-shadow disabled:bg-gray-100 disabled:text-gray-400"
              disabled={event !== undefined}
              {...register("name", { required: true })}
              required
            />
            <label className="flex items-center justify-end text-sm text-gray-800" htmlFor="title">
              Title
            </label>
            <input
              id="title"
              className="col-span-2 rounded-md border-2 border-slate-200 px-2 py-1 focus:drop-shadow"
              {...register("title", { required: true })}
              required
            />
            <span className="flex items-center justify-end text-sm text-gray-800">Hidden</span>
            <label htmlFor="hidden" className="col-span-2 flex items-center gap-x-2">
              <input id="hidden" type="checkbox" {...register("hidden")} className="w-4 h-4" />
              <span className="text-sm">Hide this event in the event listing</span>
            </label>
            <span className="flex items-center justify-end text-sm text-gray-800">Closed</span>
            <label htmlFor="closed" className="col-span-2 flex items-center gap-x-2">
              <input id="closed" type="checkbox" {...register("closed")} className="w-4 h-4" />
              <span className="text-sm">Close registrations for this event</span>
            </label>
          </div>
        </div>
        <div>
          <div className="max-w-xl bg-white p-4 rounded-lg drop-shadow">
            <EventDatesField control={control} />
          </div>
        </div>
      </div>
      <div className="mt-4">
        <Button color="primary" disabled={formState.isSubmitting}>
          Save Event
        </Button>
      </div>
    </form>
  )
}

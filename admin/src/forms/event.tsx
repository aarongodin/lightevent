import { useForm } from "react-hook-form"

import { Event } from "../rpc"

type EventFormProps = {
  // event is only present on update
  event?: Event
}

export function EventForm({ event }: EventFormProps) {
  const { handleSubmit, register } = useForm()
  async function onSubmit(data: any) {
    console.log("submit!", data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-2 gap-6">
        <div className="grid grid-cols-3 gap-x-10 gap-y-4 max-w-xl bg-white p-4 rounded-lg">
          <label className="flex items-center justify-end text-sm text-gray-800" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            className="col-span-2 rounded-md border-2 border-slate-200 px-2 py-1 focus:drop-shadow"
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
          <label htmlFor="hidden" className="col-span-2">
            <input
              id="hidden"
              type="checkbox"
              {...register("hidden")}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm">Hide this event in the event listing</span>
          </label>
          <span className="flex items-center justify-end text-sm text-gray-800">Closed</span>
          <label htmlFor="closed" className="col-span-2">
            <input id="closed" type="checkbox" {...register("closed")} />
            <span className="text-sm">Close registrations for this event</span>
          </label>
        </div>
        <div className="">test</div>
      </div>
    </form>
  )
}

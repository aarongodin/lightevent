import dayjs from "../../dayjs"
import { useRouter } from "../../router"
import { Event as Evt, EventDate } from "../../rpc"
import { Button } from "../../units/button"

function EventDatesSummary({ eventDates }: { eventDates: EventDate[] }) {
  const firstDateFormatted = dayjs(eventDates[0].value).format("LLL")

  if (eventDates.length === 1) {
    return <span>{firstDateFormatted}</span>
  }

  const lastDateFormatted = dayjs(eventDates[0].value).format("LLL")
  return (
    <div className="inline-flex gap-2">
      <span>{firstDateFormatted}</span>
      <span>{lastDateFormatted}</span>
    </div>
  )
}

export function EventView({ event, hideActions }: { event: Evt; hideActions?: boolean }) {
  const router = useRouter()
  function handleRegister() {
    router.navigate({
      name: "register",
      data: {
        eventName: event.name,
      },
    })
  }

  return (
    <div className="grid grid-cols-3 gap-x-4 border-b border-gray-200 pb-6 mb-6 last:border-0 last:mb-0 last:pb-0">
      <div className="col-span-2 flex flex-col justify-between">
        <h2 className="text-lg font-light">{event.name}</h2>
        <p className="text-gray-600 text-sm leading-5 mt-4">{event.description}</p>
      </div>
      <div className="col-span-1 flex flex-col justify-between items-end">
        <EventDatesSummary eventDates={event.dates} />
        {!hideActions && (
          <Button className="mt-4" color="primary" onClick={handleRegister}>
            Register
          </Button>
        )}
      </div>
    </div>
  )
}

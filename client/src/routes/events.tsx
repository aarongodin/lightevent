import { useEffect, useState } from "preact/hooks"

import { useClient } from "../client"
import { Page } from "../router"
import { EventList } from "../rpc"
import { EventView } from "./views/events"

const EventsRoute: Page = () => {
  const [events, setEvents] = useState<EventList["events"]>([])
  const [loading, setLoading] = useState(true)
  const client = useClient()

  useEffect(() => {
    setLoading(true)
    client.ListEvents({}).then((resp) => {
      setEvents(resp.events)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return <div>...loading</div>
  }

  return (
    <>
      {events.map((event) => (
        <EventView key={event.name} event={event} />
      ))}
    </>
  )
}

export default EventsRoute

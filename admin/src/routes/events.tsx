import { DateTime } from "luxon"

import { WithRequest } from "../client"
import { eventRoute, newEventRoute } from "../router"
import { EventDate, EventList } from "../rpc"
import { Badge } from "../units/badge"
import { LinkButton } from "../units/button"
import { Content } from "../units/content"
import { TableLoader } from "../units/loader"
import { PageTitle } from "../units/page-title"

const WithEventList = WithRequest<EventList>

type EventsTableProps = {
  events: EventList["events"]
}

function EventDates({ eventDates }: { eventDates: EventDate[] }) {
  const firstDate = DateTime.fromISO(eventDates[0].value).toLocaleString(DateTime.DATETIME_MED)
  if (eventDates.length === 1) {
    return <span>{firstDate}</span>
  }

  return (
    <span>
      {firstDate} <span className="italic">and {eventDates.length - 1} more</span>
    </span>
  )
}

function EventsTable({ events }: EventsTableProps) {
  const rows = events.map((evt, idx) => {
    const className = `${idx % 2 == 1 && "bg-gray-50"} p-2`
    return (
      <tr key={evt.name} className={className}>
        <td className="p-4 text-left">{evt.title}</td>
        <td className="p-4 text-left text-sm">
          <EventDates eventDates={evt.dates} />
        </td>
        <td className="p-4 text-center flex justify-center gap-2">
          {evt.hidden && <Badge content="Hidden" />}
          {evt.closed && <Badge content="Closed" />}
          {!evt.hidden && <Badge content="Visible" />}
          {!evt.closed && <Badge content="Open" />}
        </td>
        <td className="p-4 text-right text-xs">
          <LinkButton color="white" to={eventRoute(evt.name)}>
            View
          </LinkButton>
        </td>
      </tr>
    )
  })

  return (
    <table className="bg-white w-full rounded-lg drop-shadow">
      <thead className="text-xs bg-gray-50 text-gray-800">
        <tr>
          <th className="px-4 py-2 text-left w-1/3">Event Title</th>
          <th className="px-4 py-2 text-left w-1/3">Event Dates</th>
          <th className="px-4 py-2 text-center">Status</th>
          <th></th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  )
}

function ExternalActions() {
  return <LinkButton to={newEventRoute}>New Event</LinkButton>
}

export default function Events() {
  return (
    <>
      <PageTitle title="Events" externalActions={<ExternalActions />} />
      <Content>
        <WithEventList
          load={(client) => client.ListEvents({ hidden: false, closed: false })}
          deps={[]}
          loader={TableLoader}
        >
          {(resp) => <EventsTable events={resp.events} />}
        </WithEventList>
      </Content>
    </>
  )
}

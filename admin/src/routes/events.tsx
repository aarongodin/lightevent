import { WithRequest } from "../client"
import dayjs from "../dayjs"
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

function EventDatesSummary({ eventDates }: { eventDates: EventDate[] }) {
  const firstDateFormatted = dayjs(eventDates[0].value).format("l LT")

  if (eventDates.length === 1) {
    return <span>{firstDateFormatted}</span>
  }

  const lastDateFormatted = dayjs(eventDates[0].value).format("l LT")
  return (
    <div className="inline-flex gap-2">
      <span>{firstDateFormatted}</span>
      <span>{lastDateFormatted}</span>
    </div>
  )
}

function EventsTable({ events }: EventsTableProps) {
  const rows = events.map((evt, idx) => {
    const className = `${idx % 2 == 1 && "bg-gray-50"} p-2`
    return (
      <tr key={evt.name} className={className}>
        <td className="p-4 text-left">{evt.title}</td>
        <td className="p-4 text-left text-sm">
          <EventDatesSummary eventDates={evt.dates} />
        </td>
        <td className="p-4 text-center flex justify-center gap-2">
          {evt.hidden && <Badge variant="gray">Hidden</Badge>}
          {evt.closed && <Badge variant="gray">Closed</Badge>}
          {!evt.hidden && <Badge variant="gray">Visible</Badge>}
          {!evt.closed && <Badge variant="gray">Open</Badge>}
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

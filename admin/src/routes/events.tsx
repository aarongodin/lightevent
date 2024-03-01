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
      <span className="after:content-['—'] after:ml-2">{firstDateFormatted}</span>
      <span>{lastDateFormatted}</span>
    </div>
  )
}

function EventsTable({ events }: EventsTableProps) {
  if (events.length === 0) {
    return (
      <div className="bg-gray-50 w-full rounded-lg h-32 flex items-center justify-center text-sm text-gray-600">
        No events found.
      </div>
    )
  }
  const rows = events.map((evt) => {
    return (
      <tr key={evt.name} className="border-b last:border-0 text-sm">
        <td className="px-4 py-3">{evt.name}</td>
        <td className="px-4 py-3">{evt.title}</td>
        <td className="px-4 py-3">
          <EventDatesSummary eventDates={evt.dates} />
        </td>
        <td className="px-4 py-3 flex gap-2">
          {evt.hidden && <Badge variant="gray">Hidden</Badge>}
          {evt.closed && <Badge variant="gray">Closed</Badge>}
          {!evt.hidden && <Badge variant="gray">Visible</Badge>}
          {!evt.closed && <Badge variant="gray">Open</Badge>}
        </td>
        <td className="px-4 py-3 text-right">
          <LinkButton color="white" size="small" to={eventRoute(evt.name)}>
            View
          </LinkButton>
        </td>
      </tr>
    )
  })

  return (
    <div className="overflow-x-auto drop-shadow">
      <table className="bg-white w-full md:rounded-lg min-w-max">
        <thead className="text-xs bg-gradient-to-r from-gray-50 to-slate-50 text-gray-500 border-b">
          <tr>
            <th className="px-4 py-2 text-left rounded-tl-lg">Name</th>
            <th className="px-4 py-2 text-left">Title</th>
            <th className="px-4 py-2 text-left">Dates</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="rounded-tr-lg"></th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
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

import { useQuery } from "@connectrpc/connect-query"
import { Link } from "react-router"

import type { EventDateSummary } from "../gen/lightevent/v1/service_pb"
import { RegistrationKind } from "../gen/lightevent/v1/service_pb"
import { formatCapacity, formatDateTime } from "../lib/format"
import { LightEventService } from "../lib/rpc"
import { eventRoute, newEventRoute } from "../router"
import { Badge } from "../units/badge"
import { LinkButton } from "../units/button"
import { Box, Content, Section } from "../units/layout"
import { PageTitle } from "../units/page-title"
import { Query } from "../units/query"
import { EmptyState } from "../units/table"
import { RegistrationKindBadge } from "../units/values"

function DateCard({ summary }: { summary: EventDateSummary }) {
  const { event, eventDate } = summary
  if (!event || !eventDate) {
    return null
  }
  const total = summary.onceCount + summary.seriesCount
  const full = event.capacity > 0 && total >= event.capacity
  return (
    <Box className="flex flex-col gap-3">
      <div>
        <Link to={eventRoute(event.name)} className="font-semibold hover:underline">
          {event.title}
        </Link>
        <p className="mt-1 text-sm text-gray-600">{formatDateTime(eventDate.value)}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {eventDate.cancelled && <Badge variant="red">Cancelled</Badge>}
        {full && !eventDate.cancelled && <Badge variant="amber">Full</Badge>}
        {event.hidden && <Badge variant="gray">Hidden</Badge>}
        {event.closed && <Badge variant="gray">Closed</Badge>}
      </div>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="text-gray-700">
          <span className="font-semibold">{formatCapacity(total, event.capacity)}</span> registered
        </span>
        <span className="inline-flex gap-1">
          <RegistrationKindBadge kind={RegistrationKind.ONCE} count={summary.onceCount} />
          <RegistrationKindBadge kind={RegistrationKind.SERIES} count={summary.seriesCount} />
        </span>
      </div>
    </Box>
  )
}

export default function Dashboard() {
  const query = useQuery(LightEventService.method.listUpcomingEventDates, { limit: 8 })
  return (
    <>
      <PageTitle title="Dashboard" actions={<LinkButton to={newEventRoute}>New event</LinkButton>} />
      <Content>
        <Section title="Upcoming dates">
          <Query query={query}>
            {(resp) =>
              resp.eventDates.length === 0 ? (
                <EmptyState action={<LinkButton to={newEventRoute}>Create an event</LinkButton>}>
                  There are no upcoming event dates.
                </EmptyState>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {resp.eventDates.map((summary) => (
                    <DateCard key={summary.eventDate?.uid} summary={summary} />
                  ))}
                </div>
              )
            }
          </Query>
        </Section>
      </Content>
    </>
  )
}

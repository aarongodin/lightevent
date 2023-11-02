import { WithRequest } from "../client"
import dayjs from "../dayjs"
import { eventRoute } from "../router"
import { EventDateList, EventDateSummary, RegistrationKind } from "../rpc"
import { Box } from "../units/box"
import { LinkButton } from "../units/button"
import { Content } from "../units/content"
import { TableLoader } from "../units/loader"
import { PageTitle } from "../units/page-title"
import { RegistrationKindBadge } from "../units/value"

const WithEventDates = WithRequest<EventDateList>

function EventSummary({ summary }: { summary: EventDateSummary }) {
  if (summary.event === undefined || summary.eventDate === undefined) {
    return null // TODO(aarongodin): consider improving this, it's the fact that using a message as a value in protobuf means it is optional
  }

  let onceCount = 0
  let seriesCount = 0

  summary.registrations.forEach((reg) => {
    if (reg.kind === RegistrationKind.REG_ONCE) {
      onceCount++
    } else {
      seriesCount++
    }
  })

  return (
    <div>
      <p className="font-lg font-bold block">{summary.event.title}</p>
      <p className="mt-2">{dayjs(summary.eventDate.value).format("l LT")}</p>
      <div className="mt-4 flex items-center justify-between gap-2">
        <span className="inline-flex gap-2">
          <RegistrationKindBadge kind={RegistrationKind.REG_ONCE} count={onceCount} />
          <RegistrationKindBadge kind={RegistrationKind.REG_SERIES} count={seriesCount} />
        </span>
        <LinkButton color="white" to={eventRoute(summary.event.name)}>
          View Details
        </LinkButton>
      </div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <>
      <PageTitle title="Overview" />
      <Content>
        <h3 className="mb-4">Upcoming Events</h3>
        <WithEventDates load={(client) => client.ListEventDates({ count: 4 })} deps={[]} loader={TableLoader}>
          {(resp) => (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {resp.eventDates.map((summary) => (
                <Box key={summary.eventDate?.uid}>
                  <EventSummary summary={summary} />
                </Box>
              ))}
            </div>
          )}
        </WithEventDates>
      </Content>
    </>
  )
}

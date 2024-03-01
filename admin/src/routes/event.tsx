import { useParams } from "react-router-dom"

import { useClient, WithRequest } from "../client"
import dayjs from "../dayjs"
import { usePrompt } from "../prompt"
import { editEventRoute, newEventRegistrationRoute } from "../router"
import { Event as Evt, EventDate, RegistrationList } from "../rpc"
import { Badge } from "../units/badge"
import { Button, LinkButton } from "../units/button"
import { Content } from "../units/content"
import { DefinitionListItem } from "../units/list"
import { TableLoader } from "../units/loader"
import { PageTitle } from "../units/page-title"
import { boolToString, formatConfCode, formatRegistrationKind, RegistrationKindBadge } from "../units/value"

const WithEvent = WithRequest<Evt>
const WithEventRegistrations = WithRequest<RegistrationList>

function EventView({ evt, reload }: { evt: Evt; reload: () => void }) {
  const prompt = usePrompt()
  const client = useClient()
  function cancelEventDate(eventDate: EventDate) {
    return () => {
      prompt
        .confirm(
          `This will cancel the event date on ${dayjs(eventDate.value).format(
            "l LT",
          )}. You cannot undo a cancellation, are you sure you would like to cancel?`,
        )
        .then(({ ok }) => {
          if (ok) {
            client
              .CancelEventDate({
                eventDateUid: eventDate.uid,
              })
              .then(() => {
                reload()
              })
          }
        })
    }
  }

  const dates = evt.dates.map((date) => {
    const data = date.cancelled ? (
      <Badge variant="gray">Cancelled</Badge>
    ) : (
      <Button color="secondary" size="small" onClick={cancelEventDate(date)}>
        Cancel
      </Button>
    )
    return (
      <DefinitionListItem
        dtValue={true}
        key={date.value}
        title={dayjs(date.value).format("l LT")}
        data={data}
        variant="flex"
      />
    )
  })

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 className="mb-4 px-4 p-0">Basic Information</h3>
        <dl className="drop-shadow">
          <DefinitionListItem variant="grid" title="Name" data={evt.name} />
          <DefinitionListItem variant="grid" title="Title" data={evt.title} />
          <DefinitionListItem variant="grid" title="Description" data={evt.description} />
          <DefinitionListItem variant="grid" title="Hidden" data={boolToString(evt.hidden)} />
          <DefinitionListItem variant="grid" title="Closed" data={boolToString(evt.closed)} />
        </dl>
      </div>
      <div>
        <h3 className="mb-4 px-4 md:p-0">Dates</h3>
        <div className="drop-shadow">{dates}</div>
      </div>
    </div>
  )
}

type EventRegistrationsTableProps = {
  registrations: RegistrationList["registrations"]
}

function EventRegistrationsTable({ registrations }: EventRegistrationsTableProps) {
  if (registrations.length === 0) {
    return (
      <div className="bg-gray-50 w-full md:rounded-lg h-32 flex items-center justify-center text-sm text-gray-600">
        No registrations.
      </div>
    )
  }

  const rows = registrations.map((reg) => {
    return (
      <tr key={reg.confCode} className="border-b last:border-0">
        <td className="p-4 py-3 text-left">
          {reg.member?.firstName} {reg.member?.lastName}
        </td>
        <td className="p-4 py-3 text-left">{reg.member?.email}</td>
        <td className="p-4 py-3 text-left">
          <RegistrationKindBadge kind={reg.kind}>{formatRegistrationKind(reg.kind)}</RegistrationKindBadge>
        </td>
        <td className="p-4 py-3 text-left text-sm">
          {reg.eventDate !== undefined ? dayjs(reg.eventDate.value).format("l LT") : "-"}
          {reg.eventDate?.cancelled && (
            <Badge variant="gray" className="ml-2">
              Cancelled
            </Badge>
          )}
        </td>
        <td className="p-4 py-3 text-right text-sm font-mono">{formatConfCode(reg.confCode)}</td>
      </tr>
    )
  })

  return (
    <div className="overflow-x-auto drop-shadow">
      <table className="bg-white w-full md:rounded-lg min-w-max">
        <thead className="text-xs bg-gradient-to-r from-gray-50 to-slate-50 text-gray-500 border-b">
          <tr>
            <th className="px-4 py-2 text-left md:rounded-tl-lg">Member Name</th>
            <th className="px-4 py-2 text-left">Member Email</th>
            <th className="px-4 py-2 text-left">Registration Kind</th>
            <th className="px-4 py-2 text-left">Event Date</th>
            <th className="px-4 py-2 text-right md:rounded-tr-lg">Conf Code</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  )
}

function ExternalActions({ eventName }: { eventName: string }) {
  return (
    <>
      <LinkButton color="white" to={newEventRegistrationRoute(eventName)}>
        Add Registration
      </LinkButton>
      <LinkButton to={editEventRoute(eventName)}>Edit Event</LinkButton>
    </>
  )
}

export default function Event() {
  const params = useParams<{ eventName: string }>()
  const eventName = params.eventName as string

  return (
    <>
      <PageTitle title="Event" externalActions={<ExternalActions eventName={eventName} />} />
      <Content>
        <WithEvent load={(client) => client.GetEvent({ name: eventName })} deps={[eventName]} loader={TableLoader}>
          {(resp, _, reload) => <EventView evt={resp} reload={reload} />}
        </WithEvent>
        <div className="mt-8">
          <h3 className="mb-4 px-4 p-0">Registrations</h3>
          <WithEventRegistrations
            load={(client) => client.ListEventRegistrations({ eventName })}
            deps={[eventName]}
            loader={TableLoader}
          >
            {(resp) => <EventRegistrationsTable registrations={resp.registrations} />}
          </WithEventRegistrations>
        </div>
      </Content>
    </>
  )
}

import { useParams } from "react-router-dom"

import { useClient, WithRequest } from "../client"
import dayjs from "../dayjs"
import { usePrompt } from "../prompt"
import { editEventRoute, newEventRegistrationRoute } from "../router"
import { Event as Evt, EventDate, RegistrationList } from "../rpc"
import { LinkButton } from "../units/button"
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

  const dates = evt.dates.map((date, idx) => {
    const data = date.cancelled ? (
      "Cancelled"
    ) : (
      <button className="text-sky-700 hover:text-sky-600" onClick={cancelEventDate(date)}>
        Cancel
      </button>
    )
    return (
      <DefinitionListItem
        key={date.value}
        stripe={idx % 2 !== 0}
        title={dayjs(date.value).format("l LT")}
        data={data}
        variant="flex"
      />
    )
  })

  return (
    <div className="grid grid-cols-2 gap-6">
      <dl className="drop-shadow">
        <DefinitionListItem variant="grid" title="Name" data={evt.name} />
        <DefinitionListItem variant="grid" stripe title="Title" data={evt.title} />
        <DefinitionListItem variant="grid" title="Description" data={evt.description} />
        <DefinitionListItem variant="grid" stripe title="Hidden" data={boolToString(evt.hidden)} />
        <DefinitionListItem variant="grid" title="Closed" data={boolToString(evt.closed)} />
      </dl>
      <div className="drop-shadow">{dates}</div>
    </div>
  )
}

type EventRegistrationsTableProps = {
  registrations: RegistrationList["registrations"]
}

function EventRegistrationsTable({ registrations }: EventRegistrationsTableProps) {
  const rows = registrations.map((reg, idx) => {
    const className = `${idx % 2 == 1 && "bg-gray-50"} p-2`
    return (
      <tr key={reg.confCode} className={className}>
        <td className="p-4 text-left">
          {reg.member?.firstName} {reg.member?.lastName}
        </td>
        <td className="p-4 text-left">{reg.member?.email}</td>
        <td className="p-4 text-left">
          <RegistrationKindBadge kind={reg.kind}>{formatRegistrationKind(reg.kind)}</RegistrationKindBadge>
        </td>
        <td className="p-4 text-left text-sm">
          {reg.eventDate !== undefined ? dayjs(reg.eventDate.value).format("l LT") : "-"}
        </td>
        <td className="p-4 text-right text-sm font-mono">{formatConfCode(reg.confCode)}</td>
      </tr>
    )
  })

  return (
    <table className="bg-white w-full rounded-lg drop-shadow">
      <thead className="text-xs bg-gray-50 text-gray-800">
        <tr>
          <th className="px-4 py-2 text-left">Member Name</th>
          <th className="px-4 py-2 text-left">Member Email</th>
          <th className="px-4 py-2 text-left">Registration Kind</th>
          <th className="px-4 py-2 text-left">Event Date</th>
          <th className="px-4 py-2 text-right">Conf Code</th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
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
        <div className="grid grid-cols-2 gap-6">
          <h3 className="mb-4">Basic Information</h3>
          <h3 className="mb-4">Dates</h3>
        </div>
        <WithEvent load={(client) => client.GetEvent({ name: eventName })} deps={[eventName]} loader={TableLoader}>
          {(resp, _, reload) => <EventView evt={resp} reload={reload} />}
        </WithEvent>
        <div className="mt-4">
          <h3 className="mb-4">Registrations</h3>
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

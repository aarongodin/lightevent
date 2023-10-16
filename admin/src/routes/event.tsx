import { DateTime } from "luxon"
import { useParams } from "react-router-dom"

import { WithRequest } from "../client"
import { formatRegistrationKind } from "../domain/registration"
import { editEventRoute, newEventRegistrationRoute } from "../router"
import { Event as Evt, RegistrationKind, registrationKindFromJSON, RegistrationList } from "../rpc"
import { LinkButton } from "../units/button"
import { Content } from "../units/content"
import { TableLoader } from "../units/loader"
import { PageTitle } from "../units/page-title"
import { boolToString } from "../units/value"

const WithEvent = WithRequest<Evt>
const WithEventRegistrations = WithRequest<RegistrationList>

function EventView({ evt }: { evt: Evt }) {
  // TODO(aarongodin): turn the below into a unit
  const dates = evt.dates.map((date, idx) => {
    const classNames = ["p-4 text-sm text-gray-900 flex justify-between"]
    classNames.push(idx % 2 == 0 ? "bg-white" : "bg-gray-50")
    return (
      <div key={date.id} className={classNames.join(" ")}>
        <div>{DateTime.fromISO(date.value).toLocaleString(DateTime.DATETIME_MED)}</div>
        <div>
          <button className="text-sky-700 hover:text-sky-600">Modify</button>
        </div>
      </div>
    )
  })

  return (
    // TODO(aarongodin): fix repetition below
    <div className="grid grid-cols-2 gap-6">
      <dl className="drop-shadow">
        <div className="bg-white p-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt className="text-sm font-medium text-gray-500">Name</dt>
          <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 font-mono text-sm">{evt.name}</dd>
        </div>
        <div className="bg-gray-50 p-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt className="text-sm font-medium text-gray-500">Title</dt>
          <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{evt.title}</dd>
        </div>
        <div className="bg-white p-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt className="text-sm font-medium text-gray-500">Hidden</dt>
          <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{boolToString(evt.hidden)}</dd>
        </div>
        <div className="bg-gray-50 p-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt className="text-sm font-medium text-gray-500">Closed</dt>
          <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{boolToString(evt.closed)}</dd>
        </div>
      </dl>
      <div className="drop-shadow">{dates}</div>
    </div>
  )
}

type EventRegistrationsViewProps = {
  registrations: RegistrationList["registrations"]
}

function EventRegistrationsView({ registrations }: EventRegistrationsViewProps) {
  return <RegistrationsTable registrations={registrations} />
}

type RegistrationsTableProps = {
  registrations: RegistrationList["registrations"]
}

function RegistrationsTable({ registrations }: RegistrationsTableProps) {
  const rows = registrations.map((reg, idx) => {
    const className = `${idx % 2 == 1 && "bg-gray-50"} p-2`
    return (
      <tr key={reg.confCode} className={className}>
        <td className="p-4 text-left">
          {reg.member?.firstName} {reg.member?.lastName}
        </td>
        <td className="p-4 text-left">{reg.member?.email}</td>
        <td className="p-4 text-left text-sm">{formatRegistrationKind(registrationKindFromJSON(reg.kind))}</td>
        <td className="p-4 text-right text-xs font-mono">{reg.confCode}</td>
      </tr>
    )
  })

  return (
    <table className="bg-white w-full rounded-lg drop-shadow">
      <thead className="text-xs bg-gray-50 text-gray-800">
        <tr>
          <th className="px-4 py-2 text-left w-1/3">Member Name</th>
          <th className="px-4 py-2 text-left w-1/3">Member Email</th>
          <th className="px-4 py-2 text-left w-1/3">Registration Kind</th>
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
          {(resp) => <EventView evt={resp} />}
        </WithEvent>
        <div className="mt-4">
          <h3 className="mb-4">Registrations</h3>

          <WithEventRegistrations
            load={(client) => client.ListEventRegistrations({ eventName })}
            deps={[eventName]}
            loader={TableLoader}
          >
            {(resp) => <EventRegistrationsView registrations={resp.registrations} />}
          </WithEventRegistrations>
        </div>
      </Content>
    </>
  )
}

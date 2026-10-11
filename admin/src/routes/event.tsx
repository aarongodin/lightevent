import { useMutation, useQuery } from "@connectrpc/connect-query"
import { Link, useNavigate, useParams } from "react-router"

import type { EventDate, Event as Evt, Registration } from "../gen/lightevent/v1/service_pb"
import { formatCapacity, formatConfCode, formatDateTime, formatName, isPast } from "../lib/format"
import { errorMessage, invalidateAll, LightEventService } from "../lib/rpc"
import { editEventRoute, eventsRoute, memberRoute, newEventRegistrationRoute } from "../router"
import { Badge } from "../units/badge"
import { Button, LinkButton } from "../units/button"
import { useConfirm } from "../units/confirm"
import { Content, Section } from "../units/layout"
import { DefinitionList } from "../units/list"
import { PageTitle } from "../units/page-title"
import { Query } from "../units/query"
import { EmptyState, Table, Td } from "../units/table"
import { useToast } from "../units/toast"
import { RegistrationKindBadge } from "../units/values"
import { EventStatusBadges } from "./event-status"
import NotFound from "./not-found"

function EventTags({ names }: { names: string[] }) {
  const tags = useQuery(LightEventService.method.listTags, {})
  const labels = new Map(tags.data?.tags.map((t) => [t.name, t.label]))
  return (
    <span className="flex flex-wrap gap-1">
      {names.map((name) => (
        <Badge key={name} variant="gray">
          {labels.get(name) ?? name}
        </Badge>
      ))}
    </span>
  )
}

function DateRow({ event, date }: { event: Evt; date: EventDate }) {
  const confirm = useConfirm()
  const toast = useToast()
  const cancelDate = useMutation(LightEventService.method.cancelEventDate)
  const past = isPast(date.value)
  const full = event.capacity > 0 && date.registrationCount >= event.capacity

  async function onCancel() {
    const { ok } = await confirm({
      title: "Cancel this date?",
      message: `${formatDateTime(date.value)} will be marked as cancelled and will no longer accept registrations. This cannot be undone.`,
      confirmLabel: "Cancel date",
      danger: true,
    })
    if (!ok) {
      return
    }
    try {
      await cancelDate.mutateAsync({ eventDateUid: date.uid })
      toast.success("Date cancelled")
      await invalidateAll()
    } catch (err) {
      toast.error(errorMessage(err))
    }
  }

  return (
    <li className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
      <div>
        <div className={date.cancelled ? "text-gray-500 line-through" : undefined}>{formatDateTime(date.value)}</div>
        <div className="text-xs text-gray-500">{formatCapacity(date.registrationCount, event.capacity)} registered</div>
      </div>
      <div className="flex items-center gap-2">
        {date.cancelled && <Badge variant="red">Cancelled</Badge>}
        {!date.cancelled && full && <Badge variant="amber">Full</Badge>}
        {!date.cancelled && !past && (
          <Button color="white" size="small" onClick={onCancel} disabled={cancelDate.isPending}>
            Cancel date
          </Button>
        )}
      </div>
    </li>
  )
}

function DatesList({ event }: { event: Evt }) {
  const upcoming = event.dates.filter((d) => !isPast(d.value))
  const past = event.dates.filter((d) => isPast(d.value)).reverse()
  return (
    <div className="flex flex-col gap-4">
      {[
        { label: "Upcoming", dates: upcoming },
        { label: "Past", dates: past },
      ].map(
        (group) =>
          group.dates.length > 0 && (
            <div key={group.label}>
              <h3 className="mb-2 text-xs font-medium tracking-wide text-gray-500 uppercase">{group.label}</h3>
              <ul className="divide-y divide-gray-100 rounded-lg bg-white text-sm shadow-sm ring-1 ring-gray-200">
                {group.dates.map((date) => (
                  <DateRow key={date.uid} event={event} date={date} />
                ))}
              </ul>
            </div>
          ),
      )}
    </div>
  )
}

function RegistrationsTable({ registrations }: { registrations: Registration[] }) {
  const confirm = useConfirm()
  const toast = useToast()
  const deleteRegistration = useMutation(LightEventService.method.deleteRegistration)

  if (registrations.length === 0) {
    return <EmptyState>No registrations yet.</EmptyState>
  }

  async function onCancel(reg: Registration) {
    const { ok, checked } = await confirm({
      title: "Cancel registration?",
      message: `The registration ${formatConfCode(reg.confCode)} for ${reg.member?.email} will be cancelled.`,
      confirmLabel: "Cancel registration",
      danger: true,
      checkbox: { label: "Email the member about the cancellation", defaultChecked: true },
    })
    if (!ok) {
      return
    }
    try {
      await deleteRegistration.mutateAsync({ confCode: reg.confCode, notifyMember: checked })
      toast.success("Registration cancelled")
      await invalidateAll()
    } catch (err) {
      toast.error(errorMessage(err))
    }
  }

  return (
    <Table
      headers={[
        { label: "Member" },
        { label: "Kind" },
        { label: "Date" },
        { label: "Confirmation" },
        { label: "Registered" },
        { label: "Actions", className: "text-right" },
      ]}
    >
      {registrations.map((reg) => (
        <tr key={reg.confCode}>
          <Td>
            {reg.member && (
              <Link to={memberRoute(reg.member.uid)} className="font-medium text-blue-700 hover:underline">
                {formatName(reg.member.firstName, reg.member.lastName) || reg.member.email}
              </Link>
            )}
            <div className="text-xs text-gray-500">{reg.member?.email}</div>
          </Td>
          <Td>
            <RegistrationKindBadge kind={reg.kind} />
          </Td>
          <Td>
            {reg.eventDate ? (
              <span className="inline-flex items-center gap-2">
                {formatDateTime(reg.eventDate.value)}
                {reg.eventDate.cancelled && <Badge variant="red">Cancelled</Badge>}
              </span>
            ) : (
              <span className="text-gray-500">All dates</span>
            )}
          </Td>
          <Td className="font-mono text-xs">{formatConfCode(reg.confCode)}</Td>
          <Td className="text-xs text-gray-600">{formatDateTime(reg.createdAt)}</Td>
          <Td className="text-right">
            <Button color="white" size="small" onClick={() => onCancel(reg)}>
              Cancel
            </Button>
          </Td>
        </tr>
      ))}
    </Table>
  )
}

function EventActions({ event }: { event: Evt }) {
  const confirm = useConfirm()
  const toast = useToast()
  const navigate = useNavigate()
  const archive = useMutation(LightEventService.method.setEventArchived)
  const remove = useMutation(LightEventService.method.deleteEvent)

  async function onArchive() {
    const archived = !event.archived
    if (archived) {
      const { ok } = await confirm({
        title: "Archive event?",
        message: "Archived events are hidden from members and stop accepting registrations. You can restore it later.",
        confirmLabel: "Archive",
      })
      if (!ok) {
        return
      }
    }
    try {
      await archive.mutateAsync({ name: event.name, archived })
      toast.success(archived ? "Event archived" : "Event restored")
      await invalidateAll()
    } catch (err) {
      toast.error(errorMessage(err))
    }
  }

  async function onDelete() {
    const { ok } = await confirm({
      title: "Delete event?",
      message:
        "The event and its dates will be permanently deleted. Events with registrations must be archived instead.",
      confirmLabel: "Delete event",
      danger: true,
    })
    if (!ok) {
      return
    }
    try {
      await remove.mutateAsync({ name: event.name })
      toast.success("Event deleted")
      await invalidateAll()
      navigate(eventsRoute)
    } catch (err) {
      toast.error(errorMessage(err))
    }
  }

  return (
    <>
      <Button color="white" onClick={onDelete} disabled={remove.isPending}>
        Delete
      </Button>
      <Button color="white" onClick={onArchive} disabled={archive.isPending}>
        {event.archived ? "Restore" : "Archive"}
      </Button>
      {!event.archived && (
        <LinkButton color="white" to={newEventRegistrationRoute(event.name)}>
          Add registration
        </LinkButton>
      )}
      <LinkButton to={editEventRoute(event.name)}>Edit</LinkButton>
    </>
  )
}

function EventView({ event }: { event: Evt }) {
  const registrations = useQuery(LightEventService.method.listEventRegistrations, { eventName: event.name })
  return (
    <>
      <PageTitle
        title={event.title}
        subtitle={<span className="font-mono">{event.name}</span>}
        back={{ to: eventsRoute, label: "Events" }}
        actions={<EventActions event={event} />}
      />
      <Content>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Section title="Details">
            <DefinitionList
              items={[
                { title: "Status", value: <EventStatusBadges event={event} /> },
                { title: "Description", value: event.description },
                { title: "Tags", value: event.tags.length ? <EventTags names={event.tags} /> : "" },
                { title: "Capacity", value: event.capacity > 0 ? `${event.capacity} per date` : "Unlimited" },
                { title: "Created", value: formatDateTime(event.createdAt) },
                { title: "Last updated", value: formatDateTime(event.updatedAt) },
              ]}
            />
          </Section>
          <Section title="Dates">
            <DatesList event={event} />
          </Section>
        </div>
        <Section title="Registrations" className="mt-8">
          <Query query={registrations}>{(resp) => <RegistrationsTable registrations={resp.registrations} />}</Query>
        </Section>
      </Content>
    </>
  )
}

export default function EventRoute() {
  const { eventName = "" } = useParams()
  const query = useQuery(LightEventService.method.getEvent, { name: eventName })
  return (
    <Query query={query} notFound={<NotFound what="event" back={{ to: eventsRoute, label: "Back to events" }} />}>
      {(resp) => (resp.event ? <EventView event={resp.event} /> : null)}
    </Query>
  )
}

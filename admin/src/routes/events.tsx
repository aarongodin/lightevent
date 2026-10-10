import { useQuery } from "@connectrpc/connect-query"
import clsx from "clsx"
import { useEffect, useState } from "react"
import { Link } from "react-router"

import { type Event, EventFilter } from "../gen/lightevent/v1/service_pb"
import { formatDateTime, isPast } from "../lib/format"
import { useDebouncedValue, usePageParams } from "../lib/hooks"
import { LightEventService } from "../lib/rpc"
import { eventRoute, newEventRoute } from "../router"
import { LinkButton } from "../units/button"
import { inputClassName } from "../units/field"
import { Content } from "../units/layout"
import { PageTitle } from "../units/page-title"
import { Pagination } from "../units/pagination"
import { Query } from "../units/query"
import { EmptyState, Table, Td } from "../units/table"
import { EventStatusBadges } from "./event-status"

const PAGE_SIZE = 25

const filters = [
  { key: "upcoming", label: "Upcoming", value: EventFilter.UPCOMING },
  { key: "past", label: "Past", value: EventFilter.PAST },
  { key: "archived", label: "Archived", value: EventFilter.ARCHIVED },
  { key: "all", label: "All", value: EventFilter.ALL },
]

function DatesSummary({ event }: { event: Event }) {
  const dates = event.dates
  if (dates.length === 0) {
    return <span className="text-gray-400">No dates</span>
  }
  const next = dates.find((d) => !isPast(d.value) && !d.cancelled)
  return (
    <div>
      <div>{next ? formatDateTime(next.value) : formatDateTime(dates[dates.length - 1].value)}</div>
      <div className="text-xs text-gray-500">
        {dates.length === 1 ? "1 date" : `${dates.length} dates`}
        {dates.length > 1 && <> · ends {formatDateTime(dates[dates.length - 1].value)}</>}
      </div>
    </div>
  )
}

function EventsTable({ events }: { events: Event[] }) {
  return (
    <Table headers={[{ label: "Event" }, { label: "Next date" }, { label: "Capacity" }, { label: "Status" }]}>
      {events.map((event) => (
        <tr key={event.name} className="hover:bg-gray-50">
          <Td>
            <Link to={eventRoute(event.name)} className="font-medium text-blue-700 hover:underline">
              {event.title}
            </Link>
            <div className="font-mono text-xs text-gray-500">{event.name}</div>
          </Td>
          <Td>
            <DatesSummary event={event} />
          </Td>
          <Td>{event.capacity > 0 ? `${event.capacity} per date` : "Unlimited"}</Td>
          <Td>
            <EventStatusBadges event={event} />
          </Td>
        </tr>
      ))}
    </Table>
  )
}

export default function Events() {
  const { params, offset, search, update } = usePageParams()
  const filterKey = params.get("filter") ?? "upcoming"
  const filter = filters.find((f) => f.key === filterKey) ?? filters[0]
  const [searchInput, setSearchInput] = useState(search)
  const debouncedSearch = useDebouncedValue(searchInput)

  // biome-ignore lint/correctness/useExhaustiveDependencies: only sync when the debounced input changes
  useEffect(() => {
    if (debouncedSearch !== search) {
      update({ q: debouncedSearch, offset: null })
    }
  }, [debouncedSearch])

  const query = useQuery(
    LightEventService.method.listEvents,
    { filter: filter.value, search, limit: PAGE_SIZE, offset },
    { placeholderData: (prev) => prev },
  )

  return (
    <>
      <PageTitle title="Events" actions={<LinkButton to={newEventRoute}>New event</LinkButton>} />
      <Content>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <nav aria-label="Event filter" className="flex gap-1 rounded-lg bg-gray-200/70 p-1 text-sm">
            {filters.map((f) => (
              <button
                key={f.key}
                type="button"
                aria-pressed={f.key === filter.key}
                onClick={() => update({ filter: f.key === "upcoming" ? null : f.key, offset: null })}
                className={clsx("rounded-md px-3 py-1", {
                  "bg-white font-medium shadow-sm": f.key === filter.key,
                  "text-gray-600 hover:text-gray-900": f.key !== filter.key,
                })}
              >
                {f.label}
              </button>
            ))}
          </nav>
          <label className="w-full sm:w-64">
            <span className="sr-only">Search events</span>
            <input
              type="search"
              placeholder="Search events"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className={inputClassName}
            />
          </label>
        </div>
        <Query query={query}>
          {(resp) =>
            resp.events.length === 0 ? (
              <EmptyState
                action={
                  !search && filter.value === EventFilter.UPCOMING ? (
                    <LinkButton to={newEventRoute}>Create an event</LinkButton>
                  ) : undefined
                }
              >
                {search ? `No events match “${search}”.` : `No ${filter.label.toLowerCase()} events.`}
              </EmptyState>
            ) : (
              <>
                <EventsTable events={resp.events} />
                <Pagination
                  offset={offset}
                  limit={PAGE_SIZE}
                  total={resp.total}
                  onChange={(o) => update({ offset: o })}
                />
              </>
            )
          }
        </Query>
      </Content>
    </>
  )
}

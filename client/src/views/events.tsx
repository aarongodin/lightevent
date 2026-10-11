import { useApp, useNavigate, useQuery, useRoute } from "../context"
import type { EventJson, RegistrationJson } from "../gen/lightevent/v1/service_pb"
import { dateAvailability, seriesAvailability, upcomingDates } from "../model"
import { buildRoute } from "../router"
import { Availability, ErrorMessage, Link, Loading, Notice, TagList } from "../ui"

// The number of dates shown per event in the list before linking to the event page.
const datesInList = 5

export function eventRoute(name: string) {
  return `/events/${encodeURIComponent(name)}`
}

export function registerRoute(eventName: string, dateUid?: string) {
  return dateUid
    ? `${eventRoute(eventName)}/dates/${encodeURIComponent(dateUid)}/register`
    : `${eventRoute(eventName)}/register`
}

// useEvents loads the upcoming events, limited to the tags from the init options.
export function useEvents() {
  const { api, options } = useApp()
  return useQuery(`events:${options.tags.join(",")}`, () => api.listEvents(options.tags))
}

// useMyRegistrations loads the signed-in member's registrations, or returns none when signed out.
export function useMyRegistrations(): { registrations: RegistrationJson[]; loading: boolean } {
  const { api, member } = useApp()
  const query = useQuery(member ? `my-registrations:${member.uid}` : null, () => api.listMyRegistrations())
  return { registrations: query.data?.registrations ?? [], loading: query.loading }
}

export function DateList({ event, limit }: { event: EventJson; limit?: number }) {
  const { format } = useApp()
  const { registrations } = useMyRegistrations()
  const dates = upcomingDates(event).slice(0, limit)
  return (
    <ul class="le-dates">
      {dates.map((date) => {
        const availability = dateAvailability(event, date, registrations)
        return (
          <li key={date.uid} class="le-date-row" data-status={availability.status}>
            <span class="le-date">
              <span class="le-date-day">{format.date(date.value)}</span>
              <span class="le-date-time">{format.time(date.value)}</span>
            </span>
            <Availability availability={availability} />
            {availability.status === "open" && (
              <Link
                to={registerRoute(event.name ?? "", date.uid)}
                class="le-button le-button-small"
                aria-label={`Register for ${event.title} on ${format.dateTime(date.value)}`}
              >
                Register
              </Link>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export function SeriesAction({ event }: { event: EventJson }) {
  const { config } = useApp()
  const { registrations } = useMyRegistrations()
  const series = seriesAvailability(event, registrations, config)
  if (series === "registered") {
    return <p class="le-muted">You're registered for every date.</p>
  }
  if (series !== "open") {
    return null
  }
  return (
    <Link to={registerRoute(event.name ?? "")} class="le-button le-button-secondary">
      Register for all dates
    </Link>
  )
}

function excerpt(text: string, max = 240): string {
  return text.length > max ? `${text.slice(0, max).replace(/\s+\S*$/, "")}…` : text
}

function EventCard({ event }: { event: EventJson }) {
  const route = eventRoute(event.name ?? "")
  const total = upcomingDates(event).length
  const headingID = `le-event-${event.name}`
  return (
    <article class="le-card" aria-labelledby={headingID}>
      <h3 id={headingID} class="le-card-title">
        <Link to={route}>{event.title}</Link>
      </h3>
      <TagList names={event.tags} />
      {event.description && <p class="le-description">{excerpt(event.description)}</p>}
      <DateList event={event} limit={datesInList} />
      <div class="le-actions">
        {total > datesInList && (
          <Link to={route} class="le-link">
            See all {total} dates
          </Link>
        )}
        <SeriesAction event={event} />
      </div>
    </article>
  )
}

function TagFilters({ events, selected }: { events: EventJson[]; selected: string[] }) {
  const { config, options } = useApp()
  const navigate = useNavigate()
  const used = new Set(events.flatMap((e) => e.tags ?? []))
  const tags = (config.tags ?? []).filter(
    (t) => used.has(t.name ?? "") && (!options.tags.length || options.tags.includes(t.name ?? "")),
  )
  if (tags.length < 2 && !selected.length) {
    return null
  }

  // Filters replace the current history entry, so the back button leaves the list rather than undoing filters.
  function select(next: string[]) {
    navigate(buildRoute("/", { tags: next.join(",") }), { replace: true })
  }

  return (
    <fieldset class="le-filters">
      <legend class="le-sr-only">Filter events</legend>
      {tags.map((tag) => {
        const name = tag.name ?? ""
        const active = selected.includes(name)
        return (
          <button
            key={name}
            type="button"
            class="le-chip"
            aria-pressed={active}
            onClick={() => select(active ? selected.filter((s) => s !== name) : [...selected, name])}
          >
            {tag.label}
          </button>
        )
      })}
      {selected.length > 0 && (
        <button type="button" class="le-link-button" onClick={() => select([])}>
          Clear filters
        </button>
      )}
    </fieldset>
  )
}

export function EventsView() {
  const { query } = useRoute()
  const events = useEvents()
  const selected = (query.get("tags") ?? "").split(",").filter(Boolean)

  if (events.error) {
    return <ErrorMessage error={events.error} onRetry={events.reload} />
  }
  if (!events.data) {
    return <Loading label="Loading events…" />
  }

  const all = events.data.events ?? []
  const visible = selected.length ? all.filter((e) => e.tags?.some((t) => selected.includes(t))) : all
  return (
    <section aria-labelledby="le-events-heading">
      <h2 id="le-events-heading" class="le-heading" tabIndex={-1}>
        Upcoming events
      </h2>
      <TagFilters events={all} selected={selected} />
      {visible.length === 0 ? (
        <Notice>
          {selected.length ? "No upcoming events match the selected filters." : "There are no upcoming events."}
        </Notice>
      ) : (
        <div class="le-list">
          {visible.map((event) => (
            <EventCard key={event.name} event={event} />
          ))}
        </div>
      )}
    </section>
  )
}

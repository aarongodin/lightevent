import { useApp, useQuery } from "../context"
import { upcomingDates } from "../model"
import { BackLink, ErrorMessage, Loading, Notice, TagList } from "../ui"
import { DateList, SeriesAction } from "./events"

export function useEvent(name: string) {
  const { api } = useApp()
  return useQuery(`event:${name}`, () => api.getEvent(name))
}

export function EventView({ name }: { name: string }) {
  const query = useEvent(name)

  if (query.error) {
    return (
      <>
        <BackLink />
        {query.error.code === "not_found" ? (
          <Notice>This event could not be found.</Notice>
        ) : (
          <ErrorMessage error={query.error} onRetry={query.reload} />
        )}
      </>
    )
  }
  const event = query.data?.event
  if (!event) {
    return <Loading />
  }

  return (
    <article aria-labelledby="le-event-heading">
      <BackLink />
      <h2 id="le-event-heading" class="le-heading" tabIndex={-1}>
        {event.title}
      </h2>
      <TagList names={event.tags} />
      {event.description && <p class="le-description le-description-full">{event.description}</p>}
      <h3 class="le-subheading">Dates</h3>
      {upcomingDates(event).length ? <DateList event={event} /> : <Notice>This event has no upcoming dates.</Notice>}
      <div class="le-actions">
        <SeriesAction event={event} />
      </div>
    </article>
  )
}

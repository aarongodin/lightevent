import { useQuery } from "@connectrpc/connect-query"
import { useParams } from "react-router"

import { EventForm } from "../forms/event"
import { LightEventService } from "../lib/rpc"
import { eventRoute, eventsRoute } from "../router"
import { Content } from "../units/layout"
import { PageTitle } from "../units/page-title"
import { Query } from "../units/query"
import NotFound from "./not-found"

export default function EventEdit() {
  const { eventName = "" } = useParams()
  // Always load fresh data so the form does not start from a stale copy.
  const query = useQuery(LightEventService.method.getEvent, { name: eventName }, { staleTime: 0 })
  return (
    <Query query={query} notFound={<NotFound what="event" back={{ to: eventsRoute, label: "Back to events" }} />}>
      {(resp) =>
        resp.event && (
          <>
            <PageTitle
              title={`Edit ${resp.event.title}`}
              back={{ to: eventRoute(eventName), label: resp.event.title }}
            />
            <Content>
              <EventForm event={resp.event} />
            </Content>
          </>
        )
      }
    </Query>
  )
}

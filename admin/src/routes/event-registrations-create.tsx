import { useQuery } from "@connectrpc/connect-query"
import { useParams } from "react-router"

import { RegistrationForm } from "../forms/registration"
import { LightEventService } from "../lib/rpc"
import { eventRoute, eventsRoute } from "../router"
import { Content } from "../units/layout"
import { PageTitle } from "../units/page-title"
import { Query } from "../units/query"
import NotFound from "./not-found"

export default function EventRegistrationsCreate() {
  const { eventName = "" } = useParams()
  const query = useQuery(LightEventService.method.getEvent, { name: eventName })
  return (
    <Query query={query} notFound={<NotFound what="event" back={{ to: eventsRoute, label: "Back to events" }} />}>
      {(resp) =>
        resp.event && (
          <>
            <PageTitle title="Add registration" back={{ to: eventRoute(eventName), label: resp.event.title }} />
            <Content>
              <RegistrationForm event={resp.event} />
            </Content>
          </>
        )
      }
    </Query>
  )
}

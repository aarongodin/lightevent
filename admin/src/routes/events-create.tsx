import { EventForm } from "../forms/event"
import { eventsRoute } from "../router"
import { Content } from "../units/layout"
import { PageTitle } from "../units/page-title"

export default function EventsCreate() {
  return (
    <>
      <PageTitle title="New event" back={{ to: eventsRoute, label: "Events" }} />
      <Content>
        <EventForm />
      </Content>
    </>
  )
}

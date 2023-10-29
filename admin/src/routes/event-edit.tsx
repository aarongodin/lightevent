import { useNavigate, useParams } from "react-router-dom"

import { WithRequest } from "../client"
import { EventForm } from "../forms/event"
import { usePrompt } from "../prompt"
import { eventRoute } from "../router"
import { Event as Evt } from "../rpc"
import { Button } from "../units/button"
import { Content } from "../units/content"
import { TableLoader } from "../units/loader"
import { PageTitle } from "../units/page-title"

const WithEvent = WithRequest<Evt>

function ExternalActions({ eventName }: { eventName: string }) {
  const navigate = useNavigate()
  const prompt = usePrompt()
  function onCancel() {
    prompt.confirm("This will discard any unsaved changes. Are you sure?").then(({ ok }) => {
      if (ok) {
        navigate(eventRoute(eventName))
      }
    })
  }
  return (
    <Button color="white" onClick={onCancel}>
      Discard
    </Button>
  )
}

export default function EventEdit() {
  const params = useParams()
  const name = params.eventName as string
  return (
    <>
      <PageTitle title="Edit Event" externalActions={<ExternalActions eventName={name} />} />
      <Content>
        <WithEvent load={(client) => client.GetEvent({ name })} deps={[params.eventName]} loader={TableLoader}>
          {(resp) => <EventForm event={resp} />}
        </WithEvent>
      </Content>
    </>
  )
}

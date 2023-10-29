import { useNavigate, useParams } from "react-router-dom"

import { WithRequest } from "../client"
import { RegistrationForm } from "../forms/registration"
import { usePrompt } from "../prompt"
import { eventRoute } from "../router"
import { Event as Evt } from "../rpc"
import { Button } from "../units/button"
import { Content } from "../units/content"
import { TableLoader } from "../units/loader"
import { PageTitle } from "../units/page-title"

const WithEvent = WithRequest<Evt>

function ExternalActions() {
  const navigate = useNavigate()
  const prompt = usePrompt()
  const params = useParams()

  function onCancel() {
    prompt.confirm("This will discard any unsaved changes. Are you sure?").then(({ ok }) => {
      if (ok) {
        navigate(eventRoute(String(params.eventName)))
      }
    })
  }
  return (
    <Button color="white" onClick={onCancel}>
      Discard
    </Button>
  )
}

export default function EventRegistrationsCreate() {
  const params = useParams()
  const eventName = params.eventName as string
  return (
    <>
      <PageTitle title="New Registration" externalActions={<ExternalActions />} />
      <Content>
        <WithEvent load={(client) => client.GetEvent({ name: eventName })} deps={[eventName]} loader={TableLoader}>
          {(resp) => <RegistrationForm event={resp} />}
        </WithEvent>
      </Content>
    </>
  )
}

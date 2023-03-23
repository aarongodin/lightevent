import { useNavigate } from "react-router-dom"

import { eventsRoute } from "../router"
import { Button } from "../units/button"
import { Content } from "../units/content"
import { PageTitle } from "../units/page-title"

function ExternalActions() {
  const navigate = useNavigate()
  // const prompter = usePrompter()
  // TODO(aarongodin): render prompter.confirm
  function onCancel() {
    // prompter.confirm("This will discard any progress. Are you sure?").then((resp) => {
    //   if (resp.ok) {
    //     navigate(eventsRoute)
    //   }
    // })
  }
  return <Button color="white" onClick={onCancel} />
}

export default function EventsCreate() {
  return (
    <>
      <PageTitle title="New Event" externalActions={<ExternalActions />} />
      <Content>new event content</Content>
    </>
  )
}

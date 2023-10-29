import { useNavigate } from "react-router-dom"

import { MemberForm } from "../forms/member"
import { usePrompt } from "../prompt"
import { eventsRoute } from "../router"
import { Button } from "../units/button"
import { Content } from "../units/content"
import { PageTitle } from "../units/page-title"

function ExternalActions() {
  const navigate = useNavigate()
  const prompt = usePrompt()
  function onCancel() {
    prompt.confirm("This will discard any unsaved changes. Are you sure?").then(({ ok }) => {
      if (ok) {
        navigate(eventsRoute)
      }
    })
  }
  return (
    <Button color="white" onClick={onCancel}>
      Discard
    </Button>
  )
}

export default function MembersCreate() {
  return (
    <>
      <PageTitle title="New Member" externalActions={<ExternalActions />} />
      <Content>
        <MemberForm />
      </Content>
    </>
  )
}

import base64 from "base-64"
import { useNavigate, useParams } from "react-router-dom"

import { WithRequest } from "../client"
import { MemberForm } from "../forms/member"
import { usePrompt } from "../prompt"
import { memberRoute } from "../router"
import { Member } from "../rpc"
import { Button } from "../units/button"
import { Content } from "../units/content"
import { TableLoader } from "../units/loader"
import { PageTitle } from "../units/page-title"

const WithMember = WithRequest<Member>

function ExternalActions({ memberEmail }: { memberEmail: string }) {
  const navigate = useNavigate()
  const prompt = usePrompt()
  function onCancel() {
    prompt.confirm("This will discard any unsaved changes. Are you sure?").then(({ ok }) => {
      if (ok) {
        navigate(memberRoute(memberEmail))
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
  const { emailEncoded } = useParams()
  const email = base64.decode(emailEncoded as string)
  return (
    <>
      <PageTitle title="Edit Member" externalActions={<ExternalActions memberEmail={email} />} />
      <Content>
        <WithMember load={(client) => client.GetMember({ email })} deps={[]} loader={TableLoader}>
          {(resp) => <MemberForm member={resp} />}
        </WithMember>
      </Content>
    </>
  )
}

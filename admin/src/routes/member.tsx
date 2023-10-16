import base64 from "base-64"
import { useParams } from "react-router-dom"

import { WithRequest } from "../client"
import { Member } from "../rpc"
import { Content } from "../units/content"
import { TableLoader } from "../units/loader"
import { PageTitle } from "../units/page-title"

const WithMember = WithRequest<Member>

export default function MemberView() {
  const { emailEncoded } = useParams()
  const email = base64.decode(emailEncoded as string)
  return (
    <>
      <PageTitle title="Member" />
      <Content>
        <WithMember load={(client) => client.GetMember({ email })} deps={[]} loader={TableLoader}>
          {(member) => <div>{member.firstName}</div>}
        </WithMember>
      </Content>
    </>
  )
}

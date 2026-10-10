import { MemberForm } from "../forms/member"
import { membersRoute } from "../router"
import { Content } from "../units/layout"
import { PageTitle } from "../units/page-title"

export default function MembersCreate() {
  return (
    <>
      <PageTitle title="New member" back={{ to: membersRoute, label: "Members" }} />
      <Content>
        <MemberForm />
      </Content>
    </>
  )
}

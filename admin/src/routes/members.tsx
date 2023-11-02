import { WithRequest } from "../client"
import dayjs from "../dayjs"
import { memberRoute, newMemberRoute } from "../router"
import { MemberList } from "../rpc"
import { LinkButton } from "../units/button"
import { Content } from "../units/content"
import { TableLoader } from "../units/loader"
import { PageTitle } from "../units/page-title"

const WithMemberList = WithRequest<MemberList>

type MembersTableProps = {
  members: MemberList["members"]
}

function MembersTable({ members }: MembersTableProps) {
  const rows = members.map((member, idx) => {
    const className = `${idx % 2 == 1 && "bg-gray-50"} p-2`
    return (
      <tr key={member.email} className={className}>
        <td className="p-4 text-left">{member.email}</td>
        <td className="p-4 text-left">{member.firstName}</td>
        <td className="p-4 text-left">{member.lastName}</td>
        <td className="p-4 text-left text-sm">{dayjs(member.createdAt).format("l LTS")}</td>
        <td className="p-4 text-right text-xs">
          <LinkButton color="white" to={memberRoute(member.email)}>
            View
          </LinkButton>
        </td>
      </tr>
    )
  })

  return (
    <table className="bg-white w-full rounded-lg drop-shadow">
      <thead className="text-xs bg-gray-50 text-gray-800">
        <tr>
          <th className="px-4 py-2 text-left w-1/3">Email</th>
          <th className="px-4 py-2 text-left w-1/6">First Name</th>
          <th className="px-4 py-2 text-left w-1/6">Last Name</th>
          <th className="px-4 py-2 text-left w-1/3">Created At</th>
          <th>View</th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  )
}

function ExternalActions() {
  return <LinkButton to={newMemberRoute}>New Member</LinkButton>
}

export default function Members() {
  return (
    <>
      <PageTitle title="Members" externalActions={<ExternalActions />} />
      <Content>
        <WithMemberList load={(client) => client.ListMembers({})} deps={[]} loader={TableLoader}>
          {(resp) => <MembersTable members={resp.members} />}
        </WithMemberList>
      </Content>
    </>
  )
}

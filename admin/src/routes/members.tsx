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
  if (members.length === 0) {
    return (
      <div className="bg-gray-50 w-full rounded-lg h-32 flex items-center justify-center text-sm text-gray-600">
        No members found.
      </div>
    )
  }
  const rows = members.map((member) => {
    return (
      <tr key={member.email} className="border-b last:border-0">
        <td className="px-4 py-3 text-left">{member.email}</td>
        <td className="px-4 py-3 text-left">{member.firstName}</td>
        <td className="px-4 py-3 text-left">{member.lastName}</td>
        <td className="px-4 py-3 text-left text-sm">{dayjs(member.createdAt).format("l LTS")}</td>
        <td className="px-4 py-3 text-right text-xs">
          <LinkButton size="small" color="white" to={memberRoute(member.email)}>
            View
          </LinkButton>
        </td>
      </tr>
    )
  })

  return (
    <div className="overflow-x-auto drop-shadow">
      <table className="bg-white w-full md:rounded-lg min-w-max">
        <thead className="text-xs bg-gradient-to-r from-gray-50 to-slate-50 text-gray-500 border-b">
          <tr>
            <th className="px-4 py-2 text-left rounded-tl-lg">Email</th>
            <th className="px-4 py-2 text-left">First Name</th>
            <th className="px-4 py-2 text-left">Last Name</th>
            <th className="px-4 py-2 text-left">Created At</th>
            <th className="rounded-tr-lg">View</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
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

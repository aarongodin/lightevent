import base64 from "base-64"
import { Link, useParams } from "react-router-dom"

import { WithRequest } from "../client"
import dayjs from "../dayjs"
import { editMemberRoute, eventRoute } from "../router"
import { Member, MemberRegistrationList } from "../rpc"
import { LinkButton } from "../units/button"
import { Content } from "../units/content"
import { DefinitionListItem } from "../units/list"
import { TableLoader } from "../units/loader"
import { PageTitle } from "../units/page-title"
import { boolToString, formatConfCode, RegistrationKindBadge } from "../units/value"

const WithMember = WithRequest<Member>
const WithMemberRegistrationList = WithRequest<MemberRegistrationList>

function ExternalActions({ email }: { email: string }) {
  return (
    <>
      <LinkButton to={editMemberRoute(email)}>Edit Member</LinkButton>
    </>
  )
}

function MemberView({ member }: { member: Member }) {
  return (
    <dl className="drop-shadow max-w-2xl mx-auto">
      <DefinitionListItem variant="grid" title="Email" data={member.email} />
      <DefinitionListItem variant="grid" stripe title="First Name" data={member.firstName} />
      <DefinitionListItem variant="grid" title="Last Name" data={member.lastName} />
      <DefinitionListItem variant="grid" stripe title="Verified" data={boolToString(member.verified)} />
      <DefinitionListItem variant="grid" stripe title="Created At" data={dayjs(member.createdAt).format("l LTS")} />
    </dl>
  )
}

type MemberRegistrationsTableProps = {
  registrations: MemberRegistrationList["registrations"]
}

function MemberRegistrationsTable({ registrations }: MemberRegistrationsTableProps) {
  const rows = registrations.map((reg, idx) => {
    const className = `${idx % 2 == 1 && "bg-gray-50"} p-2`
    return (
      <tr key={reg.confCode} className={className}>
        <td className="p-4 text-left">
          <Link className="text-blue-600 hover:text-blue-500" to={eventRoute(reg.eventName)}>
            {reg.eventName}
          </Link>
        </td>
        <td className="p-4 text-left">
          <RegistrationKindBadge kind={reg.kind} />
        </td>
        <td className="p-4 text-left text-sm">
          {reg.eventDate !== undefined ? dayjs(reg.eventDate.value).format("l LT") : "-"}
        </td>
        <td className="p-4 text-right text-xs font-mono">{formatConfCode(reg.confCode)}</td>
        <td className="p-4 text-right text-xs font-mono">{dayjs(reg.createdAt).format("l LTS")}</td>
      </tr>
    )
  })

  return (
    <table className="bg-white w-full rounded-lg drop-shadow">
      <thead className="text-xs bg-gray-50 text-gray-800">
        <tr>
          <th className="px-4 py-2 text-left w-1/5">Event Name</th>
          <th className="px-4 py-2 text-left w-1/5">Registration Kind</th>
          <th className="px-4 py-2 text-left w-1/5">Event Date</th>
          <th className="px-4 py-2 text-right w-1/5">Conf Code</th>
          <th className="px-4 py-2 text-right w-1/5">Created At</th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  )
}

export default function MemberRoute() {
  const { emailEncoded } = useParams()
  const email = base64.decode(emailEncoded as string)
  return (
    <>
      <PageTitle title="Member" externalActions={<ExternalActions email={email} />} />
      <Content>
        <WithMember load={(client) => client.GetMember({ email })} deps={[email]} loader={TableLoader}>
          {(member) => <MemberView member={member} />}
        </WithMember>
        <div className="mt-4">
          <h3 className="mb-4">Registrations</h3>
          <WithMemberRegistrationList
            load={(client) => client.ListMemberRegistrations({ memberEmail: email })}
            deps={[email]}
            loader={TableLoader}
          >
            {(list) => <MemberRegistrationsTable registrations={list.registrations} />}
          </WithMemberRegistrationList>
        </div>
      </Content>
    </>
  )
}

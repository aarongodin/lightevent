import base64 from "base-64"
import { Link, useParams } from "react-router-dom"

import { WithRequest } from "../client"
import dayjs from "../dayjs"
import { editMemberRoute, eventRoute } from "../router"
import { Member, MemberRegistrationList } from "../rpc"
import { Badge } from "../units/badge"
import { LinkButton } from "../units/button"
import { Condition } from "../units/condition"
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
    <dl className="drop-shadow max-w-screen-sm">
      <DefinitionListItem variant="grid" title="Email" data={member.email} />
      <DefinitionListItem variant="grid" title="First Name" data={member.firstName} />
      <DefinitionListItem variant="grid" title="Last Name" data={member.lastName} />
      <DefinitionListItem variant="grid" title="Verified" data={boolToString(member.verified)} />
      <DefinitionListItem variant="grid" title="Created At" data={dayjs(member.createdAt).format("l LTS")} />
    </dl>
  )
}

type MemberRegistrationsTableProps = {
  registrations: MemberRegistrationList["registrations"]
}

function MemberRegistrationsTable({ registrations }: MemberRegistrationsTableProps) {
  if (registrations.length === 0) {
    return (
      <div className="bg-gray-50 w-full rounded-lg h-32 flex items-center justify-center text-sm text-gray-600">
        No registrations.
      </div>
    )
  }

  const rows = registrations.map((reg, idx) => {
    const className = `${idx % 2 == 1 && "bg-gray-50"} p-2`
    return (
      <tr key={reg.confCode} className={className}>
        <td className="p-4 text-left">{reg.eventName}</td>
        <td className="p-4 text-left">
          <RegistrationKindBadge kind={reg.kind} />
        </td>
        <td className="p-4 text-left text-sm">
          <Condition
            value={reg.eventDate !== undefined}
            items={[
              <>
                {dayjs(reg.eventDate?.value).format("l LT")}
                {reg.eventDate?.cancelled && (
                  <Badge variant="gray" className="ml-2">
                    Cancelled
                  </Badge>
                )}
              </>,
            ]}
          />
        </td>
        <td className="p-4 text-right text-xs font-mono">{formatConfCode(reg.confCode)}</td>
        <td className="p-4 text-right text-xs font-mono">{dayjs(reg.createdAt).format("l LTS")}</td>
      </tr>
    )
  })

  return (
    <div className="overflow-x-auto drop-shadow">
      <table className="bg-white w-full md:rounded-lg min-w-max">
        <thead className="text-xs bg-gradient-to-r from-gray-50 to-slate-50 text-gray-500 border-b">
          <tr>
            <th className="px-4 py-2 text-left rounded-tl-lg">Event Name</th>
            <th className="px-4 py-2 text-left">Registration Kind</th>
            <th className="px-4 py-2 text-left">Event Date</th>
            <th className="px-4 py-2 text-right">Conf Code</th>
            <th className="px-4 py-2 text-right rounded-tr-lg">Created At</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
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
        <div className="mt-8">
          <h3 className="mb-4 px-4 md:p-0">Registrations</h3>
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

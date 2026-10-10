import { useMutation, useQuery } from "@connectrpc/connect-query"
import { Link, useNavigate, useParams } from "react-router"

import type { Member, Registration } from "../gen/lightevent/v1/service_pb"
import { formatConfCode, formatDateTime, formatName, isPast } from "../lib/format"
import { errorMessage, invalidateAll, LightEventService } from "../lib/rpc"
import { editMemberRoute, eventRoute, membersRoute } from "../router"
import { Badge } from "../units/badge"
import { Button, LinkButton } from "../units/button"
import { useConfirm } from "../units/confirm"
import { Content, Section } from "../units/layout"
import { DefinitionList } from "../units/list"
import { PageTitle } from "../units/page-title"
import { Query } from "../units/query"
import { EmptyState, Table, Td } from "../units/table"
import { useToast } from "../units/toast"
import { RegistrationKindBadge, yesNo } from "../units/values"
import NotFound from "./not-found"

function RegistrationsTable({ registrations }: { registrations: Registration[] }) {
  const confirm = useConfirm()
  const toast = useToast()
  const remove = useMutation(LightEventService.method.deleteRegistration)

  if (registrations.length === 0) {
    return <EmptyState>This member has no registrations.</EmptyState>
  }

  async function onCancel(reg: Registration) {
    const { ok, checked } = await confirm({
      title: "Cancel registration?",
      message: `The registration ${formatConfCode(reg.confCode)} for ${reg.eventTitle} will be cancelled.`,
      confirmLabel: "Cancel registration",
      danger: true,
      checkbox: { label: "Email the member about the cancellation", defaultChecked: true },
    })
    if (!ok) {
      return
    }
    try {
      await remove.mutateAsync({ confCode: reg.confCode, notifyMember: checked })
      toast.success("Registration cancelled")
      await invalidateAll()
    } catch (err) {
      toast.error(errorMessage(err))
    }
  }

  return (
    <Table
      headers={[
        { label: "Event" },
        { label: "Kind" },
        { label: "Date" },
        { label: "Confirmation" },
        { label: "Registered" },
        { label: "Actions", className: "text-right" },
      ]}
    >
      {registrations.map((reg) => (
        <tr key={reg.confCode}>
          <Td>
            <Link to={eventRoute(reg.eventName)} className="font-medium text-blue-700 hover:underline">
              {reg.eventTitle}
            </Link>
          </Td>
          <Td>
            <RegistrationKindBadge kind={reg.kind} />
          </Td>
          <Td>
            {reg.eventDate ? (
              <span className="inline-flex items-center gap-2">
                {formatDateTime(reg.eventDate.value)}
                {reg.eventDate.cancelled && <Badge variant="red">Cancelled</Badge>}
                {!reg.eventDate.cancelled && isPast(reg.eventDate.value) && <Badge variant="gray">Past</Badge>}
              </span>
            ) : (
              <span className="text-gray-500">All dates</span>
            )}
          </Td>
          <Td className="font-mono text-xs">{formatConfCode(reg.confCode)}</Td>
          <Td className="text-xs text-gray-600">{formatDateTime(reg.createdAt)}</Td>
          <Td className="text-right">
            <Button color="white" size="small" onClick={() => onCancel(reg)}>
              Cancel
            </Button>
          </Td>
        </tr>
      ))}
    </Table>
  )
}

function MemberView({ member }: { member: Member }) {
  const confirm = useConfirm()
  const toast = useToast()
  const navigate = useNavigate()
  const remove = useMutation(LightEventService.method.deleteMember)
  const registrations = useQuery(LightEventService.method.listMemberRegistrations, { memberUid: member.uid })
  const name = formatName(member.firstName, member.lastName)

  async function onDelete() {
    const { ok } = await confirm({
      title: "Delete member?",
      message: `${member.email} and all of their registrations will be permanently deleted. This cannot be undone.`,
      confirmLabel: "Delete member",
      danger: true,
    })
    if (!ok) {
      return
    }
    try {
      await remove.mutateAsync({ uid: member.uid })
      toast.success("Member deleted")
      await invalidateAll()
      navigate(membersRoute)
    } catch (err) {
      toast.error(errorMessage(err))
    }
  }

  return (
    <>
      <PageTitle
        title={name || member.email}
        subtitle={name ? member.email : undefined}
        back={{ to: membersRoute, label: "Members" }}
        actions={
          <>
            <Button color="white" onClick={onDelete} disabled={remove.isPending}>
              Delete
            </Button>
            <LinkButton to={editMemberRoute(member.uid)}>Edit</LinkButton>
          </>
        }
      />
      <Content>
        <Section title="Details" className="max-w-2xl">
          <DefinitionList
            items={[
              { title: "Email", value: member.email },
              { title: "First name", value: member.firstName },
              { title: "Last name", value: member.lastName },
              { title: "Verified", value: yesNo(member.verified) },
              { title: "Joined", value: formatDateTime(member.createdAt) },
            ]}
          />
        </Section>
        <Section title="Registrations" className="mt-8">
          <Query query={registrations}>{(resp) => <RegistrationsTable registrations={resp.registrations} />}</Query>
        </Section>
      </Content>
    </>
  )
}

export default function MemberRoute() {
  const { memberUid = "" } = useParams()
  const query = useQuery(LightEventService.method.getMember, { uid: memberUid })
  return (
    <Query query={query} notFound={<NotFound what="member" back={{ to: membersRoute, label: "Back to members" }} />}>
      {(resp) => resp.member && <MemberView member={resp.member} />}
    </Query>
  )
}

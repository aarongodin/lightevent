import { useMutation, useQuery } from "@connectrpc/connect-query"
import { PasswordForm } from "../forms/password"
import type { Session } from "../gen/lightevent/v1/service_pb"
import { formatDateTime } from "../lib/format"
import { useIdentity } from "../lib/identity"
import { errorMessage, invalidateAll, LightEventService } from "../lib/rpc"
import { Alert } from "../units/alert"
import { Badge } from "../units/badge"
import { Button } from "../units/button"
import { Box, Section } from "../units/layout"
import { Query } from "../units/query"
import { Table, Td } from "../units/table"
import { useToast } from "../units/toast"

function SessionsTable({ sessions }: { sessions: Session[] }) {
  const toast = useToast()
  const revoke = useMutation(LightEventService.method.revokeSession)

  async function onRevoke(session: Session) {
    try {
      await revoke.mutateAsync({ uid: session.uid })
      toast.success("Session signed out")
      await invalidateAll()
    } catch (err) {
      toast.error(errorMessage(err))
    }
  }

  return (
    <Table headers={[{ label: "Signed in" }, { label: "Expires" }, { label: "", className: "text-right" }]}>
      {sessions.map((s) => (
        <tr key={s.uid}>
          <Td>
            {formatDateTime(s.createdAt)} {s.current && <Badge variant="green">This session</Badge>}
          </Td>
          <Td className="text-gray-600">{formatDateTime(s.expiresAt)}</Td>
          <Td className="text-right">
            {!s.current && (
              <Button color="white" size="small" onClick={() => onRevoke(s)} disabled={revoke.isPending}>
                Sign out
              </Button>
            )}
          </Td>
        </tr>
      ))}
    </Table>
  )
}

export default function Account() {
  const identity = useIdentity()
  const sessions = useQuery(LightEventService.method.listSessions, { kind: "user", subjectUid: identity.subjectUid })

  if (identity.scheme !== "user") {
    return <Alert variant="info">Account settings are only available when signed in as a user.</Alert>
  }

  return (
    <div className="grid gap-8">
      <Section title="Change password" className="max-w-xl">
        <Box>
          <PasswordForm userUid={identity.subjectUid} self onDone={() => invalidateAll()} />
        </Box>
      </Section>
      <Section title="Sessions" className="max-w-3xl">
        <Query query={sessions}>{(resp) => <SessionsTable sessions={resp.sessions} />}</Query>
      </Section>
    </div>
  )
}

import { useMutation, useQuery } from "@connectrpc/connect-query"
import { useState } from "react"

import type { APIKey } from "../gen/lightevent/v1/service_pb"
import { formatDate, formatDateTime } from "../lib/format"
import { errorMessage, invalidateAll, LightEventService } from "../lib/rpc"
import { Alert } from "../units/alert"
import { Button } from "../units/button"
import { useConfirm } from "../units/confirm"
import { Field, inputClassName } from "../units/field"
import { Section } from "../units/layout"
import { Modal } from "../units/modal"
import { Query } from "../units/query"
import { EmptyState, Table, Td } from "../units/table"
import { useToast } from "../units/toast"

function CreateKeyForm({ onCreated, onCancel }: { onCreated: (secret: string) => void; onCancel: () => void }) {
  const create = useMutation(LightEventService.method.createAPIKey)
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      const resp = await create.mutateAsync({ name })
      await invalidateAll()
      onCreated(resp.secret)
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <Field id="key-name" label="Name" required hint="Describe where the key is used, e.g. “Website sync”.">
        <input
          id="key-name"
          className={inputClassName}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </Field>
      {error && <Alert variant="error">{error}</Alert>}
      <div className="flex gap-2">
        <Button type="submit" disabled={create.isPending || name.trim() === ""}>
          Create key
        </Button>
        <Button color="white" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

function SecretView({ secret, onDone }: { secret: string; onDone: () => void }) {
  const toast = useToast()
  async function copy() {
    try {
      await navigator.clipboard.writeText(secret)
      toast.success("Copied to clipboard")
    } catch {
      toast.error("Could not copy; select the key and copy it manually")
    }
  }
  return (
    <div className="grid gap-4">
      <Alert variant="warning">Copy this key now. It will not be shown again.</Alert>
      <code className="block rounded-md bg-gray-100 p-3 font-mono text-xs break-all select-all">{secret}</code>
      <p className="text-xs text-gray-600">
        Send it in the <code>Authorization</code> header: <code>Bearer &lt;key&gt;</code>.
      </p>
      <div className="flex gap-2">
        <Button onClick={copy}>Copy key</Button>
        <Button color="white" onClick={onDone}>
          Done
        </Button>
      </div>
    </div>
  )
}

export default function APIKeys() {
  const confirm = useConfirm()
  const toast = useToast()
  const query = useQuery(LightEventService.method.listAPIKeys, {})
  const remove = useMutation(LightEventService.method.deleteAPIKey)
  const [open, setOpen] = useState(false)
  const [secret, setSecret] = useState<string | null>(null)
  const close = () => {
    setOpen(false)
    setSecret(null)
  }

  async function onDelete(key: APIKey) {
    const { ok } = await confirm({
      title: "Delete API key?",
      message: `Integrations using “${key.name}” will stop working immediately.`,
      confirmLabel: "Delete key",
      danger: true,
    })
    if (!ok) {
      return
    }
    try {
      await remove.mutateAsync({ uid: key.uid })
      toast.success("API key deleted")
      await invalidateAll()
    } catch (err) {
      toast.error(errorMessage(err))
    }
  }

  return (
    <Section title="API keys" actions={<Button onClick={() => setOpen(true)}>New API key</Button>}>
      <p className="mb-4 text-sm text-gray-600">API keys give integrations full administrative access to the API.</p>
      <Query query={query}>
        {(resp) =>
          resp.apiKeys.length === 0 ? (
            <EmptyState>No API keys.</EmptyState>
          ) : (
            <Table
              headers={[
                { label: "Name" },
                { label: "Key" },
                { label: "Created" },
                { label: "Last used" },
                { label: "Actions", className: "text-right" },
              ]}
            >
              {resp.apiKeys.map((key) => (
                <tr key={key.uid}>
                  <Td className="font-medium">{key.name}</Td>
                  <Td className="font-mono text-xs text-gray-600">{key.prefix}…</Td>
                  <Td className="text-gray-600">{formatDate(key.createdAt)}</Td>
                  <Td className="text-gray-600">{key.lastUsedAt ? formatDateTime(key.lastUsedAt) : "Never"}</Td>
                  <Td className="text-right">
                    <Button color="white" size="small" onClick={() => onDelete(key)}>
                      Delete
                    </Button>
                  </Td>
                </tr>
              ))}
            </Table>
          )
        }
      </Query>
      <Modal open={open} title={secret ? "API key created" : "New API key"} onClose={close}>
        {open &&
          (secret ? (
            <SecretView secret={secret} onDone={close} />
          ) : (
            <CreateKeyForm onCreated={setSecret} onCancel={close} />
          ))}
      </Modal>
    </Section>
  )
}

import { useMutation, useQuery } from "@connectrpc/connect-query"
import { useState } from "react"

import type { Tag } from "../gen/lightevent/v1/service_pb"
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

// slugify suggests a tag name from the label.
function slugify(label: string): string {
  return label
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64)
}

// TagForm creates a tag, or changes the label of an existing tag.
function TagForm({ tag, onDone }: { tag?: Tag; onDone: () => void }) {
  const toast = useToast()
  const create = useMutation(LightEventService.method.createTag)
  const update = useMutation(LightEventService.method.updateTag)
  const [label, setLabel] = useState(tag?.label ?? "")
  const [name, setName] = useState(tag?.name ?? "")
  const [nameEdited, setNameEdited] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pending = create.isPending || update.isPending

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      if (tag) {
        await update.mutateAsync({ tag: { name: tag.name, label } })
      } else {
        await create.mutateAsync({ tag: { name, label } })
      }
      await invalidateAll()
      toast.success(tag ? "Tag saved" : "Tag created")
      onDone()
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <Field id="tag-label" label="Label" required hint="Shown to members, e.g. “Vinyasa Yoga”.">
        <input
          id="tag-label"
          className={inputClassName}
          value={label}
          maxLength={50}
          required
          onChange={(e) => {
            setLabel(e.target.value)
            if (!tag && !nameEdited) {
              setName(slugify(e.target.value))
            }
          }}
        />
      </Field>
      <Field
        id="tag-name"
        label="Name"
        required
        hint={tag ? "The name cannot be changed." : "Used in links and in the client app's tags option."}
      >
        <input
          id="tag-name"
          className={`${inputClassName} font-mono`}
          value={name}
          disabled={!!tag}
          autoCapitalize="none"
          spellCheck={false}
          required
          onChange={(e) => {
            setName(e.target.value)
            setNameEdited(true)
          }}
        />
      </Field>
      {error && <Alert variant="error">{error}</Alert>}
      <div className="flex gap-2">
        <Button type="submit" disabled={pending || label.trim() === "" || name.trim() === ""}>
          {tag ? "Save tag" : "Create tag"}
        </Button>
        <Button color="white" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

export default function Tags() {
  const confirm = useConfirm()
  const toast = useToast()
  const query = useQuery(LightEventService.method.listTags, {})
  const remove = useMutation(LightEventService.method.deleteTag)
  // editing is the tag being edited, or null when creating a tag.
  const [editing, setEditing] = useState<Tag | null>(null)
  const [open, setOpen] = useState(false)

  function openForm(tag: Tag | null) {
    setEditing(tag)
    setOpen(true)
  }

  async function onDelete(tag: Tag) {
    const { ok } = await confirm({
      title: "Delete tag?",
      message:
        tag.eventCount > 0
          ? `“${tag.label}” will be removed from ${tag.eventCount} event${tag.eventCount === 1 ? "" : "s"}.`
          : `“${tag.label}” will be deleted.`,
      confirmLabel: "Delete tag",
      danger: true,
    })
    if (!ok) {
      return
    }
    try {
      await remove.mutateAsync({ name: tag.name })
      toast.success("Tag deleted")
      await invalidateAll()
    } catch (err) {
      toast.error(errorMessage(err))
    }
  }

  return (
    <Section title="Tags" actions={<Button onClick={() => openForm(null)}>New tag</Button>}>
      <p className="mb-4 text-sm text-gray-600">
        Tags describe kinds of events, such as “Vinyasa Yoga” or “Beginner”. Members filter events by tag in the client
        app.
      </p>
      <Query query={query}>
        {(resp) =>
          resp.tags.length === 0 ? (
            <EmptyState>No tags.</EmptyState>
          ) : (
            <Table
              headers={[
                { label: "Label" },
                { label: "Name" },
                { label: "Events" },
                { label: "Actions", className: "text-right" },
              ]}
            >
              {resp.tags.map((tag) => (
                <tr key={tag.name}>
                  <Td className="font-medium">{tag.label}</Td>
                  <Td className="font-mono text-xs text-gray-600">{tag.name}</Td>
                  <Td className="text-gray-600">{tag.eventCount}</Td>
                  <Td className="text-right whitespace-nowrap">
                    <Button color="white" size="small" onClick={() => openForm(tag)} aria-label={`Edit ${tag.label}`}>
                      Edit
                    </Button>{" "}
                    <Button color="white" size="small" onClick={() => onDelete(tag)} aria-label={`Delete ${tag.label}`}>
                      Delete
                    </Button>
                  </Td>
                </tr>
              ))}
            </Table>
          )
        }
      </Query>
      <Modal open={open} title={editing ? "Edit tag" : "New tag"} onClose={() => setOpen(false)}>
        {open && <TagForm key={editing?.name ?? ""} tag={editing ?? undefined} onDone={() => setOpen(false)} />}
      </Modal>
    </Section>
  )
}

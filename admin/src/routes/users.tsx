import { useMutation, useQuery } from "@connectrpc/connect-query"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { PasswordForm } from "../forms/password"
import type { User } from "../gen/lightevent/v1/service_pb"
import { formatDate, formatName } from "../lib/format"
import { useIdentity } from "../lib/identity"
import { errorMessage, invalidateAll, LightEventService } from "../lib/rpc"
import { Alert } from "../units/alert"
import { Badge } from "../units/badge"
import { Button } from "../units/button"
import { useConfirm } from "../units/confirm"
import { describedBy, Field, inputClassName } from "../units/field"
import { Section } from "../units/layout"
import { Modal } from "../units/modal"
import { Query } from "../units/query"
import { Table, Td } from "../units/table"
import { useToast } from "../units/toast"

type UserValues = { username: string; firstName: string; lastName: string; email: string; password: string }

function UserForm({ user, onDone }: { user?: User; onDone: () => void }) {
  const toast = useToast()
  const create = useMutation(LightEventService.method.createUser)
  const update = useMutation(LightEventService.method.updateUser)
  const { register, handleSubmit, formState, setError } = useForm<UserValues>({
    defaultValues: {
      username: user?.username ?? "",
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      email: user?.email ?? "",
      password: "",
    },
  })
  const errors = formState.errors

  async function onSubmit(values: UserValues) {
    try {
      if (user) {
        const { password: _, ...rest } = values
        await update.mutateAsync({ uid: user.uid, ...rest })
      } else {
        await create.mutateAsync(values)
      }
      await invalidateAll()
      toast.success(user ? "User saved" : "User created")
      onDone()
    } catch (err) {
      setError("root", { message: errorMessage(err) })
    }
  }

  return (
    <form id="user-form" onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4">
      <Field
        id="username"
        label="Username"
        required
        error={errors.username?.message}
        hint="3–64 letters, numbers, '.', '_' or '-'."
      >
        <input
          id="username"
          autoComplete="off"
          autoCapitalize="none"
          className={inputClassName}
          aria-describedby={describedBy("username")}
          {...register("username", {
            required: "Username is required",
            pattern: { value: /^[a-zA-Z0-9._-]{3,64}$/, message: "Use 3–64 letters, numbers, '.', '_' or '-'" },
          })}
        />
      </Field>
      {!user && (
        <Field
          id="new-password"
          label="Password"
          required
          error={errors.password?.message}
          hint="At least 12 characters."
        >
          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            className={inputClassName}
            aria-describedby={describedBy("new-password")}
            {...register("password", {
              required: "Password is required",
              minLength: { value: 12, message: "Use at least 12 characters" },
            })}
          />
        </Field>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="user-first" label="First name">
          <input id="user-first" className={inputClassName} {...register("firstName")} />
        </Field>
        <Field id="user-last" label="Last name">
          <input id="user-last" className={inputClassName} {...register("lastName")} />
        </Field>
      </div>
      <Field id="user-email" label="Email" error={errors.email?.message}>
        <input
          id="user-email"
          type="email"
          className={inputClassName}
          aria-describedby={describedBy("user-email")}
          {...register("email", {
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email address" },
          })}
        />
      </Field>
      {errors.root?.message && <Alert variant="error">{errors.root.message}</Alert>}
      <div className="flex gap-2">
        <Button type="submit" disabled={formState.isSubmitting}>
          {user ? "Save user" : "Create user"}
        </Button>
        <Button color="white" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

type Dialog = { kind: "create" } | { kind: "edit"; user: User } | { kind: "password"; user: User } | null

export default function Users() {
  const identity = useIdentity()
  const confirm = useConfirm()
  const toast = useToast()
  const query = useQuery(LightEventService.method.listUsers, {})
  const remove = useMutation(LightEventService.method.deleteUser)
  const [dialog, setDialog] = useState<Dialog>(null)
  const close = () => setDialog(null)

  async function onDelete(user: User) {
    const { ok } = await confirm({
      title: "Delete user?",
      message: `${user.username} will be deleted and signed out everywhere.`,
      confirmLabel: "Delete user",
      danger: true,
    })
    if (!ok) {
      return
    }
    try {
      await remove.mutateAsync({ uid: user.uid })
      toast.success("User deleted")
      await invalidateAll()
    } catch (err) {
      toast.error(errorMessage(err))
    }
  }

  return (
    <Section title="Users" actions={<Button onClick={() => setDialog({ kind: "create" })}>New user</Button>}>
      <p className="mb-4 text-sm text-gray-600">Users can sign in to this admin panel and manage everything in it.</p>
      <Query query={query}>
        {(resp) => (
          <Table
            headers={[
              { label: "Username" },
              { label: "Name" },
              { label: "Email" },
              { label: "Created" },
              { label: "Actions", className: "text-right" },
            ]}
          >
            {resp.users.map((user) => {
              const self = identity.scheme === "user" && identity.subjectUid === user.uid
              return (
                <tr key={user.uid}>
                  <Td className="font-medium">
                    {user.username} {self && <Badge variant="green">You</Badge>}
                  </Td>
                  <Td>{formatName(user.firstName, user.lastName) || <span className="text-gray-400">—</span>}</Td>
                  <Td>{user.email || <span className="text-gray-400">—</span>}</Td>
                  <Td className="text-gray-600">{formatDate(user.createdAt)}</Td>
                  <Td className="text-right">
                    <div className="inline-flex gap-2">
                      <Button color="white" size="small" onClick={() => setDialog({ kind: "edit", user })}>
                        Edit
                      </Button>
                      {!self && (
                        <>
                          <Button color="white" size="small" onClick={() => setDialog({ kind: "password", user })}>
                            Reset password
                          </Button>
                          <Button color="white" size="small" onClick={() => onDelete(user)}>
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </Td>
                </tr>
              )
            })}
          </Table>
        )}
      </Query>
      <Modal open={dialog?.kind === "create"} title="New user" onClose={close}>
        {dialog?.kind === "create" && <UserForm onDone={close} />}
      </Modal>
      <Modal open={dialog?.kind === "edit"} title="Edit user" onClose={close}>
        {dialog?.kind === "edit" && <UserForm user={dialog.user} onDone={close} />}
      </Modal>
      <Modal
        open={dialog?.kind === "password"}
        title={dialog?.kind === "password" ? `Reset password for ${dialog.user.username}` : ""}
        onClose={close}
      >
        {dialog?.kind === "password" && <PasswordForm userUid={dialog.user.uid} self={false} onDone={close} />}
      </Modal>
    </Section>
  )
}

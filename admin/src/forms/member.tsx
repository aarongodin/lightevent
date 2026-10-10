import { useMutation } from "@connectrpc/connect-query"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router"

import type { Member } from "../gen/lightevent/v1/service_pb"
import { errorMessage, invalidateAll, LightEventService } from "../lib/rpc"
import { memberRoute, membersRoute } from "../router"
import { Alert } from "../units/alert"
import { Button } from "../units/button"
import { describedBy, Field, inputClassName } from "../units/field"
import { Box } from "../units/layout"
import { useToast } from "../units/toast"
import { DiscardButton } from "./discard"

type FormValues = { email: string; firstName: string; lastName: string }

export function MemberForm({ member }: { member?: Member }) {
  const navigate = useNavigate()
  const toast = useToast()
  const create = useMutation(LightEventService.method.createMember)
  const update = useMutation(LightEventService.method.updateMember)
  const { register, handleSubmit, formState, setError } = useForm<FormValues>({
    defaultValues: { email: member?.email ?? "", firstName: member?.firstName ?? "", lastName: member?.lastName ?? "" },
  })
  const errors = formState.errors

  async function onSubmit(values: FormValues) {
    try {
      const resp = member ? await update.mutateAsync({ uid: member.uid, ...values }) : await create.mutateAsync(values)
      await invalidateAll()
      toast.success(member ? "Member saved" : "Member created")
      navigate(memberRoute(resp.member?.uid ?? member?.uid ?? ""))
    } catch (err) {
      setError("root", { message: errorMessage(err) })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="mx-auto max-w-xl">
      <Box className="grid gap-4">
        <Field id="email" label="Email address" required error={errors.email?.message}>
          <input
            id="email"
            type="email"
            autoComplete="off"
            className={inputClassName}
            aria-invalid={!!errors.email}
            aria-describedby={describedBy("email")}
            {...register("email", {
              required: "Email is required",
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email address" },
            })}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="firstName" label="First name" error={errors.firstName?.message}>
            <input
              id="firstName"
              autoComplete="off"
              className={inputClassName}
              {...register("firstName", { maxLength: 100 })}
            />
          </Field>
          <Field id="lastName" label="Last name" error={errors.lastName?.message}>
            <input
              id="lastName"
              autoComplete="off"
              className={inputClassName}
              {...register("lastName", { maxLength: 100 })}
            />
          </Field>
        </div>
      </Box>
      {errors.root?.message && (
        <Alert variant="error" title="Could not save the member" className="mt-4">
          {errors.root.message}
        </Alert>
      )}
      <div className="mt-6 flex gap-2">
        <Button type="submit" disabled={formState.isSubmitting}>
          {formState.isSubmitting ? "Saving…" : member ? "Save changes" : "Create member"}
        </Button>
        <DiscardButton to={member ? memberRoute(member.uid) : membersRoute} dirty={formState.isDirty} />
      </div>
    </form>
  )
}

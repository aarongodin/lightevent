import { useMutation } from "@connectrpc/connect-query"
import { useForm } from "react-hook-form"

import { errorMessage, LightEventService } from "../lib/rpc"
import { Alert } from "../units/alert"
import { Button } from "../units/button"
import { describedBy, Field, inputClassName } from "../units/field"
import { useToast } from "../units/toast"

type FormValues = { currentPassword: string; password: string; confirm: string }

type PasswordFormProps = {
  userUid: string
  // self requires the current password and keeps the current session signed in.
  self: boolean
  onDone?: () => void
}

export function PasswordForm({ userUid, self, onDone }: PasswordFormProps) {
  const toast = useToast()
  const setPassword = useMutation(LightEventService.method.setUserPassword)
  const { register, handleSubmit, formState, setError, reset, watch } = useForm<FormValues>({
    defaultValues: { currentPassword: "", password: "", confirm: "" },
  })
  const errors = formState.errors

  async function onSubmit(values: FormValues) {
    try {
      await setPassword.mutateAsync({
        uid: userUid,
        password: values.password,
        currentPassword: values.currentPassword,
      })
      reset()
      toast.success(
        self ? "Password changed. Other sessions were signed out." : "Password reset. The user was signed out.",
      )
      onDone?.()
    } catch (err) {
      setError("root", { message: errorMessage(err) })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4">
      {self && (
        <Field id="currentPassword" label="Current password" required error={errors.currentPassword?.message}>
          <input
            id="currentPassword"
            type="password"
            autoComplete="current-password"
            className={inputClassName}
            aria-describedby={describedBy("currentPassword")}
            {...register("currentPassword", { required: "Enter your current password" })}
          />
        </Field>
      )}
      <Field
        id="password"
        label="New password"
        required
        error={errors.password?.message}
        hint="At least 12 characters."
      >
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          className={inputClassName}
          aria-describedby={describedBy("password")}
          {...register("password", {
            required: "Enter a new password",
            minLength: { value: 12, message: "Use at least 12 characters" },
          })}
        />
      </Field>
      <Field id="confirm" label="Confirm new password" required error={errors.confirm?.message}>
        <input
          id="confirm"
          type="password"
          autoComplete="new-password"
          className={inputClassName}
          aria-describedby={describedBy("confirm")}
          {...register("confirm", { validate: (v) => v === watch("password") || "Passwords do not match" })}
        />
      </Field>
      {errors.root?.message && <Alert variant="error">{errors.root.message}</Alert>}
      <div>
        <Button type="submit" disabled={formState.isSubmitting}>
          {self ? "Change password" : "Reset password"}
        </Button>
      </div>
    </form>
  )
}

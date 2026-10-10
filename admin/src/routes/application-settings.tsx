import { useMutation, useQuery } from "@connectrpc/connect-query"
import { useForm } from "react-hook-form"

import type { AppSettings } from "../gen/lightevent/v1/service_pb"
import { errorMessage, invalidateAll, LightEventService } from "../lib/rpc"
import { Alert } from "../units/alert"
import { Button } from "../units/button"
import { describedBy, Field, inputClassName } from "../units/field"
import { Box, Section } from "../units/layout"
import { Query } from "../units/query"
import { useToast } from "../units/toast"

const timeZones: string[] = Intl.supportedValuesOf("timeZone")

type FormValues = { organizationName: string; supportEmail: string; timezone: string }

function SettingsForm({ settings }: { settings: AppSettings }) {
  const toast = useToast()
  const update = useMutation(LightEventService.method.updateSettings)
  const { register, handleSubmit, formState, setError, reset } = useForm<FormValues>({
    defaultValues: {
      organizationName: settings.organizationName,
      supportEmail: settings.supportEmail,
      timezone: settings.timezone,
    },
  })

  async function onSubmit(values: FormValues) {
    try {
      const resp = await update.mutateAsync({ settings: values })
      reset({
        organizationName: resp.settings?.organizationName ?? "",
        supportEmail: resp.settings?.supportEmail ?? "",
        timezone: resp.settings?.timezone ?? "",
      })
      await invalidateAll()
      toast.success("Settings saved")
    } catch (err) {
      setError("root", { message: errorMessage(err) })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-xl">
      <Section title="Application">
        <Box className="grid gap-4">
          <Field id="organizationName" label="Organization name" hint="Shown in emails sent to members.">
            <input
              id="organizationName"
              className={inputClassName}
              aria-describedby={describedBy("organizationName")}
              {...register("organizationName")}
            />
          </Field>
          <Field
            id="supportEmail"
            label="Support email"
            hint="Members are told to contact this address with questions."
            error={formState.errors.supportEmail?.message}
          >
            <input
              id="supportEmail"
              type="email"
              className={inputClassName}
              aria-describedby={describedBy("supportEmail")}
              {...register("supportEmail", {
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email address" },
              })}
            />
          </Field>
          <Field id="timezone" label="Time zone" hint="Used to format event dates in emails.">
            <select
              id="timezone"
              className={inputClassName}
              aria-describedby={describedBy("timezone")}
              {...register("timezone")}
            >
              <option value="">UTC</option>
              {timeZones.map((tz) => (
                <option key={tz} value={tz}>
                  {tz.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </Field>
        </Box>
      </Section>
      {formState.errors.root?.message && (
        <Alert variant="error" className="mt-4">
          {formState.errors.root.message}
        </Alert>
      )}
      <div className="mt-6">
        <Button type="submit" disabled={formState.isSubmitting || !formState.isDirty}>
          {formState.isSubmitting ? "Saving…" : "Save settings"}
        </Button>
      </div>
    </form>
  )
}

export default function ApplicationSettings() {
  const query = useQuery(LightEventService.method.getSettings, {})
  return <Query query={query}>{(resp) => <SettingsForm settings={resp.settings ?? ({} as AppSettings)} />}</Query>
}

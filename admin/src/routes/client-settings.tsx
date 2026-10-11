import { create } from "@bufbuild/protobuf"
import { useMutation, useQuery } from "@connectrpc/connect-query"
import { useForm } from "react-hook-form"

import { ClientSettingsSchema, type ClientSettings as Settings } from "../gen/lightevent/v1/service_pb"
import { errorMessage, invalidateAll, LightEventService } from "../lib/rpc"
import { Alert } from "../units/alert"
import { Button } from "../units/button"
import { Checkbox, describedBy, Field, inputClassName } from "../units/field"
import { Box, Section } from "../units/layout"
import { Query } from "../units/query"
import { useToast } from "../units/toast"

type FormValues = { allowedOrigins: string; showRemainingSpots: boolean; disableSeriesRegistration: boolean }

function formValues(settings: Settings): FormValues {
  return {
    allowedOrigins: settings.allowedOrigins.join("\n"),
    showRemainingSpots: settings.showRemainingSpots,
    disableSeriesRegistration: settings.disableSeriesRegistration,
  }
}

// installSnippet is the code websites add to embed the client app.
function installSnippet(): string {
  const origin = window.location.origin
  return `<div id="events"></div>
<script src="${origin}/client/lightevent-client.js"></script>
<script>
  LightEventClient.init({
    baseURL: "${origin}",
    element: "#events",
  })
</script>`
}

function SettingsForm({ settings }: { settings: Settings }) {
  const toast = useToast()
  const update = useMutation(LightEventService.method.updateClientSettings)
  const { register, handleSubmit, formState, setError, reset } = useForm<FormValues>({
    defaultValues: formValues(settings),
  })

  async function onSubmit(values: FormValues) {
    try {
      const resp = await update.mutateAsync({
        settings: {
          allowedOrigins: values.allowedOrigins
            .split(/[\s,]+/)
            .map((o) => o.trim())
            .filter(Boolean),
          showRemainingSpots: values.showRemainingSpots,
          disableSeriesRegistration: values.disableSeriesRegistration,
        },
      })
      if (resp.settings) {
        reset(formValues(resp.settings))
      }
      await invalidateAll()
      toast.success("Settings saved")
    } catch (err) {
      setError("root", { message: errorMessage(err) })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-xl">
      <Section title="Client app">
        <Box className="grid gap-4">
          <Field
            id="allowedOrigins"
            label="Website origins"
            hint="One per line, e.g. https://www.example.com. Only websites on these origins can show the client app."
          >
            <textarea
              id="allowedOrigins"
              rows={3}
              className={`${inputClassName} font-mono`}
              spellCheck={false}
              aria-describedby={describedBy("allowedOrigins")}
              {...register("allowedOrigins")}
            />
          </Field>
          <Checkbox
            id="showRemainingSpots"
            label="Show remaining spots"
            hint="Members see how many spots are left on dates of events with a capacity."
            {...register("showRemainingSpots")}
          />
          <Checkbox
            id="disableSeriesRegistration"
            label="Only allow registering for single dates"
            hint="Members cannot register for every date of an event at once. Administrators still can."
            {...register("disableSeriesRegistration")}
          />
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

export default function ClientSettings() {
  const query = useQuery(LightEventService.method.getClientSettings, {})
  return (
    <div className="grid gap-8">
      <Query query={query}>{(resp) => <SettingsForm settings={resp.settings ?? create(ClientSettingsSchema)} />}</Query>
      <Section title="Installation" className="max-w-xl">
        <p className="mb-3 text-sm text-gray-600">
          Add this code to a page of your website to show upcoming events and let members register.
        </p>
        <pre className="overflow-x-auto rounded-md bg-gray-900 p-4 text-xs text-gray-100">
          <code>{installSnippet()}</code>
        </pre>
      </Section>
    </div>
  )
}

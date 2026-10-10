import { useMutation } from "@connectrpc/connect-query"
import { useFieldArray, useForm } from "react-hook-form"
import { useNavigate } from "react-router"

import type { Event as Evt } from "../gen/lightevent/v1/service_pb"
import { browserTimeZone, formatCapacity, fromDateTimeLocal, toDateTimeLocal } from "../lib/format"
import { errorMessage, invalidateAll, LightEventService } from "../lib/rpc"
import { eventRoute, eventsRoute } from "../router"
import { Alert } from "../units/alert"
import { Badge } from "../units/badge"
import { Button } from "../units/button"
import { Checkbox, describedBy, Field, inputClassName } from "../units/field"
import { Box, Section } from "../units/layout"
import { useToast } from "../units/toast"
import { DiscardButton } from "./discard"

type DateValue = { uid: string; value: string; cancelled: boolean; registrationCount: number }

type FormValues = {
  name: string
  title: string
  description: string
  capacity: number
  hidden: boolean
  closed: boolean
  dates: DateValue[]
}

const emptyDate: DateValue = { uid: "", value: "", cancelled: false, registrationCount: 0 }

function defaultValues(event?: Evt): FormValues {
  if (!event) {
    return { name: "", title: "", description: "", capacity: 0, hidden: false, closed: false, dates: [emptyDate] }
  }
  return {
    name: event.name,
    title: event.title,
    description: event.description,
    capacity: event.capacity,
    hidden: event.hidden,
    closed: event.closed,
    dates: event.dates.map((d) => ({
      uid: d.uid,
      value: toDateTimeLocal(d.value),
      cancelled: d.cancelled,
      registrationCount: d.registrationCount,
    })),
  }
}

// slugify suggests an event name from the title.
function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64)
}

type EventFormProps = {
  // event is only present when editing.
  event?: Evt
}

export function EventForm({ event }: EventFormProps) {
  const editing = event !== undefined
  const navigate = useNavigate()
  const toast = useToast()
  const create = useMutation(LightEventService.method.createEvent)
  const update = useMutation(LightEventService.method.updateEvent)
  const { register, control, handleSubmit, formState, setError, setValue, getFieldState, watch } = useForm<FormValues>({
    defaultValues: defaultValues(event),
  })
  const { fields, append, remove } = useFieldArray({ control, name: "dates" })
  const errors = formState.errors
  const capacity = watch("capacity")

  async function onSubmit(values: FormValues) {
    const payload = {
      name: values.name,
      title: values.title,
      description: values.description,
      capacity: Number(values.capacity) || 0,
      hidden: values.hidden,
      closed: values.closed,
      dates: values.dates.map((d) => ({ uid: d.uid, value: fromDateTimeLocal(d.value) })),
    }
    try {
      const resp = editing ? await update.mutateAsync({ event: payload }) : await create.mutateAsync({ event: payload })
      await invalidateAll()
      toast.success(editing ? "Event saved" : "Event created")
      navigate(eventRoute(resp.event?.name ?? values.name))
    } catch (err) {
      setError("root", { message: errorMessage(err) })
    }
  }

  const nameField = register("name", {
    required: "Name is required",
    pattern: {
      value: /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/,
      message: "Use lowercase letters, numbers, and single dashes or underscores between them",
    },
    maxLength: { value: 64, message: "Name must be at most 64 characters" },
  })
  const titleField = register("title", {
    required: "Title is required",
    maxLength: { value: 100, message: "Title must be at most 100 characters" },
    onChange: (e) => {
      // Suggest a name from the title until the name is edited by hand.
      if (!editing && !getFieldState("name").isDirty) {
        setValue("name", slugify(e.target.value))
      }
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Section title="Details">
          <Box className="grid gap-4">
            <Field id="title" label="Title" required error={errors.title?.message}>
              <input
                id="title"
                className={inputClassName}
                aria-invalid={!!errors.title}
                aria-describedby={describedBy("title")}
                {...titleField}
              />
            </Field>
            <Field
              id="name"
              label="Name"
              required
              error={errors.name?.message}
              hint={editing ? "The name cannot be changed after the event is created." : "Used in links to the event."}
            >
              <input
                id="name"
                className={`${inputClassName} font-mono`}
                disabled={editing}
                autoCapitalize="none"
                spellCheck={false}
                aria-invalid={!!errors.name}
                aria-describedby={describedBy("name")}
                {...nameField}
              />
            </Field>
            <Field id="description" label="Description" error={errors.description?.message}>
              <textarea
                id="description"
                rows={4}
                className={inputClassName}
                aria-describedby={describedBy("description")}
                {...register("description", { maxLength: { value: 5000, message: "Description is too long" } })}
              />
            </Field>
            <Field
              id="capacity"
              label="Capacity per date"
              error={errors.capacity?.message}
              hint="Maximum registrations for each date, including registrations for all dates. Use 0 for unlimited."
            >
              <input
                id="capacity"
                type="number"
                min={0}
                max={100000}
                inputMode="numeric"
                className={`${inputClassName} max-w-40`}
                aria-invalid={!!errors.capacity}
                aria-describedby={describedBy("capacity")}
                {...register("capacity", {
                  valueAsNumber: true,
                  min: { value: 0, message: "Capacity cannot be negative" },
                  max: { value: 100000, message: "Capacity is too large" },
                })}
              />
            </Field>
            <Checkbox
              id="hidden"
              label="Hidden"
              hint="Hidden events are not listed for members."
              {...register("hidden")}
            />
            <Checkbox
              id="closed"
              label="Registration closed"
              hint="Members cannot register. Administrators can still add registrations."
              {...register("closed")}
            />
          </Box>
        </Section>
        <Section title="Dates">
          <Box className="grid gap-3">
            <p className="text-xs text-gray-500">Times are in your time zone ({browserTimeZone}).</p>
            {errors.dates?.root?.message && <p className="text-xs text-red-600">{errors.dates.root.message}</p>}
            {fields.map((field, idx) => {
              const dateError = errors.dates?.[idx]?.value?.message
              return (
                <div key={field.id} className="flex flex-wrap items-center gap-2">
                  <label htmlFor={`date-${idx}`} className="sr-only">
                    Date {idx + 1}
                  </label>
                  <input
                    id={`date-${idx}`}
                    type="datetime-local"
                    className={`${inputClassName} w-auto flex-1`}
                    disabled={field.cancelled}
                    aria-invalid={!!dateError}
                    {...register(`dates.${idx}.value`, { required: "Choose a date and time" })}
                  />
                  {field.uid && (
                    <span className="w-24 text-xs text-gray-500">
                      {formatCapacity(field.registrationCount, Number(capacity) || 0)} registered
                    </span>
                  )}
                  {field.cancelled ? (
                    <Badge variant="red">Cancelled</Badge>
                  ) : (
                    <Button
                      color="white"
                      size="small"
                      onClick={() => remove(idx)}
                      disabled={fields.length === 1}
                      aria-label={`Remove date ${idx + 1}`}
                      title={
                        field.registrationCount > 0
                          ? "Dates with registrations should be cancelled instead"
                          : "Remove date"
                      }
                    >
                      Remove
                    </Button>
                  )}
                  {dateError && <p className="w-full text-xs text-red-600">{dateError}</p>}
                </div>
              )
            })}
            <Button color="white" onClick={() => append(emptyDate)}>
              Add date
            </Button>
          </Box>
        </Section>
      </div>

      {errors.root?.message && (
        <Alert variant="error" title="Could not save the event" className="mt-6">
          {errors.root.message}
        </Alert>
      )}

      <div className="mt-6 flex gap-2">
        <Button type="submit" disabled={formState.isSubmitting}>
          {formState.isSubmitting ? "Saving…" : editing ? "Save changes" : "Create event"}
        </Button>
        <DiscardButton to={editing ? eventRoute(event.name) : eventsRoute} dirty={formState.isDirty} />
      </div>
    </form>
  )
}

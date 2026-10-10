import clsx from "clsx"
import type { ReactNode } from "react"

export const inputClassName = clsx(
  "block w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm shadow-xs",
  "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:outline-none",
  "disabled:bg-gray-100 disabled:text-gray-500",
  "aria-invalid:border-red-400",
)

type FieldProps = {
  id: string
  label: string
  hint?: ReactNode
  error?: string
  required?: boolean
  children: ReactNode
}

// Field lays out a label, control, hint and error message. The control must use the same id, and should set
// aria-describedby={describedBy(id)} so hints and errors are announced.
export function Field({ id, label, hint, error, required, children }: FieldProps) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-gray-800">
        {label}
        {required && (
          <span className="text-red-600" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-gray-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}

export function describedBy(id: string): string {
  return `${id}-hint ${id}-error`
}

type CheckboxProps = {
  id: string
  label: string
  hint?: string
} & React.InputHTMLAttributes<HTMLInputElement>

export function Checkbox({ id, label, hint, ...props }: CheckboxProps) {
  return (
    <div className="flex gap-3">
      <input id={id} type="checkbox" className="mt-0.5 size-4 rounded border-gray-300 text-blue-600" {...props} />
      <div>
        <label htmlFor={id} className="text-sm font-medium text-gray-800">
          {label}
        </label>
        {hint && <p className="text-xs text-gray-500">{hint}</p>}
      </div>
    </div>
  )
}

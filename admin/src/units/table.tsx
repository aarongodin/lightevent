import clsx from "clsx"
import type { PropsWithChildren, ReactNode } from "react"

type TableProps = PropsWithChildren<{
  headers: { label: string; className?: string }[]
}>

// Table renders a responsive table that scrolls horizontally on narrow screens.
export function Table({ headers, children }: TableProps) {
  return (
    <div className="overflow-x-auto rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
      <table className="w-full min-w-max text-sm">
        <thead className="border-b border-gray-200 bg-gray-50 text-xs text-gray-500">
          <tr>
            {headers.map((h) => (
              <th key={h.label} scope="col" className={clsx("px-4 py-2 text-left font-medium", h.className)}>
                {h.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">{children}</tbody>
      </table>
    </div>
  )
}

export function Td({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <td className={clsx("px-4 py-3 align-middle", className)}>{children}</td>
}

export function EmptyState({ children, action }: PropsWithChildren<{ action?: ReactNode }>) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-gray-300 bg-white px-4 py-10 text-center text-sm text-gray-600">
      <div>{children}</div>
      {action}
    </div>
  )
}

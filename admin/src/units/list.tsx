import type { ReactNode } from "react"

type DefinitionListProps = {
  items: { title: string; value: ReactNode }[]
}

export function DefinitionList({ items }: DefinitionListProps) {
  return (
    <dl className="divide-y divide-gray-100 overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
      {items.map((item) => (
        <div key={item.title} className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4">
          <dt className="text-sm text-gray-500">{item.title}</dt>
          <dd className="mt-1 text-sm break-words whitespace-pre-line text-gray-900 sm:col-span-2 sm:mt-0">
            {item.value === "" || item.value === undefined || item.value === null ? (
              <span className="text-gray-400">—</span>
            ) : (
              item.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
}

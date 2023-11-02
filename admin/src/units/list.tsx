import clsx from "clsx"

type DefinitionListItemProps = {
  variant: "grid" | "flex"
  title: React.ReactNode
  data: React.ReactNode
  stripe?: boolean
  className?: string
}

export function DefinitionListItem({ title, data, stripe, variant, className }: DefinitionListItemProps) {
  const dlClass = clsx(
    "p-4 border-b",
    { "bg-white": !stripe },
    { "bg-gray-50": stripe },
    { "sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6": variant === "grid" },
    { "flex justify-between": variant === "flex" },
    className,
  )
  return (
    <div className={dlClass}>
      <dt className="text-sm font-medium text-gray-500">{title}</dt>
      <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 text-sm">{data}</dd>
    </div>
  )
}

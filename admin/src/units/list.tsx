import clsx from "clsx"

type DefinitionListItemProps = {
  variant: "grid" | "flex"
  title: React.ReactNode
  data: React.ReactNode
  className?: string
  dtValue?: boolean
}

export function DefinitionListItem({ title, data, variant, className, dtValue }: DefinitionListItemProps) {
  const dtClass = clsx("text-sm", { "text-gray-800": dtValue }, { "text-gray-500": !dtValue })
  const dlClass = clsx(
    "px-4 py-3 border-b bg-white md:first:rounded-t-lg md:last:rounded-b-lg",
    { "sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6": variant === "grid" },
    { "flex justify-between items-center": variant === "flex" },
    className,
  )

  return (
    <div className={dlClass}>
      <dt className={dtClass}>{title}</dt>
      <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 text-sm flex items-center">{data}</dd>
    </div>
  )
}

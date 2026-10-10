import clsx from "clsx"
import type { PropsWithChildren } from "react"

export type BadgeVariant = "gray" | "indigo" | "sky" | "green" | "amber" | "red"

export interface BadgeProps extends PropsWithChildren {
  variant: BadgeVariant
  className?: string
  title?: string
}

export function Badge({ children, variant, className, title }: BadgeProps) {
  return (
    <span
      title={title}
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        {
          "bg-gray-100 text-gray-700": variant === "gray",
          "bg-indigo-100 text-indigo-800": variant === "indigo",
          "bg-sky-100 text-sky-800": variant === "sky",
          "bg-green-100 text-green-800": variant === "green",
          "bg-amber-100 text-amber-800": variant === "amber",
          "bg-red-100 text-red-800": variant === "red",
        },
        className,
      )}
    >
      {children}
    </span>
  )
}

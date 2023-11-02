import clsx from "clsx"
import { PropsWithChildren } from "react"

export interface BadgeProps extends PropsWithChildren {
  variant: "gray" | "indigo" | "sky"
}

export function Badge({ children, variant }: BadgeProps) {
  const cls = clsx(
    "inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-medium",
    { "bg-gray-100 text-gray-800": variant === "gray" },
    { "bg-indigo-100 text-indigo-800": variant === "indigo" },
    { "bg-sky-100 text-sky-800": variant === "sky" },
  )
  return <span className={cls}>{children}</span>
}

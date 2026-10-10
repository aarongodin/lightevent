import clsx from "clsx"
import type { ReactNode } from "react"

type AlertProps = {
  variant: "error" | "warning" | "info" | "success"
  title?: string
  children: ReactNode
  className?: string
}

export function Alert({ variant, title, children, className }: AlertProps) {
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={clsx(
        "rounded-md border p-4 text-sm",
        {
          "border-red-200 bg-red-50 text-red-700": variant === "error",
          "border-amber-200 bg-amber-50 text-amber-800": variant === "warning",
          "border-blue-200 bg-blue-50 text-blue-800": variant === "info",
          "border-green-200 bg-green-50 text-green-800": variant === "success",
        },
        className,
      )}
    >
      {title && <span className="mr-2 font-semibold">{title}</span>}
      {children}
    </div>
  )
}

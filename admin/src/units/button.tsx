import clsx from "clsx"
import type { ButtonHTMLAttributes } from "react"
import { Link, type LinkProps } from "react-router"

export type ButtonColor = "primary" | "secondary" | "white" | "danger"
export type ButtonSize = "normal" | "small"

type StyleProps = {
  color?: ButtonColor
  size?: ButtonSize
  className?: string
}

export function buttonClassName({ color = "primary", size = "normal", className }: StyleProps): string {
  return clsx(
    "inline-flex items-center justify-center gap-2 rounded-full font-medium shadow-sm transition-colors",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600",
    "disabled:cursor-not-allowed disabled:opacity-50",
    {
      "px-4 py-2 text-sm": size === "normal",
      "px-3 py-1 text-xs": size === "small",
      "bg-blue-600 text-white hover:bg-blue-500": color === "primary",
      "bg-sky-700 text-white hover:bg-sky-600": color === "secondary",
      "bg-white text-gray-900 ring-1 ring-gray-300 ring-inset hover:bg-gray-50": color === "white",
      "bg-red-600 text-white hover:bg-red-500": color === "danger",
    },
    className,
  )
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & StyleProps

export function Button({ color, size, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClassName({ color, size, className })} {...props} />
}

type LinkButtonProps = LinkProps & StyleProps

export function LinkButton({ color, size, className, ...props }: LinkButtonProps) {
  return <Link className={buttonClassName({ color, size, className })} {...props} />
}

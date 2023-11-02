import clsx from "clsx"
import { ComponentChildren, h } from "preact"

type ButtonPropsColor = "primary" | "secondary" | "neutral" | "white" | undefined

interface ButtonProps {
  color?: ButtonPropsColor
  className?: string
  children?: ComponentChildren
  onClick?: () => void
}

export function Button({ className, color = "primary", children, ...p }: ButtonProps) {
  const props = {
    ...p,
    className: clsx(
      "transition-colors px-4 py-2 text-sm drop-shadow rounded-full",
      {
        // Select a background color set based on desired color string
        "bg-blue-600 hover:bg-blue-500 text-white": color === "primary",
        "bg-sky-700 hover:bg-sky-600 text-white": color === "secondary",
        "bg-neutral-700 hover:bg-neutral-600 text-white": color === "neutral",
        "bg-white hover:bg-gray-50 text-gray-900": color === "white",
      },
      className,
    ),
  }
  return h("button", props, children)
}

import classNames from "classnames"
import { ButtonHTMLAttributes, createElement, FunctionComponent } from "react"
import { Link, LinkProps } from "react-router-dom"

type ButtonPropsColor = "primary" | "secondary" | "neutral" | "white" | undefined

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  color?: ButtonPropsColor
  using?: string | FunctionComponent
  className?: string
}

export function Button({ using = "button", className, color = "primary", ...p }: ButtonProps) {
  const props = {
    ...p,
    className: classNames(className, "transition-colors px-4 py-2 text-sm drop-shadow rounded-full", {
      // Select a background color set based on desired color string
      "bg-blue-600 hover:bg-blue-500 text-white": color === "primary",
      "bg-sky-700 hover:bg-sky-600 text-white": color === "secondary",
      "bg-neutral-700 hover:bg-neutral-600 text-white": color === "neutral",
      "bg-white hover:bg-gray-50 text-gray-900": color === "white",
    }),
  } as any
  return createElement(using, props)
}

interface LinkButtonProps extends LinkProps, ButtonProps {}

export function LinkButton(props: LinkButtonProps) {
  return <Button using={Link} {...props} />
}

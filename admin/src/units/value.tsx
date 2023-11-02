import { PropsWithChildren } from "react"

import { RegistrationKind } from "../rpc"
import { Badge, BadgeProps } from "./badge"

export function boolToString(b: boolean): string {
  return b ? "Yes" : "No"
}

export function formatRegistrationKind(kind: RegistrationKind): string {
  switch (kind) {
    case RegistrationKind.REG_ONCE:
      return "Once"
    case RegistrationKind.REG_SERIES:
      return "Series"
    case RegistrationKind.UNRECOGNIZED:
      return "Unknown"
  }
}

export function formatConfCode(confCode: string): string {
  return `${confCode.slice(0, 4)}-${confCode.slice(4)}`
}

interface RegistrationKindBadgeProps extends PropsWithChildren {
  kind: RegistrationKind
  count?: number
}

export function RegistrationKindBadge({ kind, count }: RegistrationKindBadgeProps) {
  let variant: BadgeProps["variant"] = "gray"
  if (kind === RegistrationKind.REG_ONCE) {
    variant = "sky"
  } else if (kind === RegistrationKind.REG_SERIES) {
    variant = "indigo"
  }

  return (
    <Badge variant={variant}>
      <span>{formatRegistrationKind(kind)}</span>
      {count !== undefined && <span>{count}</span>}
    </Badge>
  )
}

// export function RegistrationKindBadge({ kind }: { kind: RegistrationKind }) {
//   const content = formatRegistrationKind(kind)
//   switch (kind) {
//     case RegistrationKind.REG_ONCE:
//       return <Badge content={content} variant="sky" />
//     case RegistrationKind.REG_SERIES:
//       return <Badge content={content} variant="indigo" />
//     default:
//       return <Badge content={content} variant="gray" />
//   }
// }

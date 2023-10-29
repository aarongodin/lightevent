import { RegistrationKind } from "../rpc"
import { Badge } from "./badge"

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

export function RegistrationKindBadge({ kind }: { kind: RegistrationKind }) {
  const content = formatRegistrationKind(kind)
  switch (kind) {
    case RegistrationKind.REG_ONCE:
      return <Badge content={content} variant="sky" />
    case RegistrationKind.REG_SERIES:
      return <Badge content={content} variant="indigo" />
    default:
      return <Badge content={content} variant="gray" />
  }
}

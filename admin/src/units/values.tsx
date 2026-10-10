import { RegistrationKind } from "../gen/lightevent/v1/service_pb"
import { Badge, type BadgeVariant } from "./badge"

export function formatRegistrationKind(kind: RegistrationKind): string {
  switch (kind) {
    case RegistrationKind.ONCE:
      return "Single date"
    case RegistrationKind.SERIES:
      return "All dates"
    default:
      return "Unknown"
  }
}

export function RegistrationKindBadge({ kind, count }: { kind: RegistrationKind; count?: number }) {
  let variant: BadgeVariant = "gray"
  if (kind === RegistrationKind.ONCE) {
    variant = "sky"
  } else if (kind === RegistrationKind.SERIES) {
    variant = "indigo"
  }
  return (
    <Badge variant={variant}>
      {formatRegistrationKind(kind)}
      {count !== undefined && <span className="font-semibold">{count}</span>}
    </Badge>
  )
}

export function yesNo(b: boolean): string {
  return b ? "Yes" : "No"
}

import { RegistrationKind } from "../rpc"

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

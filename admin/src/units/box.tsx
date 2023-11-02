import { PropsWithChildren } from "react"

export function Box({ children }: PropsWithChildren) {
  return <div className="bg-white rounded-lg p-4 drop-shadow">{children}</div>
}

import { PropsWithChildren } from "react"

export function Box({ children }: PropsWithChildren) {
  return <div className="bg-white md:rounded-lg p-4 drop-shadow">{children}</div>
}

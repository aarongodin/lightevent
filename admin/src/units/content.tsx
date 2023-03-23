import { PropsWithChildren } from "react"

export function Content({ children }: PropsWithChildren) {
  return (
    <div className="container mx-auto my-4">
      <div className="mt-4">{children}</div>
    </div>
  )
}

import { PropsWithChildren } from "react"

export function Content({ children }: PropsWithChildren) {
  return (
    <div className="md:container md:mx-auto my-4 p-0">
      <div className="mt-4">{children}</div>
    </div>
  )
}

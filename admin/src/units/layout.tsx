import clsx from "clsx"
import type { PropsWithChildren, ReactNode } from "react"

// Content is the main column of a page.
export function Content({ children }: PropsWithChildren) {
  return <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
}

// Box is a white card.
export function Box({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={clsx("rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200", className)}>{children}</div>
}

type SectionProps = PropsWithChildren<{
  title: string
  actions?: ReactNode
  className?: string
}>

// Section is a titled group of content within a page.
export function Section({ title, actions, children, className }: SectionProps) {
  return (
    <section className={className} aria-label={title}>
      <div className="mb-3 flex min-h-8 items-center justify-between gap-4">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {children}
    </section>
  )
}

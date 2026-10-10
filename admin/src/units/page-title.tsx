import type { ReactNode } from "react"
import { Link } from "react-router"

import { useDocumentTitle } from "../lib/hooks"

type PageTitleProps = {
  title: string
  // subtitle is shown under the title, e.g. an identifier.
  subtitle?: ReactNode
  // back renders a link to a parent page above the title.
  back?: { to: string; label: string }
  // tabs are rendered next to the title and switch views within the page.
  tabs?: ReactNode
  // actions are placed on the right of the title area.
  actions?: ReactNode
}

export function PageTitle({ title, subtitle, back, tabs, actions }: PageTitleProps) {
  useDocumentTitle(title)
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-wrap items-center gap-x-8 gap-y-2">
          <div className="min-w-0">
            {back && (
              <Link to={back.to} className="text-xs text-gray-500 hover:text-gray-800">
                ← {back.label}
              </Link>
            )}
            <h1 className="truncate text-lg font-bold">{title}</h1>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
          {tabs}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  )
}

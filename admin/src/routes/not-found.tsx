import { LinkButton } from "../units/button"
import { Content } from "../units/layout"
import { PageTitle } from "../units/page-title"
import { EmptyState } from "../units/table"

type NotFoundProps = {
  // what describes the missing resource, e.g. "event".
  what?: string
  back?: { to: string; label: string }
}

export default function NotFound({ what = "page", back = { to: "/", label: "Go to the dashboard" } }: NotFoundProps) {
  return (
    <>
      <PageTitle title="Not found" />
      <Content>
        <EmptyState
          action={
            <LinkButton to={back.to} color="white">
              {back.label}
            </LinkButton>
          }
        >
          The {what} you requested does not exist or has been removed.
        </EmptyState>
      </Content>
    </>
  )
}

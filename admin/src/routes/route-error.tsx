import { isRouteErrorResponse, useRouteError } from "react-router"

import { errorMessage } from "../lib/rpc"
import { Alert } from "../units/alert"
import { LinkButton } from "../units/button"
import { Content } from "../units/layout"
import { PageTitle } from "../units/page-title"

export default function RouteError() {
  const error = useRouteError()
  const message = isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : errorMessage(error)
  return (
    <>
      <PageTitle title="Something went wrong" />
      <Content>
        <Alert variant="error">{message}</Alert>
        <div className="mt-4">
          <LinkButton to="/" color="white">
            Go to the dashboard
          </LinkButton>
        </div>
      </Content>
    </>
  )
}

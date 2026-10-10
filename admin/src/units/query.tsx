import type { UseQueryResult } from "@tanstack/react-query"
import type { ReactNode } from "react"

import { errorMessage, isNotFound } from "../lib/rpc"
import { Alert } from "./alert"
import { Button } from "./button"
import { TableLoader } from "./loader"

type QueryProps<T> = {
  query: UseQueryResult<T, unknown>
  children: (data: T) => ReactNode
  loader?: ReactNode
  // notFound is rendered instead of an error when the resource does not exist.
  notFound?: ReactNode
}

// Query renders loading and error states for a query, and the children once data is available. Errors stay
// inside the page so navigation remains usable.
export function Query<T>({ query, children, loader, notFound }: QueryProps<T>) {
  if (query.isPending) {
    return loader ?? <TableLoader />
  }
  if (query.isError) {
    if (notFound && isNotFound(query.error)) {
      return notFound
    }
    return (
      <Alert variant="error" title="Error">
        {errorMessage(query.error)}{" "}
        <Button size="small" color="white" className="ml-2" onClick={() => query.refetch()}>
          Retry
        </Button>
      </Alert>
    )
  }
  return children(query.data)
}

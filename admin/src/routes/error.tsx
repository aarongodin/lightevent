import { useNavigate, useRouteError } from "react-router-dom"
import { TwirpError } from "twirp-ts"

import { Button } from "../units/button"

type ErrorContentsProps = {
  statusText?: string
  fallback: string
}

function ErrorContents({ statusText, fallback }: ErrorContentsProps) {
  const navigate = useNavigate()
  let expandedStatus
  let recoverable = false

  switch (statusText) {
    case "Not Found":
      expandedStatus = "The resource or page you requested was not found."
      recoverable = true
      break
    default:
      expandedStatus = `Something unexpected happened: ${fallback}`
  }

  return (
    <>
      {expandedStatus}
      {recoverable && <Button onClick={() => navigate(-1)}>Go Back</Button>}
    </>
  )
}

export default function ErrorPage() {
  const error: any = useRouteError()
  return (
    <div className="flex w-screen h-screen items-center justify-center">
      <div className="w-96 flex flex-col items-center gap-6">
        <h1 className="text-lg font-bold">Error</h1>
        <ErrorContents statusText={error.statusText} fallback={error.message} />
      </div>
    </div>
  )
}

import { useEffect, useState } from "preact/hooks"

import { useClient } from "../client"
import { Page, useRouter } from "../router"
import { Event as Evt } from "../rpc"
import { EventView } from "./views/events"

const RegisterRoute: Page = ({ data }) => {
  const client = useClient()
  const router = useRouter()
  const [evt, setEvt] = useState<Evt | null>(null)
  const [loading, setLoading] = useState(false)

  if (data === undefined || typeof data.eventName !== "string") {
    router.navigate({ name: "events" })
    return null
  }

  useEffect(() => {
    setLoading(true)
    client.GetEvent({ name: data.eventName }).then((resp) => {
      setEvt(resp)
    })
    setLoading(false)
  }, [data.eventName])

  if (loading || evt === null) {
    return <div>...loading</div>
  }

  return (
    <>
      <EventView event={evt} hideActions />
    </>
  )
}

export default RegisterRoute

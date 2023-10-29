import { createContext, useContext, useEffect, useState } from "react"

import { LightEventClientProtobuf } from "./rpc/service.twirp"

export const ClientContext = createContext<LightEventClientProtobuf | null>(null)

export function useClient(): LightEventClientProtobuf {
  const v = useContext(ClientContext)
  if (v === null) {
    throw new Error("uninitialized client")
  }
  return v
}

type WithRequestProps<T> = {
  children: (response: T, refreshing: boolean, reload: () => void) => any
  load: (client: LightEventClientProtobuf) => Promise<T>
  deps: any[]
  loader: React.FunctionComponent
}

export function WithRequest<T>({ children, load, deps, loader: Loader }: WithRequestProps<T>) {
  const client = useClient()
  const [response, setResponse] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    handleLoading(response !== null)
  }, deps)

  function handleLoading(initialLoad: boolean) {
    if (initialLoad) {
      setRefreshing(true)
    }
    load(client)
      .then((resp) => {
        setResponse(resp)
        setRefreshing(false)
      })
      .catch((err) => {
        setError(err)
        setRefreshing(false)
      })
  }

  if (error !== null) {
    throw error
  }

  if (response === null) {
    return <Loader />
  }

  return children(response, refreshing, () => handleLoading(false))
}

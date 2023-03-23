import { createContext, useContext, useEffect, useState } from "react"

import { SpectralClientProtobuf } from "./rpc/service.twirp"

export const ClientContext = createContext<SpectralClientProtobuf | null>(null)

export function useClient(): SpectralClientProtobuf {
  const v = useContext(ClientContext)
  if (v === null) {
    throw new Error("uninitialized client")
  }
  return v
}

type WithRequestProps<T> = {
  children: (response: T, refreshing: boolean) => any
  load: (client: SpectralClientProtobuf) => Promise<T>
  deps: any[]
  loader: React.FunctionComponent
}

export function WithRequest<T>({ children, load, deps, loader: Loader }: WithRequestProps<T>) {
  const client = useClient()
  const [response, setResponse] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (response !== null) {
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
  }, deps)

  if (error !== null) {
    throw error
  }

  if (response === null) {
    return <Loader />
  }

  return children(response, refreshing)
}

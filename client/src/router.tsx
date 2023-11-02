import { ComponentType, createContext, h } from "preact"
import { useContext, useState } from "preact/hooks"

type RouteData = Record<string, any>

export type Route = {
  name: string
  data?: RouteData
}

export type RouterState = {
  current: Route
  navigate: (to: Route) => void
}

export const RouterContext = createContext<RouterState | null>(null)

export function useRouter(): RouterState {
  const state = useContext(RouterContext)
  if (state === null) {
    throw new Error("unknown route")
  }
  return state
}

type RouterProps = {
  initialRoute: Route
  routes: Record<string, Page>
}

export type Page = ComponentType<{ data?: RouteData }>

export function Router({ initialRoute, routes }: RouterProps) {
  const [current, setCurrent] = useState<Route>(initialRoute)
  const route = routes[current.name]

  return (
    <RouterContext.Provider
      value={{
        current,
        navigate: setCurrent,
      }}
    >
      {h(route, { data: current.data })}
    </RouterContext.Provider>
  )
}

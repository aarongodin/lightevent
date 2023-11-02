import { ClientContext } from "./client"
import { Route, Router } from "./router"
import EventsRoute from "./routes/events"
import RegisterRoute from "./routes/register"
import { LightEventClientJSON } from "./rpc"

type AppProps = {
  client: LightEventClientJSON
  initialRoute: Route
}

const routes = {
  events: EventsRoute,
  register: RegisterRoute,
}

export default function App({ client, initialRoute }: AppProps) {
  return (
    <ClientContext.Provider value={client}>
      <Router initialRoute={initialRoute} routes={routes}></Router>
    </ClientContext.Provider>
  )
}

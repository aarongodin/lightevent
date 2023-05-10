import { createBrowserRouter } from "react-router-dom"

import Dashboard from "./routes/dashboard"
import ErrorPage from "./routes/error"
import Event from "./routes/event"
import EventEdit from "./routes/event-edit"
import Events from "./routes/events"
import EventsCreate from "./routes/events-create"
import Members from "./routes/members"
import Registrations from "./routes/registrations"
import Root from "./routes/root"

// Event Routes
export const eventsRoute = "/events"
export const newEventRoute = "/events/_create"
export const eventRoute = (eventName: string) => `/events/${eventName}`
export const editEventRoute = (eventName: string) => `/events/${eventName}/_edit`

export default createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "registrations",
        element: <Registrations />,
      },
      {
        path: "events/:eventName",
        element: <Event />,
      },
      {
        path: "events/:eventName/_edit",
        element: <EventEdit />,
      },
      {
        path: "events/_create",
        element: <EventsCreate />,
      },
      {
        path: "events",
        element: <Events />,
      },
      {
        path: "members",
        element: <Members />,
      },
    ],
  },
])

import base64 from "base-64"
import { createBrowserRouter } from "react-router-dom"

import Dashboard from "./routes/dashboard"
import ErrorPage from "./routes/error"
import Event from "./routes/event"
import EventEdit from "./routes/event-edit"
import EventRegistrationsCreate from "./routes/event-registrations-create"
import Events from "./routes/events"
import EventsCreate from "./routes/events-create"
import Member from "./routes/member"
import MemberEdit from "./routes/member-edit"
import Members from "./routes/members"
import MembersCreate from "./routes/members-create"
import Registrations from "./routes/registrations"
import Root from "./routes/root"

// Event Routes
export const eventsRoute = "/events"
export const newEventRoute = "/events/_create"
export const eventRoute = (eventName: string) => `/events/${eventName}`
export const editEventRoute = (eventName: string) => `/events/${eventName}/_edit`
export const newEventRegistrationRoute = (eventName: string) => `/events/${eventName}/registrations/_create`

// Member Routes
export const memberRoute = (email: string) => {
  return `/members/${base64.encode(email)}`
}
export const memberEmailFromRoute = (path: string) => {
  return base64.decode(path.replace("/members/", ""))
}
export const newMemberRoute = `/members/_create`
export const editMemberRoute = (email: string) => `${memberRoute(email)}/_edit`

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
        path: "events/:eventName/registrations/_create",
        element: <EventRegistrationsCreate />,
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
      {
        path: "members/_create",
        element: <MembersCreate />,
      },
      {
        path: "members/:emailEncoded",
        element: <Member />,
      },
      {
        path: "members/:emailEncoded/_edit",
        element: <MemberEdit />,
      },
    ],
  },
])

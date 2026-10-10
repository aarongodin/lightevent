import { createBrowserRouter, Navigate } from "react-router"

import Account from "./routes/account"
import APIKeys from "./routes/api-keys"
import ApplicationSettings from "./routes/application-settings"
import Dashboard from "./routes/dashboard"
import Event from "./routes/event"
import EventEdit from "./routes/event-edit"
import EventRegistrationsCreate from "./routes/event-registrations-create"
import Events from "./routes/events"
import EventsCreate from "./routes/events-create"
import Member from "./routes/member"
import MemberEdit from "./routes/member-edit"
import Members from "./routes/members"
import MembersCreate from "./routes/members-create"
import NotFound from "./routes/not-found"
import Root from "./routes/root"
import RouteError from "./routes/route-error"
import Settings from "./routes/settings"
import Users from "./routes/users"

// Event routes
export const eventsRoute = "/events"
export const newEventRoute = "/events/_create"
export const eventRoute = (name: string) => `/events/${encodeURIComponent(name)}`
export const editEventRoute = (name: string) => `${eventRoute(name)}/_edit`
export const newEventRegistrationRoute = (name: string) => `${eventRoute(name)}/registrations/_create`

// Member routes
export const membersRoute = "/members"
export const newMemberRoute = "/members/_create"
export const memberRoute = (uid: string) => `/members/${encodeURIComponent(uid)}`
export const editMemberRoute = (uid: string) => `${memberRoute(uid)}/_edit`

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        // Route errors render inside the layout so the navigation stays available.
        errorElement: <RouteError />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: "events", element: <Events /> },
          { path: "events/_create", element: <EventsCreate /> },
          { path: "events/:eventName", element: <Event /> },
          { path: "events/:eventName/_edit", element: <EventEdit /> },
          { path: "events/:eventName/registrations/_create", element: <EventRegistrationsCreate /> },
          { path: "members", element: <Members /> },
          { path: "members/_create", element: <MembersCreate /> },
          { path: "members/:memberUid", element: <Member /> },
          { path: "members/:memberUid/_edit", element: <MemberEdit /> },
          {
            path: "settings",
            element: <Settings />,
            children: [
              { index: true, element: <Navigate to="application" replace /> },
              { path: "application", element: <ApplicationSettings /> },
              { path: "account", element: <Account /> },
              { path: "users", element: <Users /> },
              { path: "api-keys", element: <APIKeys /> },
            ],
          },
          { path: "*", element: <NotFound /> },
        ],
      },
    ],
  },
])

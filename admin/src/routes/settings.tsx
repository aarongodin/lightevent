import clsx from "clsx"
import { NavLink, Outlet } from "react-router"

import { Content } from "../units/layout"
import { PageTitle } from "../units/page-title"

const tabs = [
  { to: "/settings/application", label: "Application" },
  { to: "/settings/tags", label: "Tags" },
  { to: "/settings/client", label: "Client app" },
  { to: "/settings/account", label: "Your account" },
  { to: "/settings/users", label: "Users" },
  { to: "/settings/api-keys", label: "API keys" },
]

function Tabs() {
  return (
    <nav aria-label="Settings" className="-mx-1 overflow-x-auto text-sm">
      <ul className="flex gap-1">
        {tabs.map((tab) => (
          <li key={tab.to}>
            <NavLink
              to={tab.to}
              className={({ isActive }) =>
                clsx("block rounded-md px-3 py-1.5 whitespace-nowrap", {
                  "bg-gray-900 text-white": isActive,
                  "text-gray-600 hover:bg-gray-100 hover:text-gray-900": !isActive,
                })
              }
            >
              {tab.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default function Settings() {
  return (
    <>
      <PageTitle title="Settings" tabs={<Tabs />} />
      <Content>
        <Outlet />
      </Content>
    </>
  )
}

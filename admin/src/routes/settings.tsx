import { NavLink, Outlet } from "react-router-dom"

import { PageTitle } from "../units/page-title"

const navLink = "px-2 py-1"
const navLinkPill = `${navLink} bg-black text-white rounded-md`

const navLinkClassName = ({ isActive }: { isActive: boolean }) => (isActive ? navLinkPill : navLink)

function LocalActions() {
  return (
    <nav className="text-sm">
      <ul className="flex gap-x-4">
        <li>
          <NavLink to="/settings/application" className={navLinkClassName}>
            Application
          </NavLink>
        </li>
        <li>
          <NavLink to="/settings/account" className={navLinkClassName}>
            Account
          </NavLink>
        </li>
        <li>
          <NavLink to="/settings/users" className={navLinkClassName}>
            Users
          </NavLink>
        </li>
        <li>
          <NavLink to="/settings/api-keys" className={navLinkClassName}>
            API Keys
          </NavLink>
        </li>
      </ul>
    </nav>
  )
}

export default function Settings() {
  return (
    <>
      <PageTitle title="Settings" localActions={<LocalActions />} />
      <div className="container mx-auto mt-4">
        <Outlet />
      </div>
    </>
  )
}

import clsx from "clsx"
import { NavLink, Outlet } from "react-router"

import { useIdentity } from "../lib/identity"
import { logout } from "../lib/rpc"
import logo from "../static/lightevent.svg"

const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
  clsx("rounded-md px-3 py-1.5 whitespace-nowrap transition-colors", {
    "bg-white text-gray-900": isActive,
    "text-white/90 hover:bg-white/10 hover:text-white": !isActive,
  })

export default function Root() {
  const identity = useIdentity()
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <div className="bg-gradient-to-r from-indigo-600 to-blue-800 text-sm text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <img src={logo} alt="LightEvent" className="hidden h-5 brightness-0 invert sm:block" />
            <nav aria-label="Main" className="-mx-1 overflow-x-auto">
              <ul className="flex gap-1">
                <li>
                  <NavLink to="/" end className={navLinkClassName}>
                    Dashboard
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/events" className={navLinkClassName}>
                    Events
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/members" className={navLinkClassName}>
                    Members
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/settings" className={navLinkClassName}>
                    Settings
                  </NavLink>
                </li>
              </ul>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-white/80 sm:inline" title="Signed in as">
              {identity.displayName}
            </span>
            <button
              type="button"
              onClick={() => logout()}
              className="rounded-md px-3 py-1.5 text-white/90 hover:bg-white/10 hover:text-white"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
      <div id="main" className="flex-1">
        <Outlet />
      </div>
    </div>
  )
}

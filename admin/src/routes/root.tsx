import clsx from "clsx"
import { Link, NavLink, Outlet } from "react-router-dom"

const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
  clsx({ "px-2 py-1 bg-white text-black rounded-md": isActive })

export default function Root() {
  return (
    <>
      <div className="bg-gradient-to-r from-indigo-600 to-blue-800 text-white p-4 text-sm">
        <div className="container mx-auto w-full flex justify-between items-center">
          <div className="flex">
            <div>
              <nav>
                <ul className="flex gap-x-6">
                  <li>
                    <NavLink to="/" className={navLinkClassName}>
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
                </ul>
              </nav>
            </div>
          </div>
          <div className="flex">
            <nav>
              <ul className="flex gap-x-6">
                <li>
                  <NavLink to="/settings" className={navLinkClassName}>
                    Settings
                  </NavLink>
                </li>
                <li>
                  <Link to="/logout">Logout</Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
      <Outlet />
    </>
  )
}

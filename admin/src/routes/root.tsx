import { Link, NavLink, Outlet } from "react-router-dom"

const navLink = "px-2 py-1"
const navLinkPill = `${navLink} bg-white text-black rounded-md`

const navLinkClassName = ({ isActive }: { isActive: boolean }) => (isActive ? navLinkPill : navLink)

export default function Root() {
  return (
    <>
      <div className="bg-gradient-to-r from-indigo-600 to-blue-800 text-white p-4 text-sm">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex">
            <div>
              <nav>
                <ul className="flex gap-x-4">
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
              <ul className="flex gap-x-4">
                <li>
                  <NavLink to="/settings/application" className={navLinkClassName}>
                    Settings
                  </NavLink>
                </li>
                <li>
                  <Link to="/logout" className={navLink}>
                    Logout
                  </Link>
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

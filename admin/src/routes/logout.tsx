import { useEffect } from "react"

async function logout() {
  await fetch(`${window.origin}/auth/logout`, {
    method: "POST",
    credentials: "same-origin",
  })
}

export default function LogoutRoute() {
  // call the logout endpoint
  useEffect(() => {
    logout().then(() => {
      window.location.href = "/"
    })
  })

  return null
}

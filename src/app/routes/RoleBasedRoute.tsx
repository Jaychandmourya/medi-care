import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { useAppSelector } from "@/app/hooks"
import type { Role } from "@/types/auth/auth"

interface Props {
  children: ReactNode
  allowedRoles: Role[]
}

const getRoleBasedRoute = (role: Role) => {
  switch (role) {
    case "doctor":
      return "/doctor"
    case "admin":
      return "/admin"
    case "nurse":
      return "/nurse"
    case "receptionist":
      return "/receptionist"
    default:
      return "/login"
  }
}

const RoleBasedRoute = ({ children, allowedRoles }: Props) => {
  const user = useAppSelector((state) => state.auth.user)

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={getRoleBasedRoute(user.role)} replace />
  }

  return <>{children}</>
}

export default RoleBasedRoute
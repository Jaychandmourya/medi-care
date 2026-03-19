import { Navigate } from "react-router-dom"
import type{ ReactNode } from "react"
import { useAppSelector } from "@/app/hooks"
import type{ Role } from "@/types/auth/auth"

interface Props {
  children: ReactNode
  allowedRoles: Role[]
}

const RoleBasedRoute = ({ children, allowedRoles }: Props) => {
  const user = useAppSelector((state) => state.auth.user)

  if (!user) return <Navigate to="/login" replace />

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export default RoleBasedRoute
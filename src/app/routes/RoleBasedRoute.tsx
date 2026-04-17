import type { ReactNode } from "react"
import { useAppSelector } from "@/app/hooks"
import type { Role } from "@/types/auth/auth"
import AccessDenied from "@/pages/error/AccessDenied"

interface Props {
  children: ReactNode
  allowedRoles: Role[]
}

const RoleBasedRoute = ({ children, allowedRoles }: Props) => {
  const user = useAppSelector((state) => state.auth.user)

  if (!user) {
    return <AccessDenied />
  }

  if (!allowedRoles.includes(user.role)) {
    return <AccessDenied />
  }

  return <>{children}</>
}

export default RoleBasedRoute
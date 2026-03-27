import { Navigate } from "react-router-dom"
import type { ReactNode } from "react"
import { useAppSelector } from "@/app/hooks"

interface Props {
  children: ReactNode
}

const ProtectedRoute = ({ children }: Props) => {
  const user = useAppSelector((state) => state.auth.user)
  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
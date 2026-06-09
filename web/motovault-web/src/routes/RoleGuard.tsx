import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import type { Role } from '../types'

interface Props {
  roles: Role[]
}

export default function RoleGuard({ roles }: Props) {
  const hasRole = useAuthStore((s) => s.hasRole)
  return hasRole(roles) ? <Outlet /> : <Navigate to="/unauthorized" replace />
}

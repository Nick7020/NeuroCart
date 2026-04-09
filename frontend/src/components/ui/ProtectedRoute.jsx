import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { PageLoader } from './Spinner'

export function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <PageLoader />
  if (!user) return <Navigate to="/login" replace />
  // Redirect vendor users away from /admin/* paths
  if (user.role === 'vendor' && location.pathname.startsWith('/admin')) {
    return <Navigate to="/vendor" replace />
  }
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

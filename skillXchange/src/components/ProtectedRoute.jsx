import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth()
    const location = useLocation()

    // Still checking auth — show nothing yet (resolves in <200ms from cache)
    if (loading) return null

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    return children
}

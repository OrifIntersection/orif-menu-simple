import { useAuth } from '../contexts/JwtAuthContext'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Spin } from 'antd'

export const ProtectedRoute = ({ element, requireAdmin = false }) => {
  const { isAuthenticated, loading, userRole } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return

    if (!isAuthenticated) {
      console.log('Accès admin refusé: utilisateur non authentifié')
      navigate('/login', { replace: true })
      return
    }

    if (requireAdmin && userRole !== 'admin') {
      console.log('Accès admin refusé: rôle insuffisant', userRole)
      navigate('/', { replace: true })
      return
    }
  }, [isAuthenticated, loading, userRole, requireAdmin, navigate])

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh'
      }}>
        <Spin size="large" tip="Vérification de l'authentification..." />
      </div>
    )
  }

  if (isAuthenticated && (!requireAdmin || userRole === 'admin')) {
    return element
  }

  return null
}

export default ProtectedRoute

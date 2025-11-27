// Composant de protection des routes - vérifie l'authentification
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Spin } from 'antd'

/**
 * ProtectedRoute - Wrapper pour protéger les routes admin
 * Vérifie que l'utilisateur est authentifié avant d'afficher le contenu
 * @param {React.ReactNode} element - L'élément à protéger
 * @param {boolean} requireAdmin - Si true, demande le rôle admin (default: false)
 */
export const ProtectedRoute = ({ element, requireAdmin = false }) => {
  const { isAuthenticated, loading, userRole, isSupabaseConfigured } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Si on est encore en train de charger, ne rien faire
    if (loading) return

    // Si Supabase n'est pas configuré, mode développement - laisser passer
    if (!isSupabaseConfigured) {
      console.warn('⚠️ Supabase non configuré - mode développement: accès admin accordé')
      return
    }

    // Si l'utilisateur n'est pas authentifié, redirection vers login
    if (!isAuthenticated) {
      console.log('🔐 Accès admin refusé: utilisateur non authentifié')
      navigate('/login', { replace: true })
      return
    }

    // Si on demande l'accès admin et l'utilisateur n'est pas admin
    if (requireAdmin && userRole !== 'admin') {
      console.log('🔐 Accès admin refusé: rôle insuffisant', userRole)
      navigate('/', { replace: true })
      return
    }
  }, [isAuthenticated, loading, userRole, requireAdmin, navigate, isSupabaseConfigured])

  // Pendant le chargement, afficher un spinner
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

  // Si Supabase n'est pas configuré (mode dev), afficher le contenu
  if (!isSupabaseConfigured) {
    return element
  }

  // Si l'utilisateur est authentifié (et admin si requis), afficher le contenu
  if (isAuthenticated && (!requireAdmin || userRole === 'admin')) {
    return element
  }

  // Sinon, ne rien afficher (la redirection se fera via l'effet)
  return null
}

export default ProtectedRoute

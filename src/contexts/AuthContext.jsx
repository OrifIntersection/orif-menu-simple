// Provider d'authentification intégré avec Supabase
import React, { useState, useEffect } from 'react'
import AuthContext from './auth-context.jsx'
import { authHelpers, isSupabaseConfigured } from '../lib/supabase'

export const AuthProvider = ({ children }) => {
  // 🎭 MODE TEST - Connecté en tant qu'admin
  const [isAuthenticated, setIsAuthenticated] = useState(true)
  const [user, setUser] = useState({ email: 'admin@demo.local' })
  const [userRole, setUserRole] = useState('admin')
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState({ user_id: 'demo-123', full_name: 'Admin Demo', role: 'admin' })

  // Initialisation de l'auth au montage
  useEffect(() => {
    // 🎭 useEffect désactivé en mode test
    return
    
    const initializeAuth = async () => {
      try {
        // Vérifier si Supabase est configuré
        if (!isSupabaseConfigured()) {
          console.warn('Supabase non configuré - mode simulation')
          setLoading(false)
          return
        }

        // Vérifier la session existante
        const { session } = await authHelpers.getSession()
        
        if (session?.user) {
          await handleUserSession(session.user)
        }

        // Écouter les changements d'authentification
        const { data: { subscription } } = authHelpers.onAuthStateChange(async (event, session) => {
          // Log seulement les événements importants (pas INITIAL_SESSION)
          if (event !== 'INITIAL_SESSION') {
            console.log('Auth state changed:', event, session?.user?.email || 'No user')
          }
          
          if (session?.user) {
            await handleUserSession(session.user)
          } else {
            handleUserSignOut()
          }
        })

        setLoading(false)

        // Cleanup
        return () => {
          if (subscription) {
            subscription.unsubscribe()
          }
        }

      } catch (error) {
        console.error('Erreur initialisation auth:', error)
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  // Gérer une session utilisateur
  const handleUserSession = async (supabaseUser) => {
    try {
      setUser(supabaseUser)
      setIsAuthenticated(true)

      // Récupérer le profil utilisateur
      const { profile } = await authHelpers.getUserProfile(supabaseUser.id)
      
      if (profile) {
        setProfile(profile)
        setUserRole(profile.role || 'guest')
      } else {
        // Profil pas encore créé (première connexion)
        setUserRole('guest')
        console.log('Profil utilisateur en cours de création...')
      }

    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error)
      setUserRole('guest')
    }
  }

  // Gérer la déconnexion
  const handleUserSignOut = () => {
    setUser(null)
    setProfile(null)
    setIsAuthenticated(false)
    setUserRole('guest')
  }

  // Fonction de connexion par Magic Link
  const signInWithMagicLink = async (email) => {
    try {
      if (!isSupabaseConfigured()) {
        throw new Error('Authentification non disponible - Supabase non configuré')
      }

      await authHelpers.signInWithMagicLink(email)
      return { success: true, message: 'Email de connexion envoyé ! Vérifiez votre boîte mail.' }
      
    } catch (error) {
      console.error('Erreur connexion Magic Link:', error)
      return { success: false, message: error.message }
    }
  }

  // Fonction de déconnexion
  const signOut = async () => {
    try {
      // Déconnexion locale immédiate
      handleUserSignOut()
      
      if (!isSupabaseConfigured()) {
        // Mode simulation - déconnexion complète
        return { success: true }
      }

      // Déconnexion Supabase en arrière-plan
      await authHelpers.signOut()
      return { success: true }
      
    } catch (error) {
      console.error('Erreur déconnexion:', error)
      return { success: false, message: error.message }
    }
  }

  // Fonctions de compatibilité (pour l'ancien système)
  const login = () => {
    // Mode simulation fallback
    if (!isSupabaseConfigured()) {
      setIsAuthenticated(true)
      setUserRole('admin')
      setUser({ email: 'admin@simulation.local' })
    }
  }

  const logout = () => {
    signOut()
  }

  // Vérifier si l'utilisateur est admin
  const isAdmin = () => {
    return userRole === 'admin'
  }

  // Obtenir les informations utilisateur
  const getUserInfo = () => {
    return {
      email: user?.email || null,
      fullName: profile?.full_name || null,
      role: userRole
    }
  }

  const value = {
    // État
    isAuthenticated,
    user,
    userRole,
    profile,
    loading,
    
    // Fonctions principales
    signInWithMagicLink,
    signOut,
    
    // Fonctions de compatibilité
    login,
    logout,
    
    // Utilitaires
    isAdmin,
    getUserInfo,
    isSupabaseConfigured: isSupabaseConfigured()
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
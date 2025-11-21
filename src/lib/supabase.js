// Configuration avancée Supabase avec authentification Magic Link
import { createClient } from '@supabase/supabase-js'

// Variables d'environnement (à configurer dans .env.local)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Vérification des variables d'environnement
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Variables Supabase manquantes - mode fallback activé')
  console.warn('Configurez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans .env.local')
}

// Client Supabase avec configuration auth
export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'magic-link'
  }
}) : null

// Helper pour vérifier si Supabase est configuré
export const isSupabaseConfigured = () => {
  return supabase !== null
}

// Helper pour obtenir l'URL de redirection selon l'environnement
export const getRedirectUrl = (path = '/auth/callback') => {
  // Toujours utiliser l'origine actuelle (fonctionne sur Replit et en production)
  const baseUrl = window.location.origin
  
  return `${baseUrl}${path}`
}

// Auth helpers
export const authHelpers = {
  // Connexion par Magic Link
  async signInWithMagicLink(email) {
    if (!supabase) {
      throw new Error('Supabase non configuré')
    }
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: getRedirectUrl('/auth/callback')
      }
    })
    
    if (error) throw error
    return { success: true }
  },

  // Déconnexion
  async signOut() {
    if (!supabase) {
      throw new Error('Supabase non configuré')
    }
    
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { success: true }
  },

  // Obtenir la session actuelle
  async getSession() {
    if (!supabase) return { session: null }
    
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return { session }
  },

  // Obtenir l'utilisateur actuel
  async getUser() {
    if (!supabase) return { user: null }
    
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return { user }
  },

  // Obtenir le profil de l'utilisateur avec rôle
  async getUserProfile(userId) {
    if (!supabase || !userId) return { profile: null }
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('user_id, full_name, role')
      .eq('user_id', userId)
      .single()
    
    if (error) {
      console.warn('Profil non trouvé:', error.message)
      return { profile: null }
    }
    
    return { profile }
  },

  // Vérifier si l'utilisateur est admin
  async isAdmin(userId) {
    if (!userId) return false
    
    const { profile } = await this.getUserProfile(userId)
    return profile?.role === 'admin'
  },

  // Écouter les changements d'authentification
  onAuthStateChange(callback) {
    if (!supabase) {
      // Mode fallback - pas de vrai listener
      return { data: { subscription: null } }
    }
    
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Test de connexion (optionnel - pour debug)
export const testConnection = async () => {
  if (!supabase) {
    console.log('Supabase non configuré - mode fallback actif')
    return false
  }
  
  try {
    const { error } = await supabase.from('menus').select('count').limit(1)
    if (error) {
      console.log('Supabase connecté mais tables pas encore créées:', error.message)
      return false
    } else {
      console.log('✅ Supabase connecté avec succès')
      return true
    }
  } catch (error) {
    console.log('❌ Erreur de connexion Supabase:', error.message)
    return false
  }
}

export default supabase
import { createClient } from '@supabase/supabase-js'

// Configuration Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Vérification des variables d'environnement
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Variables d\'environnement Supabase manquantes. Vérifiez votre fichier .env.local')
}

// Création du client Supabase
export const supabase = createClient(supabaseUrl, supabaseKey)

// Test de connexion (optionnel - pour debug)
export const testConnection = async () => {
  try {
    const { error } = await supabase.from('menus').select('count').single()
    if (error) {
      console.log('Supabase connecté mais tables pas encore créées:', error.message)
    } else {
      console.log('✅ Supabase connecté avec succès')
    }
  } catch (err) {
    console.error('❌ Erreur de connexion Supabase:', err.message)
  }
}
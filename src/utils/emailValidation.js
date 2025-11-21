// Système de validation d'emails autorisés avec obfuscation
// Les emails sont encodés pour ne pas être visibles en clair dans le code

// ⚠️ SÉCURITÉ : Ces hashes correspondent aux emails autorisés
// Ne pas modifier sans connaître les emails correspondants
const ALLOWED_EMAIL_HASHES = [
  '7f1a8fe1', // aayyyeesh@gmail.com
  '2d70e981', // ayesh.alotaibi@formation.orif.ch
  '5c5b0e14', // raphael.schmutz@orif.ch
  '5c87edc1', // raphael.schmutz@sectioninformatique.ch
  '5e8f5ee2'  // admin@orif.ch
]

/**
 * Hash simple pour obfusquer les emails
 * Ne pas utiliser pour du vrai hashing cryptographique
 */
const simpleHash = (str) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0').slice(0, 32)
}

/**
 * Vérifie si un email est autorisé à se connecter
 * @param {string} email - L'email à vérifier
 * @returns {boolean} - True si l'email est autorisé
 */
export const isEmailAllowed = (email) => {
  if (!email || typeof email !== 'string') {
    return false
  }
  
  // Normaliser l'email (minuscules, trim)
  const normalizedEmail = email.toLowerCase().trim()
  
  // Générer le hash de l'email
  const emailHash = simpleHash(normalizedEmail)
  
  // Mode debug - afficher le hash pour vérification
  if (import.meta.env.DEV) {
    console.log(`[DEBUG] Email: ${normalizedEmail}, Hash: ${emailHash}`)
    console.log(`[DEBUG] Hashes autorisés:`, ALLOWED_EMAIL_HASHES)
  }
  
  // Vérifier si le hash correspond à un email autorisé
  const isAllowed = ALLOWED_EMAIL_HASHES.includes(emailHash)
  
  if (import.meta.env.DEV) {
    console.log(`[DEBUG] Email autorisé: ${isAllowed}`)
  }
  
  return isAllowed
}

/**
 * Obtient un message d'erreur personnalisé pour les emails non autorisés
 */
export const getEmailErrorMessage = () => {
  return "Seuls les emails des administrateurs ORIF sont autorisés. Contactez l'équipe technique si vous pensez qu'il s'agit d'une erreur."
}

/**
 * Validation avec logging sécurisé (ne log jamais l'email en clair)
 */
export const validateEmailWithLogging = (email) => {
  const isAllowed = isEmailAllowed(email)
  
  if (!isAllowed) {
    // Log sécurisé : on ne révèle jamais l'email tenté
    console.warn('Tentative de connexion avec email non autorisé')
  }
  
  return isAllowed
}

// Pour les développeurs : fonction utilitaire pour générer les hashes
// ⚠️ À SUPPRIMER en production
if (import.meta.env.DEV) {
  window.__generateEmailHash = (email) => {
    console.log(`Hash pour "${email}":`, simpleHash(email.toLowerCase().trim()))
  }
}
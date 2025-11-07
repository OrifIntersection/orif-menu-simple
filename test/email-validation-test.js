// Script de test pour vérifier les hashes d'emails
// À exécuter en mode développement uniquement

const emails = [
  'aayyyeesh@gmail.com',
  'ayesh.alotaibi@formation.orif.ch', 
  'raphael.schmutz@orif.ch',
  'raphael.schmutz@sectioninformatique.ch',
  'admin@orif.ch'
]

const simpleHash = (str) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0').slice(0, 8)
}

console.log('=== HASHES POUR LES EMAILS AUTORISÉS ===')
emails.forEach(email => {
  const normalizedEmail = email.toLowerCase().trim()
  const hash = simpleHash(normalizedEmail)
  console.log(`${email} → ${hash}`)
})

console.log('\n=== ARRAY POUR LE CODE ===')
const hashes = emails.map(email => `'${simpleHash(email.toLowerCase().trim())}'`)
console.log(`[${hashes.join(', ')}]`)

// Test de validation
import { isEmailAllowed } from '../src/utils/emailValidation.js'

console.log('\n=== TESTS DE VALIDATION ===')
emails.forEach(email => {
  const isAllowed = isEmailAllowed(email)
  console.log(`${email}: ${isAllowed ? '✅ AUTORISÉ' : '❌ REFUSÉ'}`)
})

// Test avec email non autorisé
const testUnauthorized = 'hacker@malicious.com'
console.log(`${testUnauthorized}: ${isEmailAllowed(testUnauthorized) ? '✅ AUTORISÉ' : '❌ REFUSÉ'}`)

export { emails, simpleHash }
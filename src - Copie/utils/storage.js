/**
 * Utilitaires pour gérer la sauvegarde et le chargement du menu
 * Utilise localStorage du navigateur pour la persistance des données
 */

// Clé utilisée pour sauvegarder le menu dans localStorage
const KEY = "orif_menu_week";

/**
 * Charge le menu depuis localStorage
 * @param {Object} fallback - Menu par défaut à retourner si aucun menu n'est sauvegardé
 * @returns {Object} Le menu sauvegardé ou le menu par défaut
 */
export function loadMenu(fallback) {
  try {
    // Récupère la chaîne JSON du localStorage
    const raw = localStorage.getItem(KEY);
    // Si un menu existe, le parse en objet JavaScript, sinon retourne fallback
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    // En cas d'erreur (JSON invalide, localStorage indisponible, etc.)
    // Retourne le menu par défaut
    return fallback;
  }
}

/**
 * Sauvegarde le menu dans localStorage
 * @param {Object} menuObj - L'objet menu à sauvegarder
 */
export function saveMenu(menuObj) {
  // Convertit l'objet en chaîne JSON et le sauvegarde dans localStorage
  localStorage.setItem(KEY, JSON.stringify(menuObj));
}

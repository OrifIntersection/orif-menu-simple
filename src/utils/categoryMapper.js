/**
 * Utilitaire pour grouper les plats importés par jour et moment
 */

/**
 * Groupe les plats par jour et moment
 * @param {Array} menus - Tableau de plats importés {semaine, jour, moment, plat}
 * @returns {Object} - Structure groupée par jour puis moment
 */
export function groupMenusByDayAndMoment(menus) {
  const grouped = {};
  menus.forEach(menu => {
    const day = menu.jour;
    const moment = menu.moment;
    if (!grouped[day]) {
      grouped[day] = {};
    }
    if (!grouped[day][moment]) {
      grouped[day][moment] = [];
    }
    grouped[day][moment].push(menu);
  });
  return grouped;
}

/**
 * Convertit les IDs de catégories vers les codes
 * @param {number} categoryId - ID de la catégorie
 * @returns {string} - Code de la catégorie
 */
export function getCategoryCodeById(categoryId) {
  const mapping = {
    1: 'SALADE',
    2: 'VIANDE',
    3: 'FECULENT',
    4: 'LEGUMES',
    5: 'DESSERT'
  };
  return mapping[categoryId] || null;
}

/**
 * Convertit les codes de catégories vers les IDs
 * @param {string} categoryCode - Code de la catégorie
 * @returns {number} - ID de la catégorie
 */
export function getCategoryIdByCode(categoryCode) {
  const mapping = {
    'SALADE': 1,
    'VIANDE': 2,
    'FECULENT': 3,
    'LEGUMES': 4,
    'DESSERT': 5
  };
  return mapping[categoryCode] || null;
}

/**
 * Statistiques sur la détection des catégories
 * @param {Array} menus - Tableau de plats avec catégories
 * @returns {Object} - {total, detected, undetected, byCategory}
 */
export function getCategoryStats(menus) {
  const stats = {
    total: menus.length,
    detected: 0,
    undetected: 0,
    byCategory: {
      SALADE: 0,
      VIANDE: 0,
      FECULENT: 0,
      LEGUMES: 0,
      DESSERT: 0
    }
  };
  
  menus.forEach(menu => {
    if (menu.categoryDetected) {
      stats.detected++;
      if (menu.category) {
        stats.byCategory[menu.category]++;
      }
    } else {
      stats.undetected++;
    }
  });
  
  return stats;
}

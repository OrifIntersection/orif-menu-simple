/**
 * Utilitaires pour gérer les dates et les numéros de semaine
 * Basé sur la norme ISO 8601 pour les numéros de semaine
 * 
 */

/**
 * Obtient le numéro de semaine ISO d'une date
 * @param {Date} date - La date pour laquelle obtenir le numéro de semaine
 * @returns {number} Le numéro de semaine (1-53)
 */
export function getWeekNumber(date) {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7; // Lundi = 0, Dimanche = 6
  target.setDate(target.getDate() - dayNr + 3); // Jeudi de cette semaine
  const firstThursday = target.valueOf();
  target.setMonth(0, 1); // 1er janvier
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7); // Premier jeudi de l'année
  }
  return 1 + Math.ceil((firstThursday - target) / 604800000); // 604800000 = 7 * 24 * 3600 * 1000
}

/**
 * Obtient la date du lundi d'une semaine donnée
 * @param {number} year - L'année
 * @param {number} weekNumber - Le numéro de semaine (1-53)
 * @returns {Date} La date du lundi de cette semaine
 */
export function getMondayOfWeek(year, weekNumber) {
  const jan4 = new Date(year, 0, 4); // 4 janvier (toujours dans la première semaine)
  const jan4Day = (jan4.getDay() + 6) % 7; // Lundi = 0
  const mondayJan4 = new Date(jan4);
  mondayJan4.setDate(jan4.getDate() - jan4Day);
  
  const targetMonday = new Date(mondayJan4);
  targetMonday.setDate(mondayJan4.getDate() + (weekNumber - 1) * 7);
  
  return targetMonday;
}

/**
 * Formate une date au format YYYY-MM-DD
 * @param {Date} date - La date à formater
 * @returns {string} La date formatée
 */
export function formatDate(date) {
  return date.toISOString().split('T')[0];
}

/**
 * Formate une date pour l'affichage (ex: "6 novembre 2025")
 * @param {Date} date - La date à formater
 * @returns {string} La date formatée pour l'affichage
 */
export function formatDateForDisplay(date) {
  const monthNames = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
  ];
  
  const day = date.getDate();
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day} ${month} ${year}`;
}

/**
 * Parse une date au format YYYY-MM-DD
 * @param {string} dateString - La chaîne de date à parser
 * @returns {Date} L'objet Date
 */
export function parseDate(dateString) {
  // Créer une date avec les composants pour éviter les problèmes de timezone
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date;
}

/**
 * Obtient le numéro de semaine actuel
 * @returns {number} Le numéro de semaine actuel
 */
export function getCurrentWeekNumber() {
  return getWeekNumber(new Date());
}

/**
 * Obtient l'année actuelle
 * @returns {number} L'année actuelle
 */
export function getCurrentYear() {
  return new Date().getFullYear();
}

/**
 * Obtient l'année ISO d'une date (peut différer de l'année calendaire)
 * Par exemple, le 1er janvier 2026 peut appartenir à la semaine 1 de 2026 ou semaine 53 de 2025
 * @param {Date} date - La date
 * @returns {number} L'année ISO
 */
export function getISOWeekYear(date) {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  return target.getFullYear();
}

/**
 * Obtient l'année ISO pour une semaine donnée basée sur la date actuelle
 * Gère le cas où la semaine appartient à l'année précédente ou suivante
 * @param {number} weekNumber - Le numéro de semaine (1-53)
 * @returns {number} L'année ISO correspondante
 */
export function getYearForWeek(weekNumber) {
  const now = new Date();
  const currentWeek = getWeekNumber(now);
  const currentISOYear = getISOWeekYear(now);
  
  if (weekNumber > 50 && currentWeek < 10) {
    return currentISOYear - 1;
  }
  if (weekNumber < 10 && currentWeek > 50) {
    return currentISOYear + 1;
  }
  return currentISOYear;
}

/**
 * Génère le label de semaine (ex: "4 au 10 septembre 2025")
 * @param {number} year - L'année
 * @param {number} weekNumber - Le numéro de semaine
 * @returns {string} Le label de la semaine
 */
export function getWeekLabel(year, weekNumber) {
  const monday = getMondayOfWeek(year, weekNumber);
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  
  const monthNames = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
  ];
  
  const mondayDay = monday.getDate();
  const fridayDay = friday.getDate();
  const mondayMonth = monthNames[monday.getMonth()];
  const fridayMonth = monthNames[friday.getMonth()];
  
  if (monday.getMonth() === friday.getMonth()) {
    return `${mondayDay} au ${fridayDay} ${mondayMonth} ${year}`;
  } else {
    return `${mondayDay} ${mondayMonth} au ${fridayDay} ${fridayMonth} ${year}`;
  }
}

/**
 * Obtient le nom du jour en français
 * @param {Date} date - La date
 * @returns {string} Le nom du jour
 */
export function getDayName(date) {
  const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  return dayNames[date.getDay()];
}

/**
 * Vérifie si une date est un jour de semaine (lundi à vendredi)
 * @param {Date} date - La date à vérifier
 * @returns {boolean} True si c'est un jour de semaine
 */
export function isWeekday(date) {
  const day = date.getDay();
  return day >= 1 && day <= 5; // Lundi (1) à vendredi (5)
}

/**
 * Obtient toutes les dates d'une semaine donnée (du lundi au dimanche)
 * @param {number} year - L'année
 * @param {number} weekNumber - Le numéro de semaine (1-53)
 * @returns {Date[]} Array des 7 dates de la semaine
 */
export function getWeekDates(year, weekNumber) {
  const monday = getMondayOfWeek(year, weekNumber);
  const dates = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    dates.push(date);
  }
  
  return dates;
}
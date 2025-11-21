/**
 * Menu par défaut de la cafétéria ORIF
 * Structure de données utilisée pour initialiser l'application
 */

// Objet menu avec structure de base
const defaultMenu = {
  // Label de la semaine à afficher
  weekLabel: "4 au 10 septembre 2025",
  
  // Liste des jours de la semaine (du lundi au vendredi)
  days: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"],
  
  // Liste des repas disponibles
  meals: ["Midi", "Soir"],
  
  // Types de plats dans chaque repas (lignes du tableau)
  items: ["Salade", "Viande", "Féculent", "Légumes", "Dessert"],
  
  // Structure de données pour stocker le menu
  // Format: { repas: { jour: { type_plat: contenu } } }
  data: { Midi: {}, Soir: {} }
};

// Remplissage automatique du menu avec des valeurs par défaut
// Boucle sur chaque repas (Midi, Soir)
for (const meal of defaultMenu.meals) {
  // Boucle sur chaque jour (Lundi à Vendredi)
  for (const day of defaultMenu.days) {
    // Crée un objet pour ce repas et ce jour
    // avec des valeurs par défaut pour chaque type de plat
    defaultMenu.data[meal][day] = {
      Salade: "Salade",       // Entrée
      Viande: "Viande",       // Plat principal (protéine)
      Féculent: "Féculent",   // Accompagnement féculent (pâtes, riz, etc.)
      Légumes: "Légumes",     // Accompagnement légumes
      Dessert: "Dessert"      // Dessert
    };
  }
}

// Exporte le menu par défaut pour utilisation dans toute l'application
export default defaultMenu;

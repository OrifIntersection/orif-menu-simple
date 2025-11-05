// Composant qui génère une ligne de repas complète dans le tableau
// Import du composant pour afficher une cellule individuelle du menu
import MenuCell from "./MenuCell";

/**
 * SiderTable - Ligne de repas (Midi ou Soir) avec toutes les cellules des jours
 * 
 * @param {String} meal - Nom du repas ("Midi" ou "Soir")
 * @param {Array} days - Liste des jours de la semaine
 * @param {Object} data - Données complètes du menu organisées par repas/jour
 * @param {Array} items - Types d'aliments (Entrée, Plat, Accompagnement, Dessert)
 */
export default function SiderTable({ meal, days, data, items }) {
  return (
    // Ligne de tableau (tr) représentant un repas complet
    <tr>
      {/* Cellule de gauche avec le label du repas en vertical */}
      <th className="meal-label">{meal}</th>
      
      {/* Boucle sur chaque jour pour créer une cellule de menu */}
      {days.map((day) => {
        // Récupère les données du menu pour ce repas et ce jour
        // Si les données n'existent pas, utilise un objet vide {}
        const cell = (data[meal] && data[meal][day]) || {};
        
        // Crée un tableau avec les lignes de la cellule (Entrée, Plat, etc.)
        // Si une valeur n'existe pas, utilise une chaîne vide ""
        const lines = items.map((it) => cell[it] || "");
        
        // Retourne une cellule de menu avec toutes les lignes
        return <MenuCell key={day} lines={lines} />;
      })}
      
      {/* Cellule de droite avec le label du repas en vertical (miroir de gauche) */}
      <th className="meal-label meal-label-right">{meal}</th>
    </tr>
  );
}

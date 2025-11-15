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
    <tr>
      <th className="meal-label">{meal}</th>
      {days.map((day, idx) => {
        // Classe unique par cellule : cell-jour-<day>-repas-<meal>
        const cellClass = `cell-jour-${day.toLowerCase()} cell-repas-${meal.toLowerCase()} cell-idx-${idx}`;
        if (!items || items.length === 0) {
          const value = (data[meal] && data[meal][day]) || "";
          const lines = Array.isArray(value) ? value : [value];
          return <MenuCell key={day} lines={lines} className={cellClass} />;
        }
        const cell = (data[meal] && data[meal][day]) || {};
        const lines = items.map((it) => cell[it] || "");
        return <MenuCell key={day} lines={lines} className={cellClass} />;
      })}
      <th className="meal-label meal-label-right">{meal}</th>
    </tr>
  );
}

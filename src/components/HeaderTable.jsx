// Composant qui affiche l'en-tête du tableau avec les jours de la semaine

/**
 * HeaderTable - Ligne d'en-tête du tableau affichant les noms des jours
 * 
 * @param {Array} days - Liste des jours à afficher (ex: ["Lundi", "Mardi", ...])
 */
export default function HeaderTable({ days }) {
  return (
    // Ligne d'en-tête (tr) du tableau
    <tr>
      {/* Cellule d'angle vide (coin gauche) - alignée avec les labels de repas */}
      <th className="corner-cell"></th>
      
      {/* Boucle sur chaque jour pour créer une cellule d'en-tête */}
      {days.map((d) => (
        <th key={d}>{d}</th> // Affiche le nom du jour (Lundi, Mardi, etc.)
      ))}
      
      {/* Cellule d'angle vide (coin droit) - alignée avec les labels de repas */}
      <th className="corner-cell"></th>
    </tr>
  );
}

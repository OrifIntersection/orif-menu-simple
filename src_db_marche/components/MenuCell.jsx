/**
 * MenuCell - Cellule individuelle du tableau contenant les plats d'un repas pour un jour
 * 
 * @param {Array} lines - Tableau de chaînes contenant les lignes à afficher
 *                        (ex: ["Salade", "Pâtes bolognaise", "Carottes", "Yaourt"])
 *                        Valeur par défaut : tableau vide []
 */
export default function MenuCell({ lines = [] }) {
  return (
    // Cellule de tableau (td) contenant plusieurs lignes de texte
    <td>
      {/* Boucle sur chaque ligne pour créer un div */}
      {lines.map((line, i) => (
        // Chaque ligne est affichée dans un div séparé
        // La clé utilise l'index car l'ordre est important et les lignes peuvent être identiques
        <div key={i}>{line}</div>
      ))}
    </td>
  );
}
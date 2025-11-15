/**
 * MenuCell - Cellule individuelle du tableau contenant les plats d'un repas pour un jour
 * 
 * @param {Array} lines - Tableau de chaînes contenant les lignes à afficher
 *                        (ex: ["Salade", "Pâtes bolognaise", "Carottes", "Yaourt"])
 *                        Valeur par défaut : tableau vide []
 */
export default function MenuCell({ lines = [], className = "" }) {
  return (
    <td className={className}>
      {lines.map((line, i) => (
        <div key={i}>{line}</div>
      ))}
    </td>
  );
}
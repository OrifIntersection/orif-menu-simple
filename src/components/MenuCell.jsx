import DishListWeek from "./DishListWeek";

/**
 * MenuCell - Cellule individuelle du tableau contenant les plats d'un repas pour un jour
 * 
 * @param {Array} lines - Tableau de chaînes contenant les lignes à afficher
 *                        (ex: ["Salade", "Pâtes bolognaise", "Carottes", "Yaourt"])
 *                        Valeur par défaut : tableau vide []
 */
export default function MenuCell({ lines = [], className = "" }) {
  const hasTypedDishes = (line) => {
    return typeof line === 'string' && /^[A-Z]+:\s*.+/.test(line);
  };

  return (
    <td className={className}>
      {lines.map((line, i) => (
        <div key={i}>
          {hasTypedDishes(line) ? (
            <DishListWeek dishString={line} />
          ) : (
            line
          )}
        </div>
      ))}
    </td>
  );
}
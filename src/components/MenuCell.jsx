import DishListWeek from "./DishListWeek";

/**
 * MenuCell - Cellule individuelle du tableau contenant les plats d'un repas pour un jour
 * 
 * @param {Array|String} lines - Tableau de chaînes ou chaîne unique contenant les plats
 *                        (ex: ["Salade", "Pâtes"] ou "ENTREE: Salade / PLAT: Pâtes")
 * @param {String} menu - Alternative: chaîne de plats (pour compatibilité)
 */
export default function MenuCell({ lines = [], menu, className = "" }) {
  const hasTypedDishes = (line) => {
    return typeof line === 'string' && /^[A-Z]+:\s*.+/.test(line);
  };

  if (menu && typeof menu === 'string') {
    return (
      <td className={className}>
        <DishListWeek dishString={menu} />
      </td>
    );
  }

  const linesArray = Array.isArray(lines) ? lines : [lines];

  return (
    <td className={className}>
      {linesArray.map((line, i) => (
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
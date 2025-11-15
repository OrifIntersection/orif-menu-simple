// Composant principal qui affiche le tableau complet du menu
// Import des sous-composants pour l'en-tête et les lignes de repas
import HeaderTable from "./HeaderTable";
import SiderTable from "./SiderTable";

/**
 * MenuTable - Affiche le tableau hebdomadaire du menu de la cafétéria
 * 
 * @param {Object} menu - Objet contenant toutes les données du menu
 * @param {Boolean} showToggle - Afficher ou non le bouton de bascule
 * @param {Function} onToggle - Fonction appelée au clic sur le bouton
 * @param {String} toggleLabel - Texte à afficher sur le bouton
 */
export default function MenuTable({ menu, showToggle, onToggle, toggleLabel }) {
  // Déstructuration des données du menu pour un accès plus facile
  const { weekLabel, days, meals, items, data } = menu;
  const safeItems = Array.isArray(items) ? items : ["Plat"];

  return (
    <>
      {/* En-tête avec titre et bouton optionnel */}
      <div className="table-header">
        {/* Titre indiquant la semaine affichée avec numéro */}
        {menu.weekNumber && (
          <h3 className="table-caption">
            {`Menu la semaine N° ${menu.weekNumber} du ${menu.weekLabel}`}
          </h3>
        )}
        {/* Bouton conditionnel pour basculer entre vue jour/semaine */}
        {showToggle && (
          <button className="table-toggle-btn" onClick={onToggle}>
            {toggleLabel}
          </button>
        )}
      </div>
      {/* Conteneur du tableau avec scroll horizontal si nécessaire */}
      <div className="table-wrap">
        <table>
          {/* En-tête du tableau avec les jours de la semaine */}
          <thead>
            <HeaderTable days={days} />
          </thead>
          {/* Corps du tableau avec les lignes de repas */}
          <tbody>
            {/* Boucle sur chaque repas (Midi, Soir) */}
            {meals.map((meal) => (
              <SiderTable
                key={meal}
                meal={meal}
                days={days}
                items={safeItems}
                data={data}
              />
            ))}
          </tbody>
          {/* Pied du tableau (répète l'en-tête pour faciliter la lecture) */}
          <tfoot>
            <HeaderTable days={days} />
          </tfoot>
        </table>
      </div>
    </>
  );
}
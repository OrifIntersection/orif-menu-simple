// Page qui affiche uniquement le menu du jour en cours
// Import des données par défaut du menu
import defaultMenu from "../data/defaultMenu";
// Import des composants de tableau
import HeaderTable from "../components/HeaderTable";
import SiderTable from "../components/SiderTable";

/**
 * DailyMenu - Affiche le menu uniquement pour le jour actuel
 */
export default function DailyMenu() {
  // Obtenir le jour actuel de la semaine
  const today = new Date().getDay(); // Retourne 0-6 (0=dimanche, 1=lundi, ..., 6=samedi)
  
  // Convertir le jour actuel en index pour le tableau days
  // Si c'est un jour de semaine (1-5), soustrait 1 pour avoir l'index 0-4
  // Si c'est le weekend (0 ou 6), utilise 0 (lundi) par défaut
  const jourIndex = today >= 1 && today <= 5 ? today - 1 : 0;
  
  // Récupère le nom du jour actuel depuis le tableau des jours
  const jourActuel = defaultMenu.days[jourIndex];

  // Crée un nouveau objet menu contenant uniquement le jour actuel
  // L'opérateur spread (...) copie toutes les propriétés de defaultMenu
  // puis on écrase la propriété days avec un tableau d'un seul jour
  const menuDuJour = {
    ...defaultMenu,
    days: [jourActuel] // Tableau avec un seul jour au lieu de 5
  };
  return (
    <main className="container">
      <PageLayout title="Cafétéria ORIF">
        <div className="daily-menu-view">
          <div className="table-header">
            <h3 className="table-caption">Menu du {jourActuel}</h3>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <HeaderTable days={menuDuJour.days} />
              </thead>
              <tbody>
                {menuDuJour.meals.map((meal) => (
                  <SiderTable
                    key={meal}
                    meal={meal}
                    days={menuDuJour.days}
                    items={menuDuJour.items}
                    data={menuDuJour.data}
                  />
                ))}
              </tbody>
              <tfoot>
                <HeaderTable days={menuDuJour.days} />
              </tfoot>
            </table>
          </div>
          <div className="menu-info" style={{marginTop: '1.5rem', fontSize: '1rem', color: '#444'}}>
            <strong>Régimes acceptés avec certificat médical :</strong> sans lactose, et sans gluten.<br />
            Si vous avez des doutes concernant les ingrédients qui peuvent provoquer des allergies ou d’autres réactions indésirables, veuillez vous adresser au Chef de cuisine
          </div>
        </div>
      </PageLayout>
    </main>
  );
}
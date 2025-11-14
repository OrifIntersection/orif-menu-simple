// Page qui affiche uniquement le menu du jour en cours
import React from "react";
// Import des composants de tableau
import HeaderTable from "../components/HeaderTable";
import SiderTable from "../components/SiderTable";

/**
 * DailyMenu - Affiche le menu uniquement pour le jour actuel
 */
export default function DailyMenu() {
  const [menuDuJour, setMenuDuJour] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    async function fetchMenu() {
      setLoading(true);
      const today = new Date().getDay();
      const jourIndex = today >= 1 && today <= 5 ? today - 1 : 0;
      const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
      const jourActuel = jours[jourIndex];
      try {
        const { data, error } = await import('../services/MenuService').then(mod => mod.MenuService.getMenuForDate(new Date()));
        if (error || !data) {
          setMenuDuJour({ days: [jourActuel], meals: [], items: [], data: {} });
        } else {
          setMenuDuJour({ days: [jourActuel], meals: Object.keys(data), items: [], data });
        }
      } catch {
        setMenuDuJour({ days: [jourActuel], meals: [], items: [], data: {} });
      }
      setLoading(false);
    }
    fetchMenu();
  }, []);
  const jourActuel = menuDuJour?.days?.[0] || '';
  return (
    <main className="container">
      <PageLayout title="Cafétéria ORIF">
        <div className="daily-menu-view">
          <div className="table-header">
            <h3 className="table-caption">Menu du {jourActuel}</h3>
          </div>
          {loading ? (
            <div>Chargement du menu...</div>
          ) : menuDuJour && menuDuJour.meals.length > 0 ? (
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
          ) : (
            <div style={{textAlign: 'center', color: '#d32f2f', fontWeight: 'bold', margin: '2rem 0'}}>
              Aucun menu disponible pour aujourd'hui.
            </div>
          )}
          <div className="menu-info" style={{marginTop: '1.5rem', fontSize: '1rem', color: '#444'}}>
            <strong>Régimes acceptés avec certificat médical :</strong> sans lactose, et sans gluten.<br />
            Si vous avez des doutes concernant les ingrédients qui peuvent provoquer des allergies ou d’autres réactions indésirables, veuillez vous adresser au Chef de cuisine
          </div>
        </div>
      </PageLayout>
    </main>
  );
}
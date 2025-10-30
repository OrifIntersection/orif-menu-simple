// Niveau 1 : Menu du jour avec les mêmes composants
import defaultMenu from "../data/defaultMenu";
import HeaderTable from "../components/HeaderTable";
import SiderTable from "../components/SiderTable";

export default function DailyMenu() {
  // Obtenir le jour actuel (lundi à vendredi)
  const today = new Date().getDay(); // 0=dimanche, 1=lundi, ..., 5=vendredi
  const jourIndex = today >= 1 && today <= 5 ? today - 1 : 0; // Si weekend, afficher lundi
  const jourActuel = defaultMenu.days[jourIndex];

  // Menu filtré avec uniquement le jour actuel
  const menuDuJour = {
    ...defaultMenu,
    days: [jourActuel]
  };

  return (
    <>
      <h3 className="table-caption">Menu du {jourActuel}</h3>
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
    </>
  );
}

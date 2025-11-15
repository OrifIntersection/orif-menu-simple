// Page qui affiche uniquement le menu du jour en cours
// ...existing code...
import React from "react";
import PageLayout from "../components/PageLayout";
import HeaderTable from "../components/HeaderTable";
import SiderTable from "../components/SiderTable";
import { supabase } from "../lib/supabase";
import { LocalMenuService } from "../services/LocalMenuService";
import { format } from "date-fns";

export default function DailyMenu(props) {
  const [menuItems, setMenuItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const date = props.date || format(new Date(), "yyyy-MM-dd");
  const jours = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  const jourObj = new Date(date);
  const jourActuel = jours[jourObj.getDay()];

  React.useEffect(() => {
    async function fetchMenu() {
      setLoading(true);
      let items = [];
      if (supabase) {
        const { data, error } = await supabase
          .from("meal_items")
          .select(`*, meal_types (id, code, label), dishes (id, name, description)`)
          .eq("date", date);
        if (!error && data && data.length > 0) {
          items = data;
        }
      }
      // Fallback localStorage si rien dans Supabase
      if (items.length === 0) {
        // Trouve la semaine correspondant à la date
        const allMenus = LocalMenuService.getAllMenus();
        const menuSemaine = allMenus.find(menu => menu.days && menu.days.includes(date));
        if (menuSemaine && Array.isArray(menuSemaine.items)) {
          items = menuSemaine.items.filter(item => item.date === date);
        }
      }
      setMenuItems(items);
      setLoading(false);
    }
    fetchMenu();
  }, [date]);

  // Regrouper par type de repas (midi/soir)
  const mealsGrouped = React.useMemo(() => {
    const grouped = {};
    menuItems.forEach(item => {
      const type = item.meal_types?.label || item.meal_type_id;
      if (!grouped[type]) grouped[type] = [];
      grouped[type].push(item);
    });
    return grouped;
  }, [menuItems]);

  return (
    <main className="container">
      <PageLayout title={`Cafétéria ORIF`}>
        <div className="daily-menu-view">
          <div className="table-header">
            <h3 className="table-caption">Menu du {jourActuel} ({date})</h3>
          </div>
          {loading ? (
            <div>Chargement du menu...</div>
          ) : Object.keys(mealsGrouped).length > 0 ? (
            Object.entries(mealsGrouped).map(([type, items]) => (
              <div key={type} style={{ marginBottom: "2rem" }}>
                <h4>{type}</h4>
                <table>
                  <thead>
                    <HeaderTable days={[jourActuel]} />
                  </thead>
                  <tbody>
                    <SiderTable meal={type} days={[jourActuel]} items={items} data={{}} />
                  </tbody>
                </table>
              </div>
            ))
          ) : (
            <div style={{ color: '#d32f2f', fontWeight: 'bold', margin: '2rem 0', textAlign: 'center' }}>
              Aucun menu disponible pour ce jour.<br />
              <span style={{ fontWeight: 'normal', color: '#333', fontSize: '1rem' }}>
                Vous pouvez importer un menu pour cette date via la page d'importation.<br />
                <a href="/import-local" style={{ color: '#007bff', textDecoration: 'underline' }}>Importer un menu</a>
              </span>
            </div>
          )}
        </div>
      </PageLayout>
    </main>
  );
}
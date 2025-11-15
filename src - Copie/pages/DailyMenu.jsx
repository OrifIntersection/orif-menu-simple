// Page qui affiche uniquement le menu du jour en cours
// ...existing code...
import React from "react";
import PageLayout from "../components/PageLayout";
import HeaderTable from "../components/HeaderTable";
import SiderTable from "../components/SiderTable";
import { supabase } from "../lib/supabase";
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
      const { data, error } = await supabase
        .from("meal_items")
        .select(`*, meal_types (id, code, label), dishes (id, name, description)`) // adapter si besoin
        .eq("date", date);
      if (error) {
        setMenuItems([]);
      } else {
        setMenuItems(data || []);
      }
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
            <div style={{ color: '#d32f2f', fontWeight: 'bold', margin: '2rem 0' }}>
              Aucun menu disponible pour ce jour.
            </div>
          )}
        </div>
      </PageLayout>
    </main>
  );
}
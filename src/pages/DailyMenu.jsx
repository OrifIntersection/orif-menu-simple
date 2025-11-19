import React from "react";
import PageLayout from "../components/PageLayout";
import MenuCell from "../components/MenuCell";
import ColorLegend from "../components/ColorLegend";
import { supabase } from "../lib/supabase";
import { LocalMenuService } from "../services/LocalMenuService";
import { format, getISOWeek, getYear } from "date-fns";

export default function DailyMenu(props) {
  const [menuData, setMenuData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const date = props.date || format(new Date(), "yyyy-MM-dd");
  const jours = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  const jourObj = new Date(date + 'T12:00:00');
  const jourActuel = jours[jourObj.getDay()];

  React.useEffect(() => {
    async function fetchMenu() {
      setLoading(true);
      let items = [];
      if (supabase) {
        const { data, error } = await supabase
          .from("meal_items")
          .select(`*, meal_types (id, code, label), dishes (id, name, description, dish_type)`)
          .eq("date", date);
        if (!error && data && data.length > 0) {
          items = data;
        }
      }
      
      // Fallback localStorage si rien dans Supabase
      if (items.length === 0) {
        const allMenus = LocalMenuService.getAllMenus();
        const dateObj = new Date(date + 'T12:00:00');
        const weekNum = getISOWeek(dateObj);
        const year = getYear(dateObj);
        
        const menuSemaine = allMenus.find(menu => 
          Number(menu.year) === year && Number(menu.week_number) === weekNum
        );
        
        if (menuSemaine && menuSemaine.data) {
          setMenuData(menuSemaine);
        } else {
          setMenuData(null);
        }
      } else {
        setMenuData({ items });
      }
      setLoading(false);
    }
    fetchMenu();
  }, [date, jourActuel]);

  const hasMenu = menuData && menuData.data && Object.keys(menuData.data).length > 0;
  const meals = menuData?.meals || ['Midi', 'Soir'];

  return (
    <main className="container">
      <PageLayout title={`Cafétéria ORIF`}>
        <div className="table-header">
          <h3 className="table-caption">Menu du {jourActuel} ({date})</h3>
        </div>
        {loading ? (
          <div>Chargement du menu...</div>
        ) : hasMenu ? (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th className="corner-cell"></th>
                    <th>{jourActuel}</th>
                    <th className="corner-cell"></th>
                  </tr>
                </thead>
                <tbody>
                  {meals.map((meal) => {
                    const cellClass = `cell-jour-${jourActuel.toLowerCase()} cell-repas-${meal.toLowerCase()}`;
                    const value = (menuData.data[meal] && menuData.data[meal][jourActuel]) || "";
                    const lines = Array.isArray(value) ? value : [value];
                    
                    return (
                      <tr key={meal}>
                        <th className="meal-label">{meal}</th>
                        <MenuCell lines={lines} className={cellClass} />
                        <th className="meal-label meal-label-right">{meal}</th>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <th className="corner-cell"></th>
                    <th>{jourActuel}</th>
                    <th className="corner-cell"></th>
                  </tr>
                </tfoot>
              </table>
            </div>
            <ColorLegend />
          </>
        ) : (
          <div style={{ color: '#d32f2f', fontWeight: 'bold', margin: '2rem 0', textAlign: 'center' }}>
            Aucun menu disponible pour ce jour.<br />
            <span style={{ fontWeight: 'normal', color: '#333', fontSize: '1rem' }}>
              Vous pouvez importer un menu pour cette date via la page d'importation.<br />
              <a href="/import-local" style={{ color: '#007bff', textDecoration: 'underline' }}>Importer un menu</a>
            </span>
          </div>
        )}
      </PageLayout>
    </main>
  );
}
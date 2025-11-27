import React from "react";
import MenuCell from "../components/MenuCell";
import ColorLegend from "../components/ColorLegend";
import { supabase } from "../lib/supabase";
import { LocalMenuService } from "../services/LocalMenuService";
import { format, getISOWeek, getYear } from "date-fns";
import { normalizeMenu, extractDayFromMenu } from "../utils/menuNormalizer";

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
      let mealsData = [];
      if (supabase) {
        const { data, error } = await supabase
          .from("meals")
          .select(`
            id,
            meal_date,
            meal_type,
            meals_dishes (
              dish_id,
              position,
              dishes (
                id,
                name,
                description,
                dish_type
              )
            )
          `)
          .eq("meal_date", date);
        if (!error && data && data.length > 0) {
          mealsData = data;
        }
      }
      
      // Fallback localStorage si rien dans Supabase
      if (mealsData.length === 0) {
        const allMenus = LocalMenuService.getAllMenus();
        const dateObj = new Date(date + 'T12:00:00');
        const weekNum = getISOWeek(dateObj);
        const year = getYear(dateObj);
        
        const menuSemaine = allMenus.find(menu => 
          Number(menu.year) === year && Number(menu.week_number) === weekNum
        );
        
        if (menuSemaine && menuSemaine.data) {
          // Extraire uniquement le jour demandé du menu hebdomadaire
          const dayMenu = extractDayFromMenu(menuSemaine, jourActuel);
          setMenuData(dayMenu);
        } else {
          setMenuData(null);
        }
      } else {
        // IMPORTANT: Normaliser les données Supabase pour que les émojis s'affichent
        const dateObj = new Date(date + 'T12:00:00');
        const weekNum = getISOWeek(dateObj);
        const normalized = normalizeMenu(mealsData, weekNum);
        // Extraire uniquement le jour demandé
        const dayMenu = extractDayFromMenu(normalized, jourActuel);
        setMenuData(dayMenu);
      }
      setLoading(false);
    }
    fetchMenu();
  }, [date, jourActuel]);

  const hasMenu = menuData && menuData.data && Object.keys(menuData.data).length > 0;
  const meals = menuData?.meals || ['Midi', 'Soir'];

  return (
    <>
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
          {/* Légende des émojis */}
          <ColorLegend />
        </>
      ) : (
        <div style={{ color: '#d32f2f', fontWeight: 'bold', margin: '2rem 0', textAlign: 'center' }}>
          Aucun menu disponible pour ce jour.
        </div>
      )}
    </>
  );
}
import React from "react";
import MenuCell from "../components/MenuCell";
import ColorLegend from "../components/ColorLegend";
import ApiService from "../services/ApiService";
import { format, getISOWeek } from "date-fns";
import { normalizeMenu, extractDayFromMenu } from "../utils/menuNormalizer";

export default function DailyMenu(props) {
  const [menuData, setMenuData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const date = props.date || format(new Date(), "yyyy-MM-dd");
  const jours = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  const [year, month, day] = date.split('-').map(Number);
  const jourObj = new Date(year, month - 1, day);
  const jourActuel = jours[jourObj.getDay()];

  React.useEffect(() => {
    async function fetchMenu() {
      setLoading(true);
      
      try {
        const mealsData = await ApiService.getMenuForDate(date);
        
        if (mealsData && mealsData.length > 0) {
          const [dateYear, dateMonth, dateDay] = date.split('-').map(Number);
          const dateObj = new Date(dateYear, dateMonth - 1, dateDay);
          const weekNum = getISOWeek(dateObj);
          const normalized = normalizeMenu(mealsData, weekNum);
          const dayMenu = extractDayFromMenu(normalized, jourActuel);
          setMenuData(dayMenu);
        } else {
          setMenuData(null);
        }
      } catch (error) {
        console.error('Erreur chargement menu:', error);
        setMenuData(null);
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

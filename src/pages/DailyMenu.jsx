// Page qui affiche uniquement le menu du jour en cours
// ...existing code...
import React from "react";
import PageLayout from "../components/PageLayout";
import HeaderTable from "../components/HeaderTable";
import SiderTable from "../components/SiderTable";
import DishList from "../components/DishList";
import { supabase } from "../lib/supabase";
import { LocalMenuService } from "../services/LocalMenuService";
import { format, getISOWeek, getYear } from "date-fns";

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
        // Trouve le menu dans le localStorage par date
        const allMenus = LocalMenuService.getAllMenus();
        
        // Calculer le numéro de semaine ISO de la date
        const dateObj = new Date(date + 'T12:00:00');
        const weekNum = getISOWeek(dateObj);
        const year = getYear(dateObj);
        
        console.log('📦 DEBUG allMenus:', allMenus.map(m => ({ year: m.year, week: m.week_number })));
        console.log('📦 DEBUG recherche:', { year, weekNum });
        
        const menuSemaine = allMenus.find(menu => menu.year === year && menu.week_number === weekNum);
        
        console.log('📦 DEBUG menuDataJour:', { date, jourActuel, weekNum, year, menuSemaine });
        
        if (menuSemaine && menuSemaine.data) {
          // Transformer les données du format semaine vers le format jour
          const menuDuJour = {
            meals: menuSemaine.meals || ['Midi', 'Soir'],
            jourActuel: jourActuel,
            data: {}
          };
          
          // Extraire seulement les données du jour actuel
          menuSemaine.meals?.forEach(meal => {
            if (menuSemaine.data[meal] && menuSemaine.data[meal][jourActuel]) {
              menuDuJour.data[meal] = menuSemaine.data[meal][jourActuel];
            }
          });
          
          setMenuItems(menuDuJour);
        }
      }
      else {
        setMenuItems({ items });
      }
      setLoading(false);
    }
    fetchMenu();
  }, [date, jourActuel]);

  // Regrouper par type de repas (midi/soir)
  const mealsGrouped = React.useMemo(() => {
    // Si menuItems a une structure de jour localStorage (avec data et strings)
    if (menuItems.data) {
      return menuItems.data;
    }
    
    // Sinon, format Supabase avec items - convertir en strings
    const grouped = {};
    if (menuItems.items && Array.isArray(menuItems.items)) {
      menuItems.items.forEach(item => {
        const mealType = item.meal_types?.label || item.meal_type_id || 'Midi';
        if (!grouped[mealType]) {
          grouped[mealType] = [];
        }
        
        // Créer une string au format "TYPE: Nom du plat"
        const dishType = item.dish_type || item.dishes?.dish_type || 'AUTRE';
        const dishName = item.dishes?.name || item.name || '';
        grouped[mealType].push(`${dishType}: ${dishName}`);
      });
      
      // Convertir les tableaux en strings jointes par " / "
      Object.keys(grouped).forEach(mealType => {
        grouped[mealType] = grouped[mealType].join(' / ');
      });
    }
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
            Object.entries(mealsGrouped).map(([type, platsString]) => (
              <div key={type} style={{ marginBottom: "2.5rem" }}>
                <h3 style={{ 
                  fontSize: '1.4em', 
                  marginBottom: '1rem',
                  color: '#1971c2',
                  borderBottom: '2px solid #e9ecef',
                  paddingBottom: '0.5rem'
                }}>
                  {type}
                </h3>
                <DishList dishString={platsString} style="cards" />
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
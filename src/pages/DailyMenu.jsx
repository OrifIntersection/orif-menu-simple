import React from "react";
import { Table } from 'antd';
import PageLayout from "../components/PageLayout";
import DishListWeek from "../components/DishListWeek";
import ColorLegend from "../components/ColorLegend";
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
          .select(`*, meal_types (id, code, label), dishes (id, name, description, dish_type)`)
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
        
        const menuSemaine = allMenus.find(menu => menu.year === year && menu.week_number === weekNum);
        
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
        const mealType = item.meal_types?.label || 'Midi';
        if (!grouped[mealType]) {
          grouped[mealType] = [];
        }
        
        // Récupérer le type et le nom du plat depuis la relation dishes
        const dishType = item.dishes?.dish_type || 'AUTRE';
        const dishName = item.dishes?.name || '';
        
        if (dishName) {
          grouped[mealType].push(`${dishType}: ${dishName}`);
        }
      });
      
      // Convertir les tableaux en strings jointes par " / "
      Object.keys(grouped).forEach(mealType => {
        grouped[mealType] = grouped[mealType].join(' / ');
      });
    }
    return grouped;
  }, [menuItems]);

  // Créer les colonnes du tableau
  const columns = [
    {
      title: jourActuel,
      dataIndex: 'day',
      key: 'day',
      width: 120,
      className: 'day-column',
      render: (text) => <strong>{text}</strong>
    },
    ...Object.keys(mealsGrouped).map(mealType => ({
      title: mealType,
      dataIndex: mealType,
      key: mealType,
      render: (text) => text ? <DishListWeek dishString={text} /> : null
    }))
  ];

  // Créer les données pour la seule ligne du jour
  const dataSource = [{
    key: date,
    day: format(new Date(date + 'T12:00:00'), 'dd/MM/yyyy'),
    ...mealsGrouped
  }];

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
            <>
              <Table 
                columns={columns}
                dataSource={dataSource}
                pagination={false}
                bordered
                className="menu-table"
              />
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
        </div>
      </PageLayout>
    </main>
  );
}
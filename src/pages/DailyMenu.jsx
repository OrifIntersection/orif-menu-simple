import React from "react";
import { Table } from 'antd';
import PageLayout from "../components/PageLayout";
import DishListWeek from "../components/DishListWeek";
import ColorLegend from "../components/ColorLegend";
import { supabase } from "../lib/supabase";
import { LocalMenuService } from "../services/LocalMenuService";
import { format, getISOWeek, getYear } from "date-fns";
import { slugifyMealKey } from "../utils/mealKeyUtils";

export default function DailyMenu(props) {
  const [menuItems, setMenuItems] = React.useState({});
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
        // Trouve le menu dans le localStorage par date
        const allMenus = LocalMenuService.getAllMenus();
        
        // Calculer le numéro de semaine ISO de la date
        const dateObj = new Date(date + 'T12:00:00');
        const weekNum = getISOWeek(dateObj);
        const year = getYear(dateObj);
        
        const menuSemaine = allMenus.find(menu => 
          Number(menu.year) === year && Number(menu.week_number) === weekNum
        );
        
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
          
          console.log('📅 Extraction jour:', { jourActuel, menuDuJour });
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

  // Regrouper par type de repas (midi/soir) avec clés slugifiées
  const mealsGrouped = React.useMemo(() => {
    console.log('🔍 menuItems:', menuItems);
    const result = { meals: [] };
    
    // Si menuItems a une structure de jour localStorage (avec data et strings)
    if (menuItems.data) {
      console.log('📦 menuItems.data exists:', Object.keys(menuItems.data));
      Object.entries(menuItems.data).forEach(([mealType, dishes]) => {
        const { slug, label } = slugifyMealKey(mealType);
        result.meals.push({ slug, label });
        result[slug] = dishes;
        console.log(`  ➡️ ${mealType} (${slug}):`, dishes.substring(0, 50) + '...');
      });
      console.log('📊 DailyMenu - localStorage result:', result);
      return result;
    }
    
    // Sinon, format Supabase avec items - convertir en strings
    if (menuItems.items && Array.isArray(menuItems.items)) {
      const tempGrouped = {};
      
      menuItems.items.forEach(item => {
        const mealType = item.meal_types?.label || 'Midi';
        if (!tempGrouped[mealType]) {
          tempGrouped[mealType] = [];
        }
        
        // Récupérer le type et le nom du plat depuis la relation dishes
        const dishType = item.dishes?.dish_type || 'AUTRE';
        const dishName = item.dishes?.name || '';
        
        if (dishName) {
          tempGrouped[mealType].push(`${dishType}: ${dishName}`);
        }
      });
      
      // Convertir avec clés slugifiées
      Object.entries(tempGrouped).forEach(([mealType, dishes]) => {
        const { slug, label } = slugifyMealKey(mealType);
        result.meals.push({ slug, label });
        result[slug] = dishes.join(' / ');
      });
    }
    
    return result;
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
    ...(mealsGrouped.meals || []).map(({ slug, label }) => ({
      title: label,
      dataIndex: slug,
      key: slug,
      render: (text) => text ? <DishListWeek dishString={text} /> : null
    }))
  ];

  // Créer les données pour la seule ligne du jour
  const dataSource = [{
    key: date,
    day: format(new Date(date + 'T12:00:00'), 'dd/MM/yyyy'),
    ...(mealsGrouped.meals || []).reduce((acc, { slug }) => {
      acc[slug] = mealsGrouped[slug];
      return acc;
    }, {})
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
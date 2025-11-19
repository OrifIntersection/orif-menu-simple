import React from "react";
import { useParams } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import UserStatus from '../components/UserStatus';
import MenuTable from '../components/MenuTable';
import WeekPicker from '../components/WeekPicker';
import Footer from '../components/Footer';
import ColorLegend from '../components/ColorLegend';
import { supabase } from '../lib/supabase';
import { LocalMenuService } from '../services/LocalMenuService';
import { getISOWeek, startOfISOWeek, addDays, format } from 'date-fns';

/**
 * WeekMenuPage - Page autonome pour afficher le menu d'une semaine
 */
export default function WeekMenuPage() {
  const { weekNumber } = useParams();
  const currentYear = 2025;
  const weekNum = parseInt(weekNumber, 10) || getISOWeek(new Date());
  const [menuData, setMenuData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchWeekMenu() {
      setLoading(true);
      
      // D'ABORD: Vérifier le localStorage
      const localMenu = LocalMenuService.getMenuByWeek(currentYear, weekNum);
      if (localMenu && localMenu.data) {
        console.log('📦 Menu trouvé dans localStorage:', localMenu);
        setMenuData(localMenu);
        setLoading(false);
        return;
      }
      
      // SINON: Essayer Supabase
      const startDate = startOfISOWeek(new Date(currentYear, 0, 1));
      const weekStart = addDays(startDate, (weekNum - 1) * 7);
      const weekDates = Array.from({ length: 7 }, (_, i) => format(addDays(weekStart, i), 'yyyy-MM-dd'));
      
      const { data, error } = await supabase
        .from('meal_items')
        .select(`*, meal_types (id, code, label), dishes (id, name, description)`)
        .in('date', weekDates);
        
      if (error || !data || data.length === 0) {
        setMenuData(null);
      } else {
        setMenuData({ items: data || [] });
      }
      setLoading(false);
    }
    fetchWeekMenu();
  }, [currentYear, weekNum]);

  // Générer le titre avec le numéro de semaine
  const weekStart = startOfISOWeek(new Date(currentYear, 0, 1));
  const weekDateStart = addDays(weekStart, (weekNum - 1) * 7);
  const weekDateEnd = addDays(weekDateStart, 6);
  const title = `Menu Semaine ${weekNum} (${format(weekDateStart, 'dd/MM/yyyy')} - ${format(weekDateEnd, 'dd/MM/yyyy')})`;

  return (
    <main className="container">
      <PageLayout 
        title={title}
        actions={<UserStatus />}
      >
        <div style={{ maxWidth: '400px', margin: '0 auto 20px' }}>
          <WeekPicker />
        </div>
        {loading ? (
          <div>Chargement du menu...</div>
        ) : menuData && menuData.data ? (
          <>
            <MenuTable menu={menuData} />
            <ColorLegend />
          </>
        ) : (
          <div style={{textAlign: 'center', color: '#d32f2f', fontWeight: 'bold', margin: '2rem 0'}}>
            Aucun menu disponible pour cette semaine.
          </div>
        )}
        <Footer />
      </PageLayout>
    </main>
  );
}
import React from "react";
import { useParams } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import UserStatus from '../components/UserStatus';
import MenuTable from '../components/MenuTable';
import WeekPicker from '../components/WeekPicker';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';
import { getISOWeek, startOfISOWeek, addDays, format } from 'date-fns';

/**
 * WeekMenuPage - Page autonome pour afficher le menu d'une semaine
 */
export default function WeekMenuPage() {
  const { weekNumber } = useParams();
  const currentYear = 2025;
  const weekNum = parseInt(weekNumber, 10) || getISOWeek(new Date());
  const [menuItems, setMenuItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchWeekMenu() {
      setLoading(true);
      // Calculer la date de début de la semaine ISO
      const startDate = startOfISOWeek(new Date(currentYear, 0, 1));
      const weekStart = addDays(startDate, (weekNum - 1) * 7);
      const weekDates = Array.from({ length: 7 }, (_, i) => format(addDays(weekStart, i), 'yyyy-MM-dd'));
      // Récupérer tous les meal_items pour la semaine
      const { data, error } = await supabase
        .from('meal_items')
        .select(`*, meal_types (id, code, label), dishes (id, name, description)`) // adapter si besoin
        .in('date', weekDates);
      if (error) {
        setMenuItems([]);
      } else {
        setMenuItems(data || []);
      }
      setLoading(false);
    }
    fetchWeekMenu();
  }, [currentYear, weekNum]);

  // Regrouper les items par jour
  const daysGrouped = React.useMemo(() => {
    const grouped = {};
    menuItems.forEach(item => {
      if (!grouped[item.date]) grouped[item.date] = [];
      grouped[item.date].push(item);
    });
    return grouped;
  }, [menuItems]);

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
        ) : Object.keys(daysGrouped).length > 0 ? (
          Object.entries(daysGrouped).map(([date, items]) => (
            <div key={date} style={{ marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '0.5rem' }}>{format(new Date(date), 'EEEE dd/MM/yyyy', { locale: undefined })}</h3>
              <MenuTable menu={{
                meals: ["Midi", "Soir"],
                days: [date],
                items,
                data: {}
              }} />
            </div>
          ))
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
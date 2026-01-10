import React from "react";
import { useParams } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import MenuTable from '../components/MenuTable';
import WeekPicker from '../components/WeekPicker';
import Footer from '../components/Footer';
import ApiService from '../services/ApiService';
import { startOfISOWeek, addDays, format } from 'date-fns';
import { normalizeMenu, filterWeekdays } from '../utils/menuNormalizer';
import { getYearForWeek, getCurrentWeekNumber, getMondayOfWeek } from '../utils/dateUtils';

export default function WeekMenuPage() {
  const { year, weekNumber } = useParams();
  
  const weekNum = parseInt(weekNumber, 10) || getCurrentWeekNumber();
  const currentYear = year ? parseInt(year, 10) : getYearForWeek(weekNum);
  
  const [menuData, setMenuData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchWeekMenu() {
      setLoading(true);
      
      try {
        const meals = await ApiService.getMenuByWeek(currentYear, weekNum);
        
        if (meals && meals.length > 0) {
          const mealsWithDishes = meals.map(meal => ({
            ...meal,
            meals_dishes: meal.dishes ? meal.dishes.map(d => ({
              dish_id: d.id,
              dishes: d
            })) : []
          }));
          const normalized = normalizeMenu(mealsWithDishes, weekNum);
          setMenuData(normalized);
        } else {
          setMenuData(null);
        }
      } catch (error) {
        console.error('Erreur chargement menu:', error);
        setMenuData(null);
      }
      
      setLoading(false);
    }
    fetchWeekMenu();
  }, [currentYear, weekNum]);

  const weekDateStart = getMondayOfWeek(currentYear, weekNum);
  const weekDateEnd = addDays(weekDateStart, 4);
  const weekTitle = `Menu Semaine ${weekNum} (${format(weekDateStart, 'dd/MM/yyyy')} - ${format(weekDateEnd, 'dd/MM/yyyy')}) - ${currentYear}`;
  
  const filteredMenuData = filterWeekdays(menuData);

  return (
    <main className="container">
      <PageLayout 
        title="Cafétéria ORIF"
      >
        <div style={{ maxWidth: '400px', margin: '0 auto 20px' }}>
          <WeekPicker />
        </div>
        {loading ? (
          <div>Chargement du menu...</div>
        ) : filteredMenuData && filteredMenuData.data ? (
          <>
            <div className="table-header">
              <h3 className="table-caption">{weekTitle}</h3>
            </div>
            <MenuTable menu={filteredMenuData} />
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

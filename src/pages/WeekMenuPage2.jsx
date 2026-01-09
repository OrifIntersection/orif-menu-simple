import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import MenuTable from '../components/MenuTable';
import WeekPicker from '../components/WeekPicker';
import Footer from '../components/Footer';
import ApiService from '../services/ApiService';
import { getISOWeek } from 'date-fns';
import { normalizeMenu, filterWeekdays } from '../utils/menuNormalizer';

export default function WeekMenuPage2() {
  const { weekNumber } = useParams();
  const currentYear = 2025;
  const currentWeekNum = getISOWeek(new Date());
  const [selectedWeek, setSelectedWeek] = useState(weekNumber ? parseInt(weekNumber, 10) : currentWeekNum);
  const [menuData, setMenuData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMenu() {
      setLoading(true);
      try {
        const meals = await ApiService.getMenuByWeek(currentYear, selectedWeek);
        
        if (meals && meals.length > 0) {
          const mealsWithDishes = meals.map(meal => ({
            ...meal,
            meals_dishes: meal.dishes ? meal.dishes.map(d => ({
              dish_id: d.id,
              dishes: d
            })) : []
          }));
          const normalized = normalizeMenu(mealsWithDishes, selectedWeek);
          const filtered = filterWeekdays(normalized);
          setMenuData(filtered);
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
  }, [selectedWeek]);

  return (
    <main className="container">
      <PageLayout title={`Menu Semaine ${selectedWeek} (${currentYear})`}>
        <div style={{ maxWidth: '400px', margin: '0 auto 20px' }}>
          <WeekPicker value={selectedWeek} onChange={setSelectedWeek} />
        </div>
        {loading ? (
          <div>Chargement du menu...</div>
        ) : menuData && menuData.days && menuData.days.length > 0 ? (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '0.5rem', color: '#007bff' }}>Menu de la semaine</h3>
            <MenuTable menu={menuData} />
          </div>
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

// Page qui affiche le menu d'une semaine spécifique
import { useParams } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import UserStatus from '../components/UserStatus';
import MenuTable from '../components/MenuTable';
import WeekPicker from '../components/WeekPicker';
import Footer from '../components/Footer';
import React from "react";

/**
 * WeekMenuPage - Page autonome pour afficher le menu d'une semaine
 */
export default function WeekMenuPage() {
  const { weekNumber } = useParams();
  const currentYear = 2025;
  const weekNum = parseInt(weekNumber, 10) || 46;
  const [menuData, setMenuData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    async function fetchMenu() {
      setLoading(true);
      try {
        const { data, error } = await import('../services/MenuService').then(mod => mod.MenuService.getCompleteMenuByWeek(currentYear, weekNum));
        if (error || !data) {
          setMenuData(null);
        } else {
          setMenuData(data);
        }
      } catch {
        setMenuData(null);
      }
      setLoading(false);
    }
    fetchMenu();
  }, [currentYear, weekNum]);
  return (
    <main className="container">
      <PageLayout 
        title="Cafétéria ORIF"
        actions={<UserStatus />}
      >
        <div style={{ maxWidth: '400px', margin: '0 auto 20px' }}>
          <WeekPicker />
        </div>
        {loading ? (
          <div>Chargement du menu...</div>
        ) : menuData ? (
          <MenuTable menu={menuData} />
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
// Page qui affiche le menu d'une semaine spécifique
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getWeekLabel, getCurrentYear } from '../utils/dateUtils';
import PageLayout from '../components/PageLayout';
import MenuTable from '../components/MenuTable';
import WeekPicker from '../components/WeekPicker';
import DailyMenu from './DailyMenu';
import Footer from '../components/Footer';
import defaultMenu from '../data/defaultMenu';

/**
 * WeekMenuPage - Page autonome pour afficher le menu d'une semaine
 */
export default function WeekMenuPage() {
  const [showDailyMenu, setShowDailyMenu] = useState(false);
  const { weekNumber } = useParams();
  const navigate = useNavigate();
  const currentYear = getCurrentYear();
  const weekNum = parseInt(weekNumber, 10);

  if (isNaN(weekNum) || weekNum < 1 || weekNum > 53) {
    return (
      <main className="container">
        <PageLayout title="Erreur">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <h2>❌ Numéro de semaine invalide</h2>
            <p>Le numéro de semaine doit être entre 1 et 53.</p>
            <button onClick={() => navigate('/')}>🏠 Retour à l'accueil</button>
          </div>
          <Footer />
        </PageLayout>
      </main>
    );
  }

  const weekLabel = getWeekLabel(currentYear, weekNum);
  const weekMenu = { ...defaultMenu, weekLabel };

  return (
    <main className="container">
      <PageLayout 
        title="Cafétéria ORIF"
        actions={
          <button 
            className="toggle-view-btn"
            onClick={() => setShowDailyMenu(!showDailyMenu)}
            title={showDailyMenu ? "Voir le menu de la semaine" : "Voir le menu du jour"}
          >
            {showDailyMenu ? "📅 Menu semaine" : "📆 Menu du jour"}
          </button>
        }
      >
        <div style={{ maxWidth: '400px', margin: '0 auto 20px' }}>
          <WeekPicker />
        </div>
        {showDailyMenu ? <DailyMenu /> : <MenuTable menu={weekMenu} />}
        <Footer />
      </PageLayout>
    </main>
  );
}
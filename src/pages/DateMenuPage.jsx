// Page qui affiche le menu pour une date spécifique
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { parseDate, formatDate, getDayName, isWeekday, getWeekNumber, getCurrentYear, getWeekLabel } from '../utils/dateUtils';
import PageLayout from '../components/PageLayout';
import MenuTable from '../components/MenuTable';
import Footer from '../components/Footer';
import DailyMenu from './DailyMenu';
import DatePicker from '../components/DatePicker';
import defaultMenu from '../data/defaultMenu';

/**
 * DateMenuPage - Page autonome pour afficher le menu d'une date
 */
export default function DateMenuPage() {
  const [showDailyMenu, setShowDailyMenu] = useState(true);
  const { date } = useParams();
  const navigate = useNavigate();

  let targetDate;
  try {
    targetDate = parseDate(date);
    if (isNaN(targetDate.getTime())) throw new Error('Date invalide');
  } catch {
    return (
      <main className="container">
        <PageLayout title="Erreur">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <h2>❌ Date invalide</h2>
            <p>La date doit être au format YYYY-MM-DD (ex: 2025-10-31).</p>
            <button onClick={() => navigate('/')}>🏠 Retour à l'accueil</button>
          </div>
          <Footer />
        </PageLayout>
      </main>
    );
  }

  if (!isWeekday(targetDate)) {
    const dayName = getDayName(targetDate);
    return (
      <main className="container">
        <PageLayout title={`${dayName} ${formatDate(targetDate)}`}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <h2>🚫 Pas de menu le {dayName}</h2>
            <p>Le menu de la cafétéria n'est disponible que du lundi au vendredi.</p>
            <button onClick={() => navigate('/')}>🏠 Retour à l'accueil</button>
          </div>
          <Footer />
        </PageLayout>
      </main>
    );
  }

  const dayName = getDayName(targetDate);
  const weekNumber = getWeekNumber(targetDate);
  const pageTitle = `Menu du ${dayName} ${formatDate(targetDate)}`;
  const currentYear = getCurrentYear();
  const weekLabel = getWeekLabel(currentYear, weekNumber);
  const weekMenu = { ...defaultMenu, weekLabel };

  return (
    <main className="container">
      <PageLayout 
        title={pageTitle}
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
          <DatePicker />
        </div>
        {showDailyMenu ? <DailyMenu /> : <MenuTable menu={weekMenu} />}
        <Footer />
      </PageLayout>
    </main>
  );
}
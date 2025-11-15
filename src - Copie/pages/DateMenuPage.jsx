// Page qui affiche le menu pour une date spécifique
import { useParams, useNavigate } from 'react-router-dom';
import { parseDate, formatDate, getDayName, isWeekday } from '../utils/dateUtils';
import PageLayout from '../components/PageLayout';
import UserStatus from '../components/UserStatus';
import Footer from '../components/Footer';
import DailyMenu from './DailyMenu';
import DatePicker from '../components/DatePicker';

/**
 * DateMenuPage - Page autonome pour afficher le menu d'une date
 */
export default function DateMenuPage() {
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
        <PageLayout title="Cafétéria ORIF">
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
  const pageTitle = `Menu du ${dayName} ${formatDate(targetDate)}`;

  return (
    <main className="container">
      <PageLayout 
        title={pageTitle}
        actions={<UserStatus />}
      >
        <div style={{ maxWidth: '400px', margin: '0 auto 20px' }}>
          <DatePicker />
        </div>
        <DailyMenu date={date} />
        <Footer />
      </PageLayout>
    </main>
  );
}
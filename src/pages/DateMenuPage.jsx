// Page qui affiche le menu pour une date spécifique
import { useParams, useNavigate } from 'react-router-dom';
import { parseDate, getDayName, isWeekday } from '../utils/dateUtils';
import PageLayout from '../components/PageLayout';
import Footer from '../components/Footer';
import DailyMenu from './DailyMenu';
import DatePicker from '../components/DatePicker';

/**
 * DateMenuPage - Page autonome pour afficher le menu d'une date
 */
export default function DateMenuPage() {
    let renderError = null;
  const { date } = useParams();
  const navigate = useNavigate();

  let targetDate;
  try {
    targetDate = parseDate(date);
    if (isNaN(targetDate.getTime())) throw new Error('Date invalide');
  } catch {
    renderError = (
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

  if (!renderError && !isWeekday(targetDate)) {
    const dayName = getDayName(targetDate);
    renderError = (
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

  if (renderError) return renderError;

  const dayName = getDayName(targetDate);
  const dateFormatted = targetDate.toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
  const dayTitle = `Menu du ${dayName} ${dateFormatted}`;

  // Pas de DEBUG ici - DailyMenu gère ses propres données

  return (
    <main className="container">
      <PageLayout 
        title="Cafétéria ORIF"
      >
        <div className="table-header">
          <h3 className="table-caption">{dayTitle}</h3>
        </div>
        <div style={{ maxWidth: '400px', margin: '0 auto 20px' }}>
          <DatePicker />
        </div>
        <DailyMenu date={date} />
        <Footer />
      </PageLayout>
    </main>
  );
}
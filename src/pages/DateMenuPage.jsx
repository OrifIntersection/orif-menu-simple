// Page pour une date spécifique
import { useParams, useNavigate } from 'react-router-dom';
import { parseDate, formatDate, getDayName, isWeekday, getWeekNumber } from '../utils/dateUtils';
import HeaderPage from '../components/HeaderPage';
import Footer from '../components/Footer';
import DailyMenu from './DailyMenu';

export default function DateMenuPage() {
  const { date } = useParams();
  const navigate = useNavigate();

  let targetDate;
  try {
    targetDate = parseDate(date);
    if (isNaN(targetDate.getTime())) {
      throw new Error('Date invalide');
    }
  } catch {
    return (
      <main className="container">
        <HeaderPage weekLabel="Erreur" />
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2>❌ Date invalide</h2>
          <p>La date doit être au format YYYY-MM-DD (ex: 2025-10-31).</p>
          <button onClick={() => navigate('/')}>🏠 Retour à l'accueil</button>
        </div>
        <Footer />
      </main>
    );
  }

  // Vérifier si c'est un jour de semaine
  if (!isWeekday(targetDate)) {
    const dayName = getDayName(targetDate);
    return (
      <main className="container">
        <HeaderPage weekLabel={`${dayName} ${formatDate(targetDate)}`} />
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2>🚫 Pas de menu le {dayName}</h2>
          <p>Le menu de la cafétéria n'est disponible que du lundi au vendredi.</p>
          <button onClick={() => navigate('/')}>🏠 Retour à l'accueil</button>
        </div>
        <Footer />
      </main>
    );
  }

  const dayName = getDayName(targetDate);
  const weekNumber = getWeekNumber(targetDate);
  const pageTitle = `Menu du ${dayName} ${formatDate(targetDate)}`;

  return (
    <main className="container">
      <HeaderPage weekLabel={pageTitle} />
      
      <div style={{ marginBottom: "20px", textAlign: "center" }}>
        <button onClick={() => navigate('/')}>🏠 Accueil</button>
        <button 
          onClick={() => navigate(`/week/${weekNumber}`)}
          style={{ marginLeft: '10px' }}
        >
          📅 Voir toute la semaine
        </button>
        <button onClick={() => navigate('/admin')} style={{ marginLeft: '10px' }}>
          ⚙️ Administration
        </button>
      </div>

      <DailyMenu />
      
      <Footer />
    </main>
  );
}
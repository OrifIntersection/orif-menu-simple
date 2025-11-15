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
  const pageTitle = `Menu du ${dayName} ${formatDate(targetDate)}`;

  // DEBUG block
  let debugMenuData = null;
  let debugMenuDataJour = null;
  let debugLoading = true;
  try {
    const localMenus = JSON.parse(localStorage.getItem('menus_local') || '[]');
    debugMenuData = localMenus;
    // Recherche du menu du jour
    const dayName = getDayName(targetDate);
    debugMenuDataJour = localMenus.filter(m => {
      if (!m.days || !m.data) return false;
      return m.days.some(day => day === dayName);
    });
    debugLoading = false;
  } catch {
    debugMenuData = [];
    debugMenuDataJour = [];
    debugLoading = true;
  }

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
        {/* DEBUG block en bas du tableau */}
        <div style={{ background: '#fff3cd', color: '#856404', padding: '1rem', borderRadius: 8, marginTop: '2rem', fontSize: '0.95rem' }}>
          <strong>DEBUG</strong><br />
          <div>menuData : <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: '0.9rem', background: '#f8f9fa', padding: '0.5rem', borderRadius: 4 }}>{JSON.stringify(debugMenuData, null, 2)}</pre></div>
          <div>menuDataJour : <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: '0.9rem', background: '#f8f9fa', padding: '0.5rem', borderRadius: 4 }}>{JSON.stringify(debugMenuDataJour, null, 2)}</pre></div>
          <div>loading : {String(debugLoading)}</div>
        </div>
        <Footer />
      </PageLayout>
    </main>
  );
}
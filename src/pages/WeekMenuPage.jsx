// Page pour une semaine spécifique
import { useParams, useNavigate } from 'react-router-dom';
import { getWeekLabel, getCurrentYear } from '../utils/dateUtils';
import MenuTable from '../components/MenuTable';
import HeaderPage from '../components/HeaderPage';
import Footer from '../components/Footer';
import defaultMenu from '../data/defaultMenu';

export default function WeekMenuPage() {
  const { weekNumber } = useParams();
  const navigate = useNavigate();
  const currentYear = getCurrentYear();
  const weekNum = parseInt(weekNumber, 10);

  // Validation du numéro de semaine
  if (isNaN(weekNum) || weekNum < 1 || weekNum > 53) {
    return (
      <main className="container">
        <HeaderPage weekLabel="Erreur" />
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2>❌ Numéro de semaine invalide</h2>
          <p>Le numéro de semaine doit être entre 1 et 53.</p>
          <button onClick={() => navigate('/')}>🏠 Retour à l'accueil</button>
        </div>
        <Footer />
      </main>
    );
  }

  const weekLabel = getWeekLabel(currentYear, weekNum);
  
  // Menu avec le bon label de semaine
  const weekMenu = {
    ...defaultMenu,
    weekLabel: weekLabel
  };

  return (
    <main className="container">
      <HeaderPage weekLabel={weekLabel} />
      
      <div style={{ marginBottom: "20px", textAlign: "center" }}>
        <button onClick={() => navigate('/')}>🏠 Accueil</button>
        <button 
          onClick={() => navigate(`/date/${new Date().toISOString().split('T')[0]}`)}
          style={{ marginLeft: '10px' }}
        >
          📆 Voir menu du jour
        </button>
        <button onClick={() => navigate('/admin')} style={{ marginLeft: '10px' }}>
          ⚙️ Administration
        </button>
      </div>

      <MenuTable menu={weekMenu} />
      
      <Footer />
    </main>
  );
}
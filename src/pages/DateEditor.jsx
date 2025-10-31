// Page d'édition pour une date spécifique
import { useParams, useNavigate } from 'react-router-dom';
import { parseDate, formatDate, getDayName, isWeekday } from '../utils/dateUtils';
import HeaderPage from '../components/HeaderPage';
import Footer from '../components/Footer';

export default function DateEditor() {
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
          <button onClick={() => navigate('/admin')}>🏠 Retour à l'administration</button>
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
        <HeaderPage weekLabel={`Édition - ${dayName} ${formatDate(targetDate)}`} />
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2>🚫 Pas de menu le {dayName}</h2>
          <p>Le menu de la cafétéria n'est disponible que du lundi au vendredi.</p>
          <button onClick={() => navigate('/admin')}>🏠 Retour à l'administration</button>
        </div>
        <Footer />
      </main>
    );
  }

  const dayName = getDayName(targetDate);

  return (
    <main className="container">
      <HeaderPage weekLabel={`Édition - ${dayName} ${formatDate(targetDate)}`} />
      
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>✏️ Modification du menu - {dayName}</h2>
        <p><strong>{formatDate(targetDate)}</strong></p>
        
        <div style={{ 
          margin: '2rem auto', 
          padding: '2rem', 
          border: '2px dashed #ccc', 
          borderRadius: '8px',
          maxWidth: '600px'
        }}>
          <h3>🚧 Fonctionnalité en développement</h3>
          <p>L'interface d'édition du menu sera bientôt disponible.</p>
          <p>Vous pourrez ici modifier :</p>
          <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '1rem auto' }}>
            <li>Le menu du midi</li>
            <li>Le menu du soir</li>
            <li>Les plats de chaque catégorie</li>
            <li>Les informations nutritionnelles</li>
          </ul>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <button 
            onClick={() => navigate(`/date/${date}`)}
            style={{ 
              margin: '0.5rem',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem'
            }}
          >
            👀 Voir le menu de ce jour
          </button>
          <button 
            onClick={() => navigate('/admin')}
            style={{ 
              margin: '0.5rem',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem'
            }}
          >
            🏠 Retour à l'administration
          </button>
        </div>
      </div>
      
      <Footer />
    </main>
  );
}
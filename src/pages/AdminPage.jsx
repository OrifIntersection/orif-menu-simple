// Page d'administration complète
import { useNavigate } from 'react-router-dom';
import { getCurrentWeekNumber, formatDate } from '../utils/dateUtils';
import HeaderPage from '../components/HeaderPage';
import Footer from '../components/Footer';

export default function AdminPage() {
  const navigate = useNavigate();
  const currentWeekNumber = getCurrentWeekNumber();
  const today = formatDate(new Date());

  return (
    <main className="container">
      <HeaderPage weekLabel="Administration du menu" />
      
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>⚙️ Administration du menu de la cafétéria</h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '2rem', 
          marginTop: '2rem' 
        }}>
          
          {/* Section modification rapide */}
          <div style={{ 
            border: '2px solid #007bff', 
            borderRadius: '8px', 
            padding: '1.5rem',
            backgroundColor: '#f8f9fa'
          }}>
            <h3>🚀 Modification rapide</h3>
            <div style={{ marginTop: '1rem' }}>
              <button 
                onClick={() => navigate(`/admin/week/${currentWeekNumber}`)}
                style={{ 
                  display: 'block', 
                  width: '100%', 
                  margin: '0.5rem 0', 
                  padding: '0.75rem',
                  fontSize: '1rem'
                }}
              >
                📅 Modifier la semaine courante (S{currentWeekNumber})
              </button>
              <button 
                onClick={() => navigate(`/admin/date/${today}`)}
                style={{ 
                  display: 'block', 
                  width: '100%', 
                  margin: '0.5rem 0', 
                  padding: '0.75rem',
                  fontSize: '1rem'
                }}
              >
                � Modifier le menu d'aujourd'hui
              </button>
            </div>
          </div>

          {/* Section navigation par semaine */}
          <div style={{ 
            border: '2px solid #28a745', 
            borderRadius: '8px', 
            padding: '1.5rem',
            backgroundColor: '#f8f9fa'
          }}>
            <h3>📅 Navigation par semaine</h3>
            <div style={{ marginTop: '1rem' }}>
              <label htmlFor="week-input" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Numéro de semaine (1-53):
              </label>
              <input 
                id="week-input"
                type="number" 
                min="1" 
                max="53" 
                defaultValue={currentWeekNumber}
                style={{ 
                  width: '100%', 
                  padding: '0.5rem', 
                  marginBottom: '1rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
              <button 
                onClick={() => {
                  const input = document.getElementById('week-input');
                  const weekNum = parseInt(input.value, 10);
                  if (weekNum >= 1 && weekNum <= 53) {
                    navigate(`/admin/week/${weekNum}`);
                  }
                }}
                style={{ 
                  width: '100%', 
                  padding: '0.75rem',
                  fontSize: '1rem'
                }}
              >
                ✏️ Modifier cette semaine
              </button>
            </div>
          </div>

          {/* Section navigation par date */}
          <div style={{ 
            border: '2px solid #ffc107', 
            borderRadius: '8px', 
            padding: '1.5rem',
            backgroundColor: '#f8f9fa'
          }}>
            <h3>📆 Navigation par date</h3>
            <div style={{ marginTop: '1rem' }}>
              <label htmlFor="date-input" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Date (YYYY-MM-DD):
              </label>
              <input 
                id="date-input"
                type="date" 
                defaultValue={today}
                style={{ 
                  width: '100%', 
                  padding: '0.5rem', 
                  marginBottom: '1rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
              <button 
                onClick={() => {
                  const input = document.getElementById('date-input');
                  const date = input.value;
                  if (date) {
                    navigate(`/admin/date/${date}`);
                  }
                }}
                style={{ 
                  width: '100%', 
                  padding: '0.75rem',
                  fontSize: '1rem'
                }}
              >
                ✏️ Modifier ce jour
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div style={{ marginTop: '3rem' }}>
          <button 
            onClick={() => navigate('/')}
            style={{ 
              padding: '1rem 2rem',
              fontSize: '1.1rem',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            🏠 Retour à l'accueil
          </button>
        </div>
      </div>
      
      <Footer />
    </main>
  );
}
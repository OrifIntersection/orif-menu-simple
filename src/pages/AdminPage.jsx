// Page d'administration autonome
import { useNavigate } from 'react-router-dom';
import { getCurrentWeekNumber, formatDate } from '../utils/dateUtils';
import PageLayout from '../components/PageLayout';
import DatePicker from '../components/DatePicker';
import WeekPicker from '../components/WeekPicker';
import Footer from '../components/Footer';

export default function AdminPage() {
  const navigate = useNavigate();
  const currentWeekNumber = getCurrentWeekNumber();
  const today = formatDate(new Date());

  return (
    <main className="container">
      <PageLayout title="Administration du menu">
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
                  📆 Modifier le menu d'aujourd'hui
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
              <h3>📅 Consulter un menu par semaine</h3>
              <div style={{ marginTop: '1rem' }}>
                <WeekPicker />
              </div>
            </div>

            {/* Section navigation par date */}
            <div style={{ 
              border: '2px solid #ffc107', 
              borderRadius: '8px', 
              padding: '1.5rem',
              backgroundColor: '#f8f9fa'
            }}>
              <h3>📆 Consulter un menu par date</h3>
              <div style={{ marginTop: '1rem' }}>
                <DatePicker />
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
      </PageLayout>
    </main>
  );
}
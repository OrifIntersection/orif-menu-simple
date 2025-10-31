// Page d'administration
import { useNavigate } from 'react-router-dom';
import HeaderPage from '../components/HeaderPage';
import Footer from '../components/Footer';

export default function AdminPage() {
  const navigate = useNavigate();

  return (
    <main className="container">
      <HeaderPage weekLabel="Administration" />
      
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>⚙️ Administration du menu</h2>
        
        <div style={{ marginTop: '2rem' }}>
          <button 
            onClick={() => navigate('/admin/week/44')}
            style={{ margin: '1rem', padding: '1rem 2rem', fontSize: '1.1rem' }}
          >
            📅 Modifier une semaine
          </button>
          
          <button 
            onClick={() => navigate('/admin/date/2025-10-31')}
            style={{ margin: '1rem', padding: '1rem 2rem', fontSize: '1.1rem' }}
          >
            📆 Modifier un jour
          </button>
        </div>

        <div style={{ marginTop: '3rem' }}>
          <button 
            onClick={() => navigate('/')}
            style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}
          >
            🏠 Retour à l'accueil
          </button>
        </div>
      </div>
      
      <Footer />
    </main>
  );
}
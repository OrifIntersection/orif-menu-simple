// Page pour une date spécifique
import { useParams, useNavigate } from 'react-router-dom';
import HeaderPage from '../components/HeaderPage';
import Footer from '../components/Footer';
import DailyMenu from './DailyMenu';

export default function DateMenuPage() {
  const { date } = useParams();
  const navigate = useNavigate();

  return (
    <main className="container">
      <HeaderPage weekLabel={`Menu du ${date}`} />
      
      <div style={{ marginBottom: "20px", textAlign: "center" }}>
        <button onClick={() => navigate('/')}>🏠 Accueil</button>
        <button onClick={() => navigate('/admin')} style={{ marginLeft: '10px' }}>
          ⚙️ Administration
        </button>
      </div>

      <DailyMenu />
      
      <Footer />
    </main>
  );
}
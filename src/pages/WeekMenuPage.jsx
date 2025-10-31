// Page pour une semaine spécifique
import { useParams, useNavigate } from 'react-router-dom';
import MenuTable from '../components/MenuTable';
import HeaderPage from '../components/HeaderPage';
import Footer from '../components/Footer';
import defaultMenu from '../data/defaultMenu';

export default function WeekMenuPage() {
  const { weekNumber } = useParams();
  const navigate = useNavigate();

  return (
    <main className="container">
      <HeaderPage weekLabel={`Semaine ${weekNumber}`} />
      
      <div style={{ marginBottom: "20px", textAlign: "center" }}>
        <button onClick={() => navigate('/')}>🏠 Accueil</button>
        <button onClick={() => navigate('/admin')} style={{ marginLeft: '10px' }}>
          ⚙️ Administration
        </button>
      </div>

      <MenuTable menu={defaultMenu} />
      
      <Footer />
    </main>
  );
}
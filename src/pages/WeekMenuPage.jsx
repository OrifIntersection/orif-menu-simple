// Page qui affiche le menu d'une semaine spécifique
// ...existing code...
import { useParams } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import UserStatus from '../components/UserStatus';
import MenuTable from '../components/MenuTable';
import WeekPicker from '../components/WeekPicker';
import Footer from '../components/Footer';
import defaultMenu from '../data/defaultMenu';

/**
 * WeekMenuPage - Page autonome pour afficher le menu d'une semaine
 */
export default function WeekMenuPage() {
  // Récupère le numéro de semaine depuis l'URL
  const { weekNumber } = useParams();
  const currentYear = 2025;
  const weekNum = parseInt(weekNumber, 10) || 46;
  // Calcul des dates de début et de fin de semaine dynamiquement
  const getWeekDates = (week, year) => {
    const simpleMonday = (y, w) => {
      const d = new Date(y, 0, 1 + (w - 1) * 7);
      const day = d.getDay();
      const mondayOffset = day <= 4 ? day - 1 : day - 8;
      d.setDate(d.getDate() - mondayOffset);
      return d;
    };
    const start = simpleMonday(year, week);
    const end = new Date(start);
    end.setDate(start.getDate() + 4);
    return [start, end];
  };
  const [startDate, endDate] = getWeekDates(weekNum, currentYear);
  const formatDate = (date) => date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  return (
    <main className="container">
      <PageLayout 
        title="Cafétéria ORIF"
        actions={<UserStatus />}
      >
        <div style={{ maxWidth: '400px', margin: '0 auto 20px' }}>
          <WeekPicker />
        </div>
        <MenuTable menu={{ ...defaultMenu, weekLabel: `${formatDate(startDate)} au ${formatDate(endDate)}`, weekNumber: weekNum }} />
        <Footer />
      </PageLayout>
    </main>
  );
}
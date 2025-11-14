// Fichier principal de l'application React avec système de navigation
import React from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { getCurrentYear, getCurrentWeekNumber } from "./utils/dateUtils";
import PageLayout from "./components/PageLayout";
import MenuTable from "./components/MenuTable";
import Footer from "./components/Footer";
import UserStatus from "./components/UserStatus";
import { AuthProvider } from "./contexts/AuthContext";
import DailyMenu from "./pages/DailyMenu";
import WeekMenuPage from "./pages/WeekMenuPage";
import DateMenuPage from "./pages/DateMenuPage";
import AdminPage from "./pages/AdminPage";
import WeekEditor from "./pages/WeekEditor";
import DateEditor from './pages/DateEditor';
import LoginPage from './pages/LoginPage';
import AuthCallback from './pages/AuthCallback';
import AuthCallbackDebug from './pages/AuthCallbackDebug';
import ImportMenuPage from './pages/ImportMenuPage';
import "./styles.css";

/**
 * HomePage - Page d'accueil
 * Affiche le menu de la semaine par défaut
 */
function HomePage() {
  const currentYear = getCurrentYear();
  const currentWeekNumber = getCurrentWeekNumber();
  const [menuData, setMenuData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchMenu() {
      setLoading(true);
      try {
        const { data, error } = await import('./services/MenuService').then(mod => mod.MenuService.getCompleteMenuByWeek(currentYear, currentWeekNumber));
        if (error || !data) {
          setMenuData(null);
        } else {
          setMenuData(data);
        }
      } catch {
        setMenuData(null);
      }
      setLoading(false);
    }
    fetchMenu();
  }, [currentYear, currentWeekNumber]);

  // Calcul des dates de début et de fin de semaine
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
  const [startDate, endDate] = getWeekDates(currentWeekNumber, currentYear);
  const formatDate = (date) => date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <main className="container">
      <PageLayout 
        title="Cafétéria ORIF"
        actions={<UserStatus />}
      >
        <h2 className="menu-title" style={{textAlign: 'center', marginBottom: '1.5rem'}}>
          {`Menu la semaine N° ${currentWeekNumber} du ${formatDate(startDate)} au ${formatDate(endDate)}`}
        </h2>
        {loading ? (
          <div>Chargement du menu...</div>
        ) : menuData ? (
          <MenuTable menu={menuData} />
        ) : (
          <div style={{textAlign: 'center', color: '#d32f2f', fontWeight: 'bold', margin: '2rem 0'}}>
            Aucun menu disponible pour cette semaine.
          </div>
        )}
        <Footer />
      </PageLayout>
    </main>
  );
}

/**
 * App - Composant racine de l'application
 * Configure le routeur et définit toutes les routes de l'application
 */
export default function App() {
  return (
    <AuthProvider>
      {/* BrowserRouter active le système de navigation basé sur l'URL */}
      <BrowserRouter>
        {/* Routes définit toutes les routes possibles de l'application */}
        <Routes>
          {/* Route pour la page d'accueil (/) */}
          <Route path="/" element={<HomePage />} />
          {/* Route pour la page de connexion */}
          <Route path="/login" element={<LoginPage />} />
          {/* Route pour le callback d'authentification Magic Link */}
          <Route path="/auth/callback" element={<AuthCallbackDebug />} />
          {/* Route pour afficher le menu d'une semaine spécifique */}
          {/* :weekNumber est un paramètre dynamique (ex: /week/44) */}
          <Route path="/week/:weekNumber" element={<WeekMenuPage />} />
          {/* Route pour afficher le menu d'une date spécifique */}
          {/* :date est un paramètre dynamique (ex: /date/2025-11-05) */}
          <Route path="/date/:date" element={<DateMenuPage />} />
          {/* Route pour la page d'administration */}
          <Route path="/admin" element={<AdminPage />} />
          {/* Route pour l'import de menus Excel */}
          <Route path="/admin/import" element={<ImportMenuPage />} />
          {/* Route pour éditer le menu d'une semaine */}
          <Route path="/admin/week/:weekNumber" element={<WeekEditor />} />
          {/* Route pour éditer le menu d'une date */}
          <Route path="/admin/date/:date" element={<DateEditor />} />
          {/* Route catch-all pour toutes les URLs non définies */}
          {/* Redirige vers la page d'accueil */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

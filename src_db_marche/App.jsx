import TestLocalMenu from './pages/TestLocalMenu.jsx';






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
import ImportLocalMenuPage from './pages/ImportLocalMenuPage';
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
      // Calculer les dates de la semaine
      const monday = (y, w) => {
        const d = new Date(y, 0, 1 + (w - 1) * 7);
        const day = d.getDay();
        const mondayOffset = day <= 4 ? day - 1 : day - 8;
        d.setDate(d.getDate() - mondayOffset);
        return d;
      };
      const start = monday(currentYear, currentWeekNumber);
      const weekDates = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        return date.toISOString().slice(0, 10);
      });
      // Récupérer tous les meal_items pour la semaine
      const { supabase } = await import('./lib/supabase');
      const { data, error } = await supabase
        .from('meal_items')
        .select(`*, meal_types (id, code, label), dishes (id, name, description)`) // adapter si besoin
        .in('date', weekDates);
      if (error) {
        setMenuData(null);
      } else {
        setMenuData(data || []);
      }
      setLoading(false);
    }
    fetchMenu();
  }, [currentYear, currentWeekNumber]);

  // Calcul des dates de début et de fin de semaine
  const simpleMonday = (y, w) => {
    const d = new Date(y, 0, 1 + (w - 1) * 7);
    const day = d.getDay();
    const mondayOffset = day <= 4 ? day - 1 : day - 8;
    d.setDate(d.getDate() - mondayOffset);
    return d;
  };
  const startDate = simpleMonday(currentYear, currentWeekNumber);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  const formatDate = (date) => date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  // Générer la liste des dates de la semaine (format yyyy-MM-dd)
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    return date.toISOString().slice(0, 10);
  });

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
          <MenuTable menu={{
            meals: ["Midi", "Soir"],
            days: weekDates,
            items: menuData,
            data: {}
          }} />
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
          {/* Route pour l'import de menus Excel (Supabase) */}
          <Route path="/admin/import" element={<ImportMenuPage />} />
          {/* Route pour l'import de menus Excel en local */}
          <Route path="/import-local-menu" element={<ImportLocalMenuPage />} />
          {/* Route pour l'aperçu des menus locaux */}
          <Route path="/test-local-menu" element={<TestLocalMenu />} />
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

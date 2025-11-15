// Fichier principal de l'application React avec système de navigation
import React from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { getCurrentYear, getCurrentWeekNumber } from "./utils/dateUtils";
import PageLayout from "./components/PageLayout";
import { LocalMenuService } from "./services/LocalMenuService";
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
import WeekMenuPage2 from './pages/WeekMenuPage2';
import ImportLocalMenuPage from './pages/ImportLocalMenuPage';
import ImportMenuPage from './pages/ImportMenuPage';
import "./styles.css";

/**
 * HomePage - Page d'accueil
 * Affiche le menu de la semaine par défaut
 */
function HomePage() {
      // Récupère toutes les semaines disponibles dans le localStorage
      const allMenus = LocalMenuService.getAllMenus();
      const allWeeks = allMenus.map(m => m.week_number).filter((v, i, arr) => arr.indexOf(v) === i);
      const [selectedWeek, setSelectedWeek] = React.useState("");
      const [selectedDate, setSelectedDate] = React.useState("");
      const navigate = useNavigate();
    // Déclaration des hooks d'abord
    const [menuData, setMenuData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    // Debug : affiche l'état de menuData
    const debugInfo = (
      <div style={{ background: '#fff3cd', color: '#856404', padding: '1rem', borderRadius: 8, marginBottom: '1rem', fontSize: '0.95rem' }}>
        <strong>DEBUG</strong><br />
        <div>menuData : <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: '0.9rem', background: '#f8f9fa', padding: '0.5rem', borderRadius: 4 }}>{JSON.stringify(menuData, null, 2)}</pre></div>
        <div>loading : {String(loading)}</div>
      </div>
    );
  const currentYear = getCurrentYear();
  const currentWeekNumber = getCurrentWeekNumber();
  // ...hooks déjà déclarés plus haut...
  React.useEffect(() => {
    setLoading(true);
    // Vérifie d'abord le localStorage
    const localMenu = LocalMenuService.getMenuByWeek(currentYear, currentWeekNumber);
    if (localMenu && localMenu.days && localMenu.days.length > 0) {
      setMenuData({
        meals: localMenu.meals,
        days: localMenu.days,
        data: localMenu.data
      });
      setLoading(false);
      return;
    }
    // Sinon, utilise Supabase
    (async function fetchMenu() {
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
      const { supabase } = await import('./lib/supabase');
      const { data, error } = await supabase
        .from('meal_items')
        .select(`*, meal_types (id, code, label), dishes (id, name, description)`)
        .in('date', weekDates);
      if (error) {
        setMenuData(null);
      } else {
        setMenuData({
          meals: ["Midi", "Soir"],
          days: weekDates,
          items: data || [],
          data: {}
        });
      }
      setLoading(false);
    })();
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

  // ...navigate déjà déclaré plus haut...
  return (
    <main className="container">
      <PageLayout 
        title="Cafétéria ORIF"
        actions={<UserStatus />}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', gap: '1rem' }}>
          <button
            style={{ padding: '0.7rem 1.5rem', background: '#007bff', color: 'white', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}
            onClick={() => navigate(`/week2/${currentWeekNumber}`)}
          >
            Menu de la semaine 2
          </button>
          <button
            style={{ padding: '0.7rem 1.5rem', background: '#28a745', color: 'white', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}
            onClick={() => navigate('/import-local')}
          >
            Importation locale (robuste)
          </button>
        </div>
        {/* Bouton déroulant pour choisir une autre semaine */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <select
            value={selectedWeek}
            onChange={e => {
              setSelectedWeek(e.target.value);
              if (e.target.value) navigate(`/week2/${e.target.value}`);
            }}
            style={{ padding: '0.5rem 1.2rem', borderRadius: 6, fontWeight: 'bold', minWidth: 120 }}
          >
            <option value="">Menu d'autre semaine disponible</option>
            {allWeeks.map(week => (
              <option key={week} value={week}>{`Semaine ${week}`}</option>
            ))}
          </select>
          {/* Agenda pour choisir un jour */}
          <input
            type="date"
            value={selectedDate}
            onChange={e => {
              setSelectedDate(e.target.value);
              if (e.target.value) navigate(`/date/${e.target.value}`);
            }}
            style={{ padding: '0.5rem 1.2rem', borderRadius: 6, fontWeight: 'bold', minWidth: 160 }}
          />
        </div>
        <h2 className="menu-title" style={{textAlign: 'center', marginBottom: '1.5rem'}}>
          {`Menu la semaine N° ${currentWeekNumber} du ${formatDate(startDate)} au ${formatDate(endDate)}`}
        </h2>
        {debugInfo}
        {loading ? (
          <div>Chargement du menu...</div>
        ) : menuData ? (
          <MenuTable menu={{
            ...menuData,
            items: Array.isArray(menuData.items) ? menuData.items : []
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
          <Route path="/week/:weekNumber" element={<WeekMenuPage />} />
          {/* Route pour la version alternative du menu de la semaine */}
          <Route path="/week2/:weekNumber" element={<WeekMenuPage2 />} />
          {/* Route pour l'importation locale robuste */}
          <Route path="/import-local" element={<ImportLocalMenuPage />} />
          {/* Route pour afficher le menu d'une date spécifique */}
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
          <Route path="*" element={<HomePage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

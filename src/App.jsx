// Fichier principal de l'application React avec système de navigation
import React from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { DatePicker as AntDatePicker } from "antd";
import dayjs from "dayjs";
import { CalendarOutlined } from '@ant-design/icons';
import { getCurrentYear, getCurrentWeekNumber } from "./utils/dateUtils";
import PageLayout from "./components/PageLayout";
import { LocalMenuService } from "./services/LocalMenuService";
import MenuTable from "./components/MenuTable";
import Footer from "./components/Footer";
import { AuthProvider } from "./contexts/AuthContext";
import { normalizeMenu, filterWeekdays } from "./utils/menuNormalizer";
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
import StyleDemo from './pages/StyleDemo';
import EmojiDemo from './pages/EmojiDemo';
import { ProtectedRoute } from './components/ProtectedRoute';
import "./styles.css";

/**
 * HomePage - Page d'accueil
 * Affiche le menu de la semaine par défaut
 */
function HomePage() {
  const [selectedWeek, setSelectedWeek] = React.useState("");
  const [selectedDate, setSelectedDate] = React.useState(null);
  const [menuData, setMenuData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [availableWeeks, setAvailableWeeks] = React.useState([]);
  const navigate = useNavigate();
  
  const currentYear = getCurrentYear();
  const currentWeekNumber = getCurrentWeekNumber();

  // Charger les semaines disponibles depuis Supabase ET localStorage
  React.useEffect(() => {
    async function loadAvailableWeeks() {
      try {
        const allWeeks = new Set();

        // Charger du localStorage
        const localMenus = JSON.parse(localStorage.getItem('menus_local') || '[]');
        localMenus.forEach(m => allWeeks.add(m.week_number));

        // Charger de Supabase
        const { supabase } = await import('./lib/supabase');
        const { data, error } = await supabase.from("meals").select("meal_date").order("meal_date", { ascending: false });
        
        if (!error && data && data.length > 0) {
          data.forEach(item => {
            const d = new Date(item.meal_date);
            const year = d.getFullYear();
            const jan1 = new Date(year, 0, 1);
            const days = Math.floor((d - jan1) / (24 * 60 * 60 * 1000));
            const weekNum = Math.ceil((days + jan1.getDay() + 1) / 7);
            allWeeks.add(weekNum);
          });
        }

        // Convertir Set en array et trier
        const weeks = Array.from(allWeeks).sort((a, b) => b - a);
        setAvailableWeeks(weeks);
      } catch {
        setAvailableWeeks([]);
      }
    }
    loadAvailableWeeks();
  }, []);

  // Charger le menu initial
  React.useEffect(() => {
    setLoading(true);
    // Vérifie d'abord le localStorage
    const localMenu = LocalMenuService.getMenuByWeek(currentYear, currentWeekNumber);
    if (localMenu && localMenu.days && localMenu.days.length > 0) {
      // Filtrer pour afficher uniquement Lundi-Vendredi
      const filtered = filterWeekdays({
        meals: localMenu.meals,
        days: localMenu.days,
        data: localMenu.data
      });
      setMenuData(filtered);
      setLoading(false);
      return;
    }
    // Sinon, utilise Supabase
    (async function fetchMenu() {
      if (!currentYear || !currentWeekNumber) return;
      const monday = (y, w) => {
        const d = new Date(y, 0, 1 + (w - 1) * 7);
        const day = d.getDay();
        const mondayOffset = day <= 4 ? day - 1 : day - 8;
        d.setDate(d.getDate() - mondayOffset);
        return d;
      };
      const start = monday(currentYear, currentWeekNumber);
      const weekDates = Array.from({ length: 5 }, (_, i) => {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        return date.toISOString().slice(0, 10);
      });
      
      const { supabase } = await import('./lib/supabase');
      console.log('📅 Chargement menu Supabase pour dates:', weekDates);
      
      const { data, error } = await supabase
        .from('meals')
        .select(`
          id,
          meal_date,
          meal_type,
          meals_dishes (
            dish_id,
            position,
            dishes (
              id,
              name,
              description,
              dish_type
            )
          )
        `)
        .in('meal_date', weekDates);
      if (error) {
        setMenuData(null);
      } else {
        // IMPORTANT: Normaliser les données Supabase AVANT de filtrer
        const normalized = normalizeMenu(data || [], currentWeekNumber);
        // Filtrer pour afficher uniquement Lundi-Vendredi
        const filtered = filterWeekdays(normalized);
        setMenuData(filtered);
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
  // ...

  // ...navigate déjà déclaré plus haut...
  return (
    <main className="container">
      <PageLayout 
        title="Cafétéria ORIF"
      >
        {/* Bouton déroulant pour choisir une autre semaine */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <select
            value={selectedWeek}
            onChange={e => {
              setSelectedWeek(e.target.value);
              if (e.target.value) navigate(`/week/${e.target.value}`);
            }}
            className="button-select"
            style={{ padding: '0.5rem 1.2rem', borderRadius: '6px', fontWeight: 'bold', minWidth: '120px', border: '1px solid #ccc', background: '#d0d0d0', color: '#333', cursor: 'pointer', fontSize: '1em' }}
          >
            <option value="">Menu d'autre semaine disponible</option>
            {availableWeeks.map(week => (
              <option key={week} value={week}>{`Semaine ${week}`}</option>
            ))}
          </select>
          {/* Agenda pour choisir un jour */}
          <div className="date-picker">
            <AntDatePicker
              value={selectedDate}
              onChange={date => {
                if (date) {
                  setSelectedDate(date);
                  const formattedDate = date.format('YYYY-MM-DD');
                  navigate(`/date/${formattedDate}`);
                }
              }}
              placeholder="Chercher un jour"
              format="DD/MM/YYYY"
              style={{ padding: '0.5rem 1.2rem', borderRadius: 6, fontWeight: 'bold', minWidth: 120 }}
            />
          </div>
        </div>
        <h2 className="menu-title" style={{textAlign: 'center', marginBottom: '1.5rem'}}>
          {`Menu la semaine N° ${currentWeekNumber} du ${formatDate(startDate)} au ${formatDate(endDate)}`}
        </h2>
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
          <Route path="/auth/callback" element={<AuthCallback />} />
          {/* Route debug pour diagnostiquer les erreurs d'authentification */}
          <Route path="/debug" element={<AuthCallbackDebug />} />
          {/* Route pour afficher le menu d'une semaine spécifique */}
          <Route path="/week/:weekNumber" element={<WeekMenuPage />} />
          {/* Route pour la version alternative du menu de la semaine */}
          <Route path="/week2/:weekNumber" element={<WeekMenuPage2 />} />
          {/* Route pour l'importation locale robuste */}
          <Route path="/import-local" element={<ImportLocalMenuPage />} />
          {/* Route pour la démonstration des styles d'affichage */}
          <Route path="/styles" element={<StyleDemo />} />
          {/* Route pour la démonstration des émojis */}
          <Route path="/emoji-demo" element={<EmojiDemo />} />
          {/* Route pour afficher le menu d'une date spécifique */}
          <Route path="/date/:date" element={<DateMenuPage />} />
          
          {/* ROUTES ADMIN PROTÉGÉES - Authentification requise */}
          {/* Route pour la page d'administration */}
          <Route path="/admin" element={<ProtectedRoute element={<AdminPage />} />} />
          {/* Route pour l'import de menus Excel */}
          <Route path="/admin/import" element={<ProtectedRoute element={<ImportMenuPage />} />} />
          {/* Route pour éditer le menu d'une semaine */}
          <Route path="/admin/week/:weekNumber" element={<ProtectedRoute element={<WeekEditor />} />} />
          {/* Route pour éditer le menu d'une date */}
          <Route path="/admin/date/:date" element={<ProtectedRoute element={<DateEditor />} />} />
          
          {/* Route catch-all pour toutes les URLs non définies */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

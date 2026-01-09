import React from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { DatePicker as AntDatePicker, ConfigProvider } from "antd";
import fr_FR from "antd/locale/fr_FR";
import { getCurrentYear, getCurrentWeekNumber } from "./utils/dateUtils";
import PageLayout from "./components/PageLayout";
import ApiService from "./services/ApiService";
import MenuTable from "./components/MenuTable";
import Footer from "./components/Footer";
import { JwtAuthProvider } from "./contexts/JwtAuthContext";
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
import UsersPage from './pages/UsersPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import "./styles.css";

function HomePage() {
  const [selectedWeek, setSelectedWeek] = React.useState("");
  const [selectedDate, setSelectedDate] = React.useState(null);
  const [menuData, setMenuData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [availableWeeks, setAvailableWeeks] = React.useState([]);
  const navigate = useNavigate();
  
  const currentYear = getCurrentYear();
  const currentWeekNumber = getCurrentWeekNumber();

  React.useEffect(() => {
    async function loadAvailableWeeks() {
      try {
        const allMenus = await ApiService.getAllMenus();
        const weeks = allMenus.map(m => m.weekNum).sort((a, b) => b - a);
        setAvailableWeeks(weeks);
      } catch {
        setAvailableWeeks([]);
      }
    }
    loadAvailableWeeks();
  }, []);

  React.useEffect(() => {
    setLoading(true);
    (async function fetchMenu() {
      if (!currentYear || !currentWeekNumber) return;
      
      try {
        const meals = await ApiService.getMenuByWeek(currentYear, currentWeekNumber);
        
        if (meals && meals.length > 0) {
          const mealsWithDishes = meals.map(meal => ({
            ...meal,
            meals_dishes: meal.dishes ? meal.dishes.map(d => ({
              dish_id: d.id,
              dishes: d
            })) : []
          }));
          const normalized = normalizeMenu(mealsWithDishes, currentWeekNumber);
          const filtered = filterWeekdays(normalized);
          setMenuData(filtered);
        } else {
          setMenuData(null);
        }
      } catch (error) {
        console.error('Erreur chargement menu:', error);
        setMenuData(null);
      }
      
      setLoading(false);
    })();
  }, [currentYear, currentWeekNumber]);

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

  return (
    <main className="container">
      <PageLayout 
        title="Cafeteria ORIF"
      >
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <select
            value={selectedWeek}
            onChange={e => {
              setSelectedWeek(e.target.value);
              if (e.target.value) navigate(`/week/${e.target.value}`);
            }}
            className="button-select"
            style={{ padding: '0.5rem 1.2rem', borderRadius: '6px', fontWeight: 'bold', minWidth: '120px', border: '2px solid #999', background: '#d0d0d0', color: '#333', cursor: 'pointer', fontSize: '1em' }}
          >
            <option value="">Menu d'autre semaine disponible</option>
            {availableWeeks.map(week => (
              <option key={week} value={week}>{`Semaine ${week}`}</option>
            ))}
          </select>
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
              locale={fr_FR}
            />
          </div>
        </div>
        <h2 className="menu-title" style={{textAlign: 'center', marginBottom: '1.5rem'}}>
          {`Menu la semaine N ${currentWeekNumber} du ${formatDate(startDate)} au ${formatDate(endDate)}`}
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

export default function App() {
  return (
    <ConfigProvider locale={fr_FR}>
      <JwtAuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/debug" element={<AuthCallbackDebug />} />
            <Route path="/week/:weekNumber" element={<WeekMenuPage />} />
            <Route path="/week2/:weekNumber" element={<WeekMenuPage2 />} />
            <Route path="/import-local" element={<ImportLocalMenuPage />} />
            <Route path="/styles" element={<StyleDemo />} />
            <Route path="/emoji-demo" element={<EmojiDemo />} />
            <Route path="/date/:date" element={<DateMenuPage />} />
            
            <Route path="/admin" element={<ProtectedRoute element={<AdminPage />} />} />
            <Route path="/admin/import" element={<ProtectedRoute element={<ImportMenuPage />} />} />
            <Route path="/admin/week/:weekNumber" element={<ProtectedRoute element={<WeekEditor />} />} />
            <Route path="/admin/date/:date" element={<ProtectedRoute element={<DateEditor />} />} />
            <Route path="/admin/users" element={<ProtectedRoute element={<UsersPage />} requireAdmin={true} />} />
            
            <Route path="*" element={<HomePage />} />
          </Routes>
        </BrowserRouter>
      </JwtAuthProvider>
    </ConfigProvider>
  );
}

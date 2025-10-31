// Application avec React Router pour la navigation
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useState } from "react";
import { getCurrentYear, getCurrentWeekNumber, getWeekLabel } from "./utils/dateUtils";
import defaultMenu from "./data/defaultMenu";
import MenuTable from "./components/MenuTable";
import HeaderPage from "./components/HeaderPage";
import Footer from "./components/Footer";
import DailyMenu from "./pages/DailyMenu";

// Pages importées
import WeekMenuPage from "./pages/WeekMenuPage";
import DateMenuPage from "./pages/DateMenuPage";
import AdminPage from "./pages/AdminPage";
import WeekEditor from "./pages/CookEditor";
import DateEditor from "./pages/DateEditor";
import "./styles.css";

// Page d'accueil améliorée
function HomePage() {
  const navigate = useNavigate();
  const [showDailyMenu, setShowDailyMenu] = useState(false);
  const currentYear = getCurrentYear();
  const currentWeekNumber = getCurrentWeekNumber();
  const weekLabel = getWeekLabel(currentYear, currentWeekNumber);

  const currentWeekMenu = {
    ...defaultMenu,
    weekLabel: weekLabel
  };

  return (
    <main className="container">
      <HeaderPage weekLabel={currentWeekMenu.weekLabel} />
      
      <div style={{ marginBottom: "20px", textAlign: "center" }}>
        <button onClick={() => setShowDailyMenu(!showDailyMenu)}>
          {showDailyMenu ? "📅 Voir menu semaine" : "📆 Voir menu du jour"}
        </button>
        <button 
          onClick={() => navigate(`/date/${new Date().toISOString().split('T')[0]}`)}
          style={{ marginLeft: '10px' }}
        >
          📆 Menu d'une date
        </button>
        <button 
          onClick={() => navigate(`/week/${currentWeekNumber}`)}
          style={{ marginLeft: '10px' }}
        >
          📅 Menu d'une semaine
        </button>
        <button 
          onClick={() => navigate('/admin')} 
          style={{ marginLeft: '10px' }}
        >
          ⚙️ Administration
        </button>
      </div>

      {showDailyMenu ? <DailyMenu /> : <MenuTable menu={currentWeekMenu} />}
      
      <Footer />
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/week/:weekNumber" element={<WeekMenuPage />} />
        <Route path="/date/:date" element={<DateMenuPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/week/:weekNumber" element={<WeekEditor />} />
        <Route path="/admin/date/:date" element={<DateEditor />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

// Fichier principal de l'application React avec système de navigation
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { getCurrentYear, getCurrentWeekNumber, getWeekLabel } from "./utils/dateUtils";
import defaultMenu from "./data/defaultMenu";
import PageLayout from "./components/PageLayout";
import MenuTable from "./components/MenuTable";
import Footer from "./components/Footer";
import DailyMenu from "./pages/DailyMenu";
import WeekMenuPage from "./pages/WeekMenuPage";
import DateMenuPage from "./pages/DateMenuPage";
import AdminPage from "./pages/AdminPage";
import WeekEditor from "./pages/CookEditor";
import DateEditor from "./pages/DateEditor";
import "./styles.css";

/**
 * HomePage - Page d'accueil
 * Gère son propre état de vue (jour/semaine)
 */
function HomePage() {
  const [showDailyMenu, setShowDailyMenu] = useState(false);
  const currentYear = getCurrentYear();
  const currentWeekNumber = getCurrentWeekNumber();
  const weekLabel = getWeekLabel(currentYear, currentWeekNumber);
  const currentWeekMenu = { ...defaultMenu, weekLabel };

  return (
    <main className="container">
      <PageLayout 
        title="Cafétéria ORIF"
        actions={
          <button 
            className="toggle-view-btn"
            onClick={() => setShowDailyMenu(!showDailyMenu)}
            title={showDailyMenu ? "Voir le menu de la semaine" : "Voir le menu du jour"}
          >
            {showDailyMenu ? "📅 Menu semaine" : "📆 Menu du jour"}
          </button>
        }
      >
        {showDailyMenu ? <DailyMenu /> : <MenuTable menu={currentWeekMenu} />}
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
    // BrowserRouter active le système de navigation basé sur l'URL
    <BrowserRouter>
      {/* Routes définit toutes les routes possibles de l'application */}
      <Routes>
        {/* Route pour la page d'accueil (/) */}
        <Route path="/" element={<HomePage />} />
        {/* Route pour afficher le menu d'une semaine spécifique */}
        {/* :weekNumber est un paramètre dynamique (ex: /week/44) */}
        <Route path="/week/:weekNumber" element={<WeekMenuPage />} />
        {/* Route pour afficher le menu d'une date spécifique */}
        {/* :date est un paramètre dynamique (ex: /date/2025-11-05) */}
        <Route path="/date/:date" element={<DateMenuPage />} />
        {/* Route pour la page d'administration */}
        <Route path="/admin" element={<AdminPage />} />
        {/* Route pour éditer le menu d'une semaine */}
        <Route path="/admin/week/:weekNumber" element={<WeekEditor />} />
        {/* Route pour éditer le menu d'une date */}
        <Route path="/admin/date/:date" element={<DateEditor />} />
        {/* Route catch-all pour toutes les URLs non définies */}
        {/* Redirige vers la page d'accueil */}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

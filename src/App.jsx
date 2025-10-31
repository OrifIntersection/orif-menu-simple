// Application avec React Router pour la navigation
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from "react";
import defaultMenu from "./data/defaultMenu";
import MenuTable from "./components/MenuTable";
import HeaderPage from "./components/HeaderPage";
import Footer from "./components/Footer";
import DailyMenu from "./pages/DailyMenu";
import "./styles.css";

// Page d'accueil
function HomePage() {
  const [showDailyMenu, setShowDailyMenu] = useState(false);

  return (
    <main className="container">
      <HeaderPage weekLabel={defaultMenu.weekLabel} />
      
      <div style={{ marginBottom: "20px", textAlign: "center" }}>
        <button onClick={() => setShowDailyMenu(!showDailyMenu)}>
          {showDailyMenu ? "📅 Voir menu semaine" : "📆 Voir menu du jour"}
        </button>
      </div>

      {showDailyMenu ? <DailyMenu /> : <MenuTable menu={defaultMenu} />}
      
      <Footer />
    </main>
  );
}

// Page pour une semaine spécifique
function WeekMenuPage() {
  return (
    <main className="container">
      <HeaderPage weekLabel="Menu de la semaine" />
      <MenuTable menu={defaultMenu} />
      <Footer />
    </main>
  );
}

// Page pour une date spécifique
function DateMenuPage() {
  return (
    <main className="container">
      <HeaderPage weekLabel="Menu du jour" />
      <DailyMenu />
      <Footer />
    </main>
  );
}

// Page d'administration
function AdminPage() {
  return (
    <main className="container">
      <HeaderPage weekLabel="Administration" />
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Administration du menu</h2>
        <p>Fonctionnalités à venir...</p>
      </div>
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
        <Route path="/admin/week/:weekNumber" element={<AdminPage />} />
        <Route path="/admin/date/:date" element={<AdminPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

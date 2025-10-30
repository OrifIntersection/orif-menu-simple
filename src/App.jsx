// Niveau 1 : Affichage simple du menu avec navigation basique
import { useState } from "react";
import defaultMenu from "./data/defaultMenu";
import MenuTable from "./components/MenuTable";
import HeaderPage from "./components/HeaderPage";
import Footer from "./components/Footer";
import DailyMenu from "./pages/DailyMenu";
import "./styles.css";

export default function App() {
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

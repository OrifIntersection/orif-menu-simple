// Page qui affiche uniquement le menu du jour en cours
// ...existing code...
import React from "react";
import PageLayout from "../components/PageLayout";
import HeaderTable from "../components/HeaderTable";
import SiderTable from "../components/SiderTable";
import { LocalMenuService } from "../services/LocalMenuService";
import { getISOWeek, format } from "date-fns";

export default function DailyMenu() {
  // Jours en français, semaine commençant par Lundi
  const jours = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
  const today = new Date();
  const jsDay = today.getDay();
  const jourIndex = jsDay === 0 ? 6 : jsDay - 1;
  const jourActuel = jours[jourIndex];
  const currentYear = today.getFullYear();
  const weekNum = getISOWeek(today);
  const dateStr = format(today, 'yyyy-MM-dd');
  const menu = LocalMenuService.getMenuByWeek(currentYear, weekNum);

  // On crée un menu du jour à partir du menu de la semaine
  let menuDuJour = null;
  if (menu && menu.days && menu.days.includes(jourActuel)) {
    menuDuJour = {
      ...menu,
      days: [jourActuel],
      // On filtre les données pour ne garder que le jour actuel
      data: Object.fromEntries(Object.entries(menu.data).filter(([day]) => day === jourActuel)),
    };
  }

  return (
    <main className="container">
      <PageLayout title={`Menu du ${jourActuel} ${dateStr}`}>
        <div className="daily-menu-view">
          <div className="table-header">
            <h3 className="table-caption">Menu du {jourActuel} {dateStr}</h3>
          </div>
          {menuDuJour ? (
            <div style={{ marginBottom: "2rem" }}>
              <h4>Menu local importé</h4>
              <table>
                <MenuTable menu={menuDuJour} />
              </table>
            </div>
          ) : (
            <div style={{textAlign: "center", color: "#d32f2f", fontWeight: "bold", margin: "2rem 0"}}>
              Aucun menu disponible pour aujourd'hui.<br />Vérifiez l'importation ou le format du fichier.<br />({jourActuel} {dateStr})
            </div>
          )}
        </div>
      </PageLayout>
    </main>
  );
}
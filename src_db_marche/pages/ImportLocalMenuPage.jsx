import React, { useState } from "react";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import ExcelImportMenu from "../components/ExcelImportMenu";
import { LocalMenuService } from "../services/LocalMenuService";

export default function ImportLocalMenuPage() {
  const navigate = useNavigate();
  const [pendingMenus, setPendingMenus] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // Prépare les menus à importer et demande confirmation
  const handleImportFromExcel = (rows) => {
    const semaines = {};
    const joursSemaine = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
    const moments = ["Midi", "Soir"];
    rows.forEach((row) => {
      const semaine = row.Semaine;
      if (!semaines[semaine]) {
        semaines[semaine] = [];
      }
      semaines[semaine].push(row);
    });
    let erreur = "";
    const menusToImport = [];
    Object.entries(semaines).forEach(([week, menus]) => {
      if (!week || !menus || menus.length === 0) {
        erreur += `Semaine ${week}: Aucun plat importé.\n`;
        return;
      }
      const days = joursSemaine;
      const meals = moments;
      const data = {};
      meals.forEach((meal) => {
        data[meal] = {};
        days.forEach((day) => {
          const plats = menus
            .filter((m) => m.Jour === day && m.Moment === meal)
            .map((m) => m.Plat)
            .filter(Boolean);
          data[meal][day] = plats.length > 0 ? plats.join(" / ") : "";
        });
      });
      const platsSemaine = Object.values(data)
        .flatMap((obj) => Object.values(obj))
        .filter(Boolean);
      if (platsSemaine.length === 0) {
        erreur += `Semaine ${week}: Aucun plat importé.\n`;
        return;
      }
      menusToImport.push({
        year: Number(week.split("-")[0]),
        week_number: Number(week.split("-")[1]),
        week_label: week,
        days,
        meals,
        data,
      });
    });
    if (erreur) {
      alert("Erreurs d'import :\n" + erreur);
    }
    if (menusToImport.length > 0) {
      setPendingMenus(menusToImport);
      setShowConfirm(true);
    }
  };

  // Confirme et enregistre les menus
  const confirmImport = () => {
    if (pendingMenus && pendingMenus.length > 0) {
      let success = true;
      pendingMenus.forEach((menu) => {
        LocalMenuService.saveMenu(menu);
        // Vérification immédiate
        const saved = LocalMenuService.getMenuByWeek(menu.year, menu.week_number);
        if (!saved) success = false;
      });
      setPendingMenus(null);
      setShowConfirm(false);
      if (success) {
        alert("Import terminé avec succès !");
        navigate("/test-local-menu");
      } else {
        alert("Erreur : l'importation n'a pas été enregistrée correctement.");
      }
    }
  };

  // Annule l'import
  const cancelImport = () => {
    setPendingMenus(null);
    setShowConfirm(false);
  };

  function downloadExample() {
    // Utilise SheetJS pour générer un vrai fichier Excel
    const data = [
      ["Semaine", "Jour", "Moment", "Plat"],
      ["2025-49", "Lundi", "Midi", "Émincé de poulet"],
      ["2025-49", "Lundi", "Soir", "Lasagnes végétariennes"],
      ["2025-49", "Mardi", "Midi", "Curry de légumes"],
      ["2025-49", "Mardi", "Soir", "Poisson pané"],
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Menus");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "exemple_menu.xlsx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <h2>Import Excel en local</h2>
      <button
        onClick={downloadExample}
        style={{
          marginBottom: "1rem",
          background: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          padding: "0.5rem 1rem",
          cursor: "pointer",
        }}
      >
        Télécharger un exemple Excel
      </button>
      <ExcelImportMenu onImport={handleImportFromExcel} multiWeek={true} />
      {showConfirm && pendingMenus && (
        <div
          style={{
            background: "#fffbe6",
            border: "2px solid #ffe58f",
            borderRadius: 8,
            padding: "1.5rem",
            marginTop: "2rem",
            textAlign: "center",
          }}
        >
          <h3 style={{ color: "#d48806" }}>Confirmer l'import</h3>
          <p>Menus à importer: <b>{pendingMenus.length}</b> semaine{pendingMenus.length > 1 ? 's' : ''}</p>
          <ul
            style={{
              textAlign: "left",
              margin: "1rem auto",
              maxWidth: 400,
            }}
          >
            {pendingMenus.map((menu) => (
              <li key={menu.week_label}>
                <b>{menu.week_label}</b> ({menu.days.join(", ")})
              </li>
            ))}
          </ul>
          <button
            onClick={confirmImport}
            style={{
              marginRight: 16,
              background: "#52c41a",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "0.5rem 1rem",
              cursor: "pointer",
            }}
          >
            Confirmer
          </button>
          <button
            onClick={cancelImport}
            style={{
              background: "#d32f2f",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "0.5rem 1rem",
              cursor: "pointer",
            }}
          >
            Annuler
          </button>
        </div>
      )}
    </div>
  );
}

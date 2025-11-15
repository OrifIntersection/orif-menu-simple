import React, { useState } from "react";
import { useAuth } from '../hooks/useAuth';
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import ExcelImportMenu from "../components/ExcelImportMenu";
import { LocalMenuService } from "../services/LocalMenuService";

export default function ImportLocalMenuPage() {
  const { isAuthenticated, userRole, loading } = useAuth();
  // Protection accès admin
  const navigate = useNavigate();
  const [pendingMenus, setPendingMenus] = useState(null);
  if (loading) {
    return <div>Chargement de l'authentification...</div>;
  }
  if (!isAuthenticated || userRole !== 'admin') {
    return (
      <div style={{ maxWidth: 500, margin: '3rem auto', background: '#fff3cd', color: '#856404', padding: '2rem', borderRadius: 12, textAlign: 'center', fontWeight: 'bold' }}>
        Accès réservé aux administrateurs.<br />
        Veuillez vous connecter avec un compte administrateur pour importer des menus.
      </div>
    );
  }

  // Réinitialiser l'import et le formulaire
  const handleReset = () => {
    setPendingMenus(null);
    window.location.reload();
  };

  // Prépare les menus à importer et demande confirmation
  const handleImportFromExcel = (week, menus) => {
    if (!week || !menus || menus.length === 0) {
      alert("Aucun plat importé. Vérifiez le fichier Excel.");
      return;
    }
    const joursSemaine = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
    const moments = ["Midi", "Soir"];
    const data = {};
    moments.forEach((meal) => {
      data[meal] = {};
      joursSemaine.forEach((day) => {
        const plats = menus
          .filter((m) => m.jour === day && m.moment === meal)
          .map((m) => m.plat)
          .filter(Boolean);
        data[meal][day] = plats.length > 0 ? plats.join(" / ") : "";
      });
    });
    const platsSemaine = Object.values(data)
      .flatMap((obj) => Object.values(obj))
      .filter(Boolean);
    if (platsSemaine.length === 0) {
      alert(`Semaine ${week}: Aucun plat importé.`);
      return;
    }
    const menuToImport = {
      year: Number(week.split("-")[0]),
      week_number: Number(week.split("-")[1]),
      week_label: week,
      days: joursSemaine,
      meals: moments,
      data,
    };
    setPendingMenus([menuToImport]);
  };

  // Enregistre les menus dans le LocalStorage
  const handleConfirmImport = () => {
    if (!pendingMenus || pendingMenus.length === 0) {
      alert("Aucun menu à importer. Veuillez d'abord importer un fichier Excel.");
      return;
    }
    // Enregistre chaque menu individuellement
    pendingMenus.forEach(menu => {
      if (menu && menu.year && menu.week_number) {
        LocalMenuService.saveMenu(menu);
      }
    });
    setPendingMenus(null);
    // Navigue vers la semaine importée
    if (pendingMenus[0] && pendingMenus[0].week_label) {
      navigate("/week/" + pendingMenus[0].week_label);
    } else {
      alert("Importation réussie, mais impossible de naviguer vers la semaine (donnée manquante).");
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", padding: "2rem", background: "white", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
      <h2 style={{ color: "#007bff" }}>Importer des menus Excel (local)</h2>
      <ExcelImportMenu onImport={handleImportFromExcel} />
      {pendingMenus && (
        <div style={{ marginTop: "2rem", background: "#f8f9fa", padding: "1rem", borderRadius: 8 }}>
          <h4>Menus à importer :</h4>
          {pendingMenus.map((menu, idx) => (
            <div key={idx} style={{ marginBottom: '1rem' }}>
              <strong>Semaine {menu.week_label}</strong>
              <table style={{ width: '100%', marginTop: '0.5rem', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                <thead>
                  <tr style={{ background: '#e9ecef' }}>
                    <th style={{ padding: '0.3rem', border: '1px solid #dee2e6' }}>Jour</th>
                    {menu.meals.map((meal) => (
                      <th key={meal} style={{ padding: '0.3rem', border: '1px solid #dee2e6' }}>{meal}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {menu.days.map((day) => (
                    <tr key={day}>
                      <td style={{ padding: '0.3rem', border: '1px solid #dee2e6', fontWeight: 'bold' }}>{day}</td>
                      {menu.meals.map((meal) => (
                        <td key={meal} style={{ padding: '0.3rem', border: '1px solid #dee2e6' }}>
                          {menu.data[meal][day] || <span style={{ color: '#dc3545' }}>—</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'center' }}>
        <button
          style={{ background: "#28a745", color: "white", padding: "0.5rem 1.2rem", border: "none", borderRadius: 6, fontWeight: "bold" }}
          onClick={handleConfirmImport}
        >
          Confirmer
        </button>
        <button
          style={{ background: "#6c757d", color: "white", padding: "0.5rem 1.2rem", border: "none", borderRadius: 6, fontWeight: "bold" }}
          onClick={handleReset}
        >
          Recommencer
        </button>
        <button
          style={{ background: "#dc3545", color: "white", padding: "0.5rem 1.2rem", border: "none", borderRadius: 6, fontWeight: "bold" }}
          onClick={() => { setPendingMenus(null); }}
        >
          Annuler
        </button>
      </div>
    </div>
  );
}

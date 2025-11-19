import React, { useState } from "react";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import ExcelImportMenu from "../components/ExcelImportMenu";
import { LocalMenuService } from "../services/LocalMenuService";

export default function ImportLocalMenuPage() {
  // Pas de protection d'authentification - mode dégradé gracieux
  const navigate = useNavigate();
  const [pendingMenus, setPendingMenus] = useState(null);

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
    
    // Support pour le nouveau format avec dates
    const hasNewFormat = menus.some(m => m.date);
    
    if (hasNewFormat) {
      // Nouveau format : grouper par date et moment
      const joursSemaine = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
      const moments = ["Midi", "Soir"];
      const data = {};
      
      // Récupère toutes les dates uniques
      const uniqueDates = [...new Set(menus.map(m => m.date?.toISOString().slice(0, 10)).filter(Boolean))].sort();
      
      console.log('📅 Dates uniques trouvées:', uniqueDates);
      
      moments.forEach((meal) => {
        data[meal] = {};
        uniqueDates.forEach((dateStr) => {
          const date = new Date(dateStr);
          const dayName = joursSemaine[date.getDay() === 0 ? 6 : date.getDay() - 1]; // Dimanche = 0 → 6
          
          const plats = menus
            .filter((m) => {
              const mDateStr = m.date?.toISOString().slice(0, 10);
              const momentMatch = m.moment.toLowerCase() === meal.toLowerCase();
              return mDateStr === dateStr && momentMatch;
            })
            .map((m) => `${m.typePlat}: ${m.plat}`)
            .filter(Boolean);
          
          data[meal][dayName] = plats.length > 0 ? plats.join(" / ") : "";
          
          console.log(`${dayName} ${meal}: ${plats.length} plats`);
        });
      });
      
      console.log('📦 Structure de données créée:', data);
      
      const menuToImport = {
        year: Number(week.split("-")[0]),
        week_number: Number(week.split("-")[1]),
        week_label: week,
        days: joursSemaine,
        meals: moments,
        data,
      };
      
      console.log('📋 Menu à importer:', menuToImport);
      setPendingMenus([menuToImport]);
    } else {
      // Ancien format : grouper par jour et moment
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
    }
  };

  // Enregistre les menus dans le LocalStorage
  const handleConfirmImport = () => {
    if (!pendingMenus || pendingMenus.length === 0) {
      alert("Aucun menu à importer. Veuillez d'abord importer un fichier Excel.");
      return;
    }
    
    console.log('💾 Sauvegarde des menus dans le localStorage...', pendingMenus);
    
    // Enregistre chaque menu individuellement
    pendingMenus.forEach(menu => {
      if (menu && menu.year && menu.week_number) {
        console.log(`Sauvegarde menu semaine ${menu.week_number} année ${menu.year}`);
        LocalMenuService.saveMenu(menu);
        console.log('✅ Menu sauvegardé avec succès');
      }
    });
    
    // Vérifier que ça a bien été sauvegardé
    const allMenus = LocalMenuService.getAllMenus();
    console.log('📚 Tous les menus dans localStorage:', allMenus);
    
    // Navigue vers la semaine importée
    if (pendingMenus[0] && pendingMenus[0].week_number) {
      const weekNum = pendingMenus[0].week_number;
      alert(`Menu de la semaine ${weekNum} importé avec succès ! Redirection...`);
      navigate("/week/" + weekNum);
    } else {
      alert("Importation réussie !");
      navigate("/");
    }
    
    setPendingMenus(null);
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

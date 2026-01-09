import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ExcelImportMenu from "../components/ExcelImportMenu";
import ApiService from "../services/ApiService";

export default function ImportLocalMenuPage() {
  const navigate = useNavigate();
  const [pendingMenus, setPendingMenus] = useState(null);
  const [importing, setImporting] = useState(false);

  const handleReset = () => {
    setPendingMenus(null);
    window.location.reload();
  };

  const handleImportFromExcel = (week, menus) => {
    if (!week || !menus || menus.length === 0) {
      alert("Aucun plat importe. Verifiez le fichier Excel.");
      return;
    }
    
    const hasNewFormat = menus.some(m => m.date);
    
    if (hasNewFormat) {
      const joursSemaine = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
      const moments = ["Midi", "Soir"];
      const data = {};
      
      const formatDateLocal = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      const uniqueDates = [...new Set(menus.map(m => m.date ? formatDateLocal(m.date) : null).filter(Boolean))].sort();
      
      moments.forEach((meal) => {
        data[meal] = {};
        uniqueDates.forEach((dateStr) => {
          const [year, month, day] = dateStr.split('-').map(Number);
          const date = new Date(year, month - 1, day, 12, 0, 0);
          const dayIndex = date.getDay();
          const dayName = joursSemaine[dayIndex === 0 ? 6 : dayIndex - 1];
          
          const plats = menus
            .filter((m) => {
              if (!m.date) return false;
              const mDateStr = formatDateLocal(m.date);
              const momentMatch = m.moment.toLowerCase() === meal.toLowerCase();
              return mDateStr === dateStr && momentMatch;
            })
            .map((m) => `${m.typePlat}: ${m.plat}`)
            .filter(Boolean);
          
          data[meal][dayName] = plats.length > 0 ? plats.join(" / ") : "";
        });
      });
      
      const menuToImport = {
        year: Number(week.split("-")[0]),
        week_number: Number(week.split("-")[1]),
        week_label: week,
        days: joursSemaine,
        meals: moments,
        data,
        originalMenus: menus
      };
      
      setPendingMenus([menuToImport]);
    } else {
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
        alert(`Semaine ${week}: Aucun plat importe.`);
        return;
      }
      
      const menuToImport = {
        year: Number(week.split("-")[0]),
        week_number: Number(week.split("-")[1]),
        week_label: week,
        days: joursSemaine,
        meals: moments,
        data,
        originalMenus: menus
      };
      setPendingMenus([menuToImport]);
    }
  };

  const handleConfirmImport = async () => {
    if (!pendingMenus || pendingMenus.length === 0) {
      alert("Aucun menu a importer. Veuillez d'abord importer un fichier Excel.");
      return;
    }
    
    setImporting(true);
    
    try {
      for (const menu of pendingMenus) {
        if (menu && menu.year && menu.week_number && menu.originalMenus) {
          for (const item of menu.originalMenus) {
            let dateStr;
            
            if (item.dateStr) {
              const [day, month, year] = item.dateStr.split('.');
              dateStr = `${year}-${month}-${day}`;
            } else if (item.date) {
              const year = item.date.getFullYear();
              const month = String(item.date.getMonth() + 1).padStart(2, '0');
              const day = String(item.date.getDate()).padStart(2, '0');
              dateStr = `${year}-${month}-${day}`;
            } else if (item.jour) {
              const joursSemaine = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
              const dayIndex = joursSemaine.indexOf(item.jour);
              
              if (dayIndex >= 0) {
                const mondayDate = new Date(menu.year, 0, 1 + (menu.week_number - 1) * 7);
                const day = mondayDate.getDay();
                const mondayOffset = day <= 4 ? day - 1 : day - 8;
                mondayDate.setDate(mondayDate.getDate() - mondayOffset + dayIndex);
                
                const year = mondayDate.getFullYear();
                const month = String(mondayDate.getMonth() + 1).padStart(2, '0');
                const date = String(mondayDate.getDate()).padStart(2, '0');
                dateStr = `${year}-${month}-${date}`;
              }
            }
            
            if (dateStr) {
              const mealType = item.moment.toLowerCase() === 'midi' ? 'MIDI' : 'SOIR';
              const dishType = item.typePlat || 'AUTRE';
              
              const dish = await ApiService.getOrCreateDish(item.plat, dishType);
              await ApiService.assignDishToMealByType(dateStr, mealType, dishType, dish.id);
            }
          }
        }
      }
      
      if (pendingMenus[0] && pendingMenus[0].week_number) {
        const weekNum = pendingMenus[0].week_number;
        alert(`Menu de la semaine ${weekNum} importe avec succes ! Redirection...`);
        navigate("/week/" + weekNum);
      } else {
        alert("Importation reussie !");
        navigate("/");
      }
    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      alert('Erreur lors de l\'import: ' + error.message);
    } finally {
      setImporting(false);
      setPendingMenus(null);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", padding: "2rem", background: "white", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
      <h2 style={{ color: "#007bff" }}>Importer des menus Excel</h2>
      <ExcelImportMenu onImport={handleImportFromExcel} />
      {pendingMenus && (
        <div style={{ marginTop: "2rem", background: "#f8f9fa", padding: "1rem", borderRadius: 8 }}>
          <h4>Menus a importer :</h4>
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
                          {menu.data[meal][day] || <span style={{ color: '#dc3545' }}>-</span>}
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
          disabled={importing}
        >
          {importing ? 'Import en cours...' : 'Confirmer'}
        </button>
        <button
          style={{ background: "#6c757d", color: "white", padding: "0.5rem 1.2rem", border: "none", borderRadius: 6, fontWeight: "bold" }}
          onClick={handleReset}
          disabled={importing}
        >
          Recommencer
        </button>
        <button
          style={{ background: "#dc3545", color: "white", padding: "0.5rem 1.2rem", border: "none", borderRadius: 6, fontWeight: "bold" }}
          onClick={() => { setPendingMenus(null); }}
          disabled={importing}
        >
          Annuler
        </button>
      </div>
    </div>
  );
}

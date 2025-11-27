import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Progress, Spin } from 'antd';
import AdminLayout from '../components/AdminLayout';
import ExcelImportMenu from '../components/ExcelImportMenu';
import { MenuService } from '../services/MenuService';
import { LocalMenuService } from '../services/LocalMenuService';

export default function ImportMenuPage() {
  const navigate = useNavigate();
  const [pendingMenus, setPendingMenus] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importMessage, setImportMessage] = useState('');
  const [importProgress, setImportProgress] = useState(0);
  const [totalPlats, setTotalPlats] = useState(0);

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
      
      // Fonction helper pour formater date en YYYY-MM-DD sans problème de timezone
      const formatDateLocal = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      // Récupère toutes les dates uniques
      const uniqueDates = [...new Set(menus.map(m => m.date ? formatDateLocal(m.date) : null).filter(Boolean))].sort();
      
      console.log('📅 Dates uniques trouvées:', uniqueDates);
      
      moments.forEach((meal) => {
        data[meal] = {};
        uniqueDates.forEach((dateStr) => {
          // Parser la date en restant en timezone locale
          const [year, month, day] = dateStr.split('-').map(Number);
          const date = new Date(year, month - 1, day, 12, 0, 0);
          const dayIndex = date.getDay();
          const dayName = joursSemaine[dayIndex === 0 ? 6 : dayIndex - 1];
          
          console.log(`📅 ${dateStr} → jour ${dayIndex} → ${dayName}`);
          
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
          
          console.log(`  ${dayName} ${meal}: ${plats.length} plats`);
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
        originalMenus: menus
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
        originalMenus: menus
      };
      setPendingMenus([menuToImport]);
    }
  };

  // Enregistre les menus dans Supabase avec popup de progression
  const handleConfirmImport = async () => {
    if (!pendingMenus || pendingMenus.length === 0) {
      alert("Aucun menu à importer. Veuillez d'abord importer un fichier Excel.");
      return;
    }
    
    // Calculer le nombre total de plats
    let total = 0;
    for (const menu of pendingMenus) {
      if (menu && menu.originalMenus) {
        total += menu.originalMenus.length;
      }
    }
    
    setIsImporting(true);
    setImportMessage('🚀 Démarrage de l\'import...');
    setImportProgress(0);
    setTotalPlats(total);
    
    try {
      let successPlats = 0;
      let currentIndex = 0;
      
      for (const menu of pendingMenus) {
        if (menu && menu.year && menu.week_number && menu.originalMenus) {
          setImportMessage(`📋 Traitement semaine ${menu.week_number}...`);
          
          for (const item of menu.originalMenus) {
            try {
              currentIndex++;
              setImportMessage(`⏳ Enregistrement : ${item.plat}\n(${currentIndex}/${total})`);
              
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
                
                const dish = await MenuService.getOrCreateDish(item.plat, dishType);
                await MenuService.assignDishToMealByType(dateStr, mealType, dishType, dish.id);
                
                successPlats++;
              }
              
              setImportProgress((currentIndex / total) * 100);
            } catch (error) {
              console.error(`⚠️ Erreur pour ${item.plat}:`, error);
            }
          }
        }
      }
      
      setImportMessage(`✅ Import réussi !\n${successPlats}/${total} plats enregistrés\n\n⏳ Redirection en cours...`);
      setImportProgress(100);
      
      // Redirection après 2 secondes
      setTimeout(() => {
        if (pendingMenus[0] && pendingMenus[0].week_number) {
          navigate("/admin/week/" + pendingMenus[0].week_number);
        } else {
          navigate("/admin");
        }
        setIsImporting(false);
        setPendingMenus(null);
      }, 2000);
    } catch (error) {
      console.error('❌ Erreur lors de l\'import:', error);
      setImportMessage(`❌ Erreur : ${error.message}`);
      setIsImporting(false);
    }
  };

  return (
    <AdminLayout title="Import de menus Excel (Supabase)">
      <div style={{ maxWidth: 600, margin: "2rem auto", padding: "2rem", background: "white", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <h2 style={{ color: "#007bff" }}>Importer des menus Excel (Supabase)</h2>
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

      {/* Modal de progression de l'import */}
      <Modal
        title="📥 Importation en cours..."
        open={isImporting}
        closable={false}
        footer={null}
        centered
        width={400}
        bodyStyle={{ textAlign: 'center', padding: '2rem' }}
      >
        <div style={{ marginBottom: '2rem' }}>
          <Spin size="large" />
        </div>
        
        <div style={{ 
          marginBottom: '1.5rem', 
          fontSize: '1rem',
          whiteSpace: 'pre-line',
          lineHeight: '1.6',
          color: '#333',
          minHeight: '60px'
        }}>
          {importMessage}
        </div>
        
        <Progress 
          percent={Math.round(importProgress)} 
          status={importProgress === 100 ? 'success' : 'active'}
          format={percent => `${percent}%`}
        />
        
        <div style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: '#666' }}>
          {totalPlats > 0 && `Total : ${totalPlats} plats`}
        </div>
      </Modal>
    </AdminLayout>
  );
}

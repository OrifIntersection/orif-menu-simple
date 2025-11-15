import React, { useState, useEffect } from "react";
import { LocalMenuService } from "../services/LocalMenuService";
import PageLayout from "../components/PageLayout";

export default function TestLocalMenu() {
  const [menus, setMenus] = useState(LocalMenuService.getAllMenus());
  const [selectedWeek, setSelectedWeek] = useState(menus.length > 0 ? menus[0].week_label : "");

  // Rafraîchit les menus si le stockage local change (après import)
  useEffect(() => {
    const onStorage = () => {
      setMenus(LocalMenuService.getAllMenus());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Ajoute un bouton pour recharger manuellement si besoin
  const reloadMenus = () => setMenus(LocalMenuService.getAllMenus());

  const menu = menus.find(m => m.week_label === selectedWeek);
  const meals = Array.isArray(menu?.meals) ? menu.meals : [];
  const hasData = menu && Object.values(menu.data || {}).some(mealObj => Object.values(mealObj).some(val => val));

  return (
    <PageLayout title="Menus locaux (aperçu)">
      <div style={{ maxWidth: 700, margin: '2rem auto' }}>
        <button onClick={reloadMenus} style={{marginBottom: '1rem', background: '#007bff', color: '#fff', border: 'none', borderRadius: 6, padding: '0.5rem 1rem', cursor: 'pointer'}}>🔄 Recharger les menus</button>
        {menus.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#d32f2f', fontWeight: 'bold', margin: '2rem 0' }}>
            Aucun menu local enregistré.<br />Importez un menu pour l'afficher ici.
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
              <label htmlFor="week-select" style={{ fontWeight: 'bold', marginRight: 8 }}>Semaine :</label>
              <select
                id="week-select"
                value={selectedWeek}
                onChange={e => setSelectedWeek(e.target.value)}
                style={{ padding: '0.5rem', borderRadius: 6, fontSize: '1rem' }}
              >
                {menus.map(m => (
                  <option key={m.week_label} value={m.week_label}>{m.week_label}</option>
                ))}
              </select>
            </div>
            {menu ? (
              <div style={{ background: '#f8f9fa', margin: '1.5rem 0', padding: '1.5rem', borderRadius: 12, boxShadow: '0 2px 8px #0001' }}>
                <h3 style={{ color: '#007bff', marginBottom: '0.5rem' }}>{menu.week_label}</h3>
                <div style={{ marginBottom: '1rem', color: '#555' }}>Jours : {menu.days?.join(', ')}</div>
                {!hasData ? (
                  <div style={{ color: '#d32f2f', fontWeight: 'bold', margin: '1rem 0' }}>
                    Aucun plat importé pour cette semaine.<br />Vérifiez le fichier Excel ou réimportez.
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
                    <thead>
                      <tr style={{ background: '#e3eafc' }}>
                        <th style={{ padding: '0.5rem', border: '1px solid #dde' }}>Jour</th>
                        {meals.map(meal => (
                          <th key={meal} style={{ padding: '0.5rem', border: '1px solid #dde' }}>{meal}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {menu.days?.map(day => (
                        <tr key={day}>
                          <td style={{ padding: '0.5rem', border: '1px solid #dde', fontWeight: 'bold', background: '#f6f8fa' }}>{day}</td>
                          {meals.map(meal => (
                            <td key={meal} style={{ padding: '0.5rem', border: '1px solid #dde' }}>
                              {menu.data?.[meal]?.[day] || <span style={{ color: '#aaa' }}>—</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ) : (
              <div style={{ color: '#d32f2f', fontWeight: 'bold', margin: '2rem 0', textAlign: 'center' }}>
                Semaine non trouvée.<br />Importez un menu pour cette semaine.
              </div>
            )}
          </>
        )}
      </div>
    </PageLayout>
  );
}

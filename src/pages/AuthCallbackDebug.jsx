import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import MenuTable from '../components/MenuTable';
import MenuCell from '../components/MenuCell';
import ColorLegend from '../components/ColorLegend';
import { LocalMenuService } from '../services/LocalMenuService';
import { getCurrentWeekNumber, getCurrentYear } from '../utils/dateUtils';
import { filterWeekdays, extractDayFromMenu } from '../utils/menuNormalizer';

const AuthCallbackDebug = () => {
  const navigate = useNavigate();
  const [menuSemaine, setMenuSemaine] = useState(null);
  const [menuJour, setMenuJour] = useState(null);
  const [jourActuel, setJourActuel] = useState('Mercredi');
  
  const currentYear = getCurrentYear();
  const currentWeekNumber = getCurrentWeekNumber();

  useEffect(() => {
    // Charger le menu de la semaine
    const menu = LocalMenuService.getMenuByWeek(currentYear, currentWeekNumber);
    if (menu) {
      const filtered = filterWeekdays(menu);
      setMenuSemaine(filtered);
      
      // Extraire un jour pour le menu du jour
      const dayMenu = extractDayFromMenu(menu, jourActuel);
      setMenuJour(dayMenu);
    }
  }, [currentYear, currentWeekNumber, jourActuel]);

  const hasMenuSemaine = menuSemaine && menuSemaine.days && menuSemaine.days.length > 0;
  const hasMenuJour = menuJour && menuJour.data && Object.keys(menuJour.data).length > 0;
  const meals = menuJour?.meals || ['Midi', 'Soir'];

  return (
    <main className="container">
      <PageLayout title="🔧 Page de Debug - Tous les outils">
        
        {/* Section Navigation */}
        <div style={{ background: '#e3f2fd', padding: '1.5rem', borderRadius: 8, marginBottom: '2rem' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#1976d2' }}>🧭 Navigation rapide</h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button 
              onClick={() => navigate('/')} 
              style={{ padding: '0.75rem 1.5rem', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold' }}
            >
              🏠 Menu de la semaine actuelle
            </button>
            <button 
              onClick={() => navigate('/week-local')} 
              style={{ padding: '0.75rem 1.5rem', background: '#388e3c', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold' }}
            >
              📋 Menu local (localStorage)
            </button>
            <button 
              onClick={() => navigate('/import-local')} 
              style={{ padding: '0.75rem 1.5rem', background: '#f57c00', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold' }}
            >
              📤 Importation locale
            </button>
          </div>
        </div>

        {/* Section Styles & Emojis */}
        <div style={{ background: '#f3e5f5', padding: '1.5rem', borderRadius: 8, marginBottom: '2rem' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#7b1fa2' }}>🎨 Styles & Emojis</h3>
          <ColorLegend />
          <div style={{ marginTop: '1rem', padding: '1rem', background: '#fff', borderRadius: 6 }}>
            <strong>Exemples de styles de plats :</strong>
            <div style={{ marginTop: '0.5rem' }}>
              🥗 Entrée : Salade verte / 🍽️ Plat : Poulet rôti / 🥔 Garniture : Riz / 🥬 Légume : Brocoli / 🍰 Dessert : Tarte / ✨ Autre : Pain
            </div>
          </div>
        </div>

        {/* Section Menu de la Semaine */}
        <div style={{ background: '#e8f5e9', padding: '1.5rem', borderRadius: 8, marginBottom: '2rem' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#2e7d32' }}>📅 Menu de la Semaine N° {currentWeekNumber} ({currentYear})</h3>
          
          {hasMenuSemaine ? (
            <>
              <MenuTable menu={menuSemaine} />
              
              {/* DEBUG Menu Semaine */}
              <div style={{ background: '#fff3cd', color: '#856404', padding: '1rem', borderRadius: 8, marginTop: '1rem', fontSize: '0.95rem' }}>
                <strong>DEBUG - Menu de la semaine</strong><br />
                <div>Semaine : {currentWeekNumber} / {currentYear}</div>
                <div>menuSemaine.days : {JSON.stringify(menuSemaine?.days || [])}</div>
                <div>menuSemaine : <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: '0.9rem', background: '#f8f9fa', padding: '0.5rem', borderRadius: 4, maxHeight: '300px', overflow: 'auto' }}>{JSON.stringify(menuSemaine, null, 2)}</pre></div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', color: '#d32f2f', fontWeight: 'bold', padding: '2rem' }}>
              Aucun menu de la semaine disponible.<br />
              <a href="/import-local" style={{ color: '#007bff', textDecoration: 'underline' }}>Importer un menu</a>
            </div>
          )}
        </div>

        {/* Section Menu du Jour */}
        <div style={{ background: '#fff3e0', padding: '1.5rem', borderRadius: 8, marginBottom: '2rem' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#e65100' }}>📆 Menu du Jour : {jourActuel}</h3>
          
          {/* Sélection du jour */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontWeight: 'bold', marginRight: '0.5rem' }}>Choisir un jour :</label>
            <select 
              value={jourActuel} 
              onChange={(e) => setJourActuel(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }}
            >
              <option value="Lundi">Lundi</option>
              <option value="Mardi">Mardi</option>
              <option value="Mercredi">Mercredi</option>
              <option value="Jeudi">Jeudi</option>
              <option value="Vendredi">Vendredi</option>
            </select>
          </div>

          {hasMenuJour ? (
            <>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th className="corner-cell"></th>
                      <th>{jourActuel}</th>
                      <th className="corner-cell"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {meals.map((meal) => {
                      const cellClass = `cell-jour-${jourActuel.toLowerCase()} cell-repas-${meal.toLowerCase()}`;
                      const value = (menuJour.data[meal] && menuJour.data[meal][jourActuel]) || "";
                      const lines = Array.isArray(value) ? value : [value];
                      
                      return (
                        <tr key={meal}>
                          <th className="meal-label">{meal}</th>
                          <MenuCell lines={lines} className={cellClass} />
                          <th className="meal-label meal-label-right">{meal}</th>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th className="corner-cell"></th>
                      <th>{jourActuel}</th>
                      <th className="corner-cell"></th>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <ColorLegend />
              
              {/* DEBUG Menu du Jour */}
              <div style={{ background: '#fff3cd', color: '#856404', padding: '1rem', borderRadius: 8, marginTop: '1rem', fontSize: '0.95rem' }}>
                <strong>DEBUG - Menu du jour</strong><br />
                <div>Jour sélectionné : {jourActuel}</div>
                <div>menuJour.days : {JSON.stringify(menuJour?.days || [])}</div>
                <div>menuJour : <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: '0.9rem', background: '#f8f9fa', padding: '0.5rem', borderRadius: 4, maxHeight: '300px', overflow: 'auto' }}>{JSON.stringify(menuJour, null, 2)}</pre></div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', color: '#d32f2f', fontWeight: 'bold', padding: '2rem' }}>
              Aucun menu disponible pour {jourActuel}.<br />
              <a href="/import-local" style={{ color: '#007bff', textDecoration: 'underline' }}>Importer un menu</a>
            </div>
          )}
        </div>

        {/* Section localStorage Debug */}
        <div style={{ background: '#fce4ec', padding: '1.5rem', borderRadius: 8, marginBottom: '2rem' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#c2185b' }}>💾 Debug localStorage</h3>
          <button 
            onClick={() => {
              const data = localStorage.getItem('menus_local');
              alert('Contenu du localStorage menus_local:\n\n' + (data || 'Vide'));
            }} 
            style={{ padding: '0.75rem 1.5rem', background: '#c2185b', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold' }}
          >
            📋 Afficher le localStorage complet
          </button>
          
          <div style={{ marginTop: '1rem', padding: '1rem', background: '#fff', borderRadius: 6, fontSize: '0.9rem' }}>
            <strong>Informations :</strong>
            <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
              <li>Année actuelle : {currentYear}</li>
              <li>Semaine actuelle : {currentWeekNumber}</li>
              <li>Total menus en localStorage : {LocalMenuService.getAllMenus().length}</li>
            </ul>
          </div>
        </div>

      </PageLayout>
    </main>
  );
};

export default AuthCallbackDebug;

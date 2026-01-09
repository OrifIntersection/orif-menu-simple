import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import MenuTable from '../components/MenuTable';
import MenuCell from '../components/MenuCell';
import ColorLegend from '../components/ColorLegend';
import ApiService from '../services/ApiService';
import { getCurrentWeekNumber, getCurrentYear } from '../utils/dateUtils';
import { normalizeMenu, filterWeekdays, extractDayFromMenu } from '../utils/menuNormalizer';

const AuthCallbackDebug = () => {
  const navigate = useNavigate();
  const [menuSemaine, setMenuSemaine] = useState(null);
  const [menuJour, setMenuJour] = useState(null);
  const [jourActuel, setJourActuel] = useState('Mercredi');
  const [loading, setLoading] = useState(true);
  
  const currentYear = getCurrentYear();
  const currentWeekNumber = getCurrentWeekNumber();

  useEffect(() => {
    async function fetchMenu() {
      setLoading(true);
      try {
        const meals = await ApiService.getMenuByWeek(currentYear, currentWeekNumber);
        
        if (meals && meals.length > 0) {
          const mealsWithDishes = meals.map(meal => ({
            ...meal,
            meals_dishes: meal.dishes ? meal.dishes.map(d => ({
              dish_id: d.id,
              dishes: d
            })) : []
          }));
          const normalized = normalizeMenu(mealsWithDishes, currentWeekNumber);
          const filtered = filterWeekdays(normalized);
          setMenuSemaine(filtered);
          
          const dayMenu = extractDayFromMenu(normalized, jourActuel);
          setMenuJour(dayMenu);
        }
      } catch (error) {
        console.error('Erreur chargement menu:', error);
      }
      setLoading(false);
    }
    fetchMenu();
  }, [currentYear, currentWeekNumber, jourActuel]);

  const hasMenuSemaine = menuSemaine && menuSemaine.days && menuSemaine.days.length > 0;
  const hasMenuJour = menuJour && menuJour.data && Object.keys(menuJour.data).length > 0;
  const meals = menuJour?.meals || ['Midi', 'Soir'];

  return (
    <main className="container">
      <PageLayout title="Diagnostic Systeme">
        
        <div style={{ background: '#e3f2fd', padding: '1.5rem', borderRadius: 8, marginBottom: '2rem' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#1976d2' }}>Navigation rapide</h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button 
              onClick={() => navigate('/')} 
              style={{ padding: '0.75rem 1.5rem', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold' }}
            >
              Menu de la semaine actuelle
            </button>
            <button 
              onClick={() => navigate('/import-local')} 
              style={{ padding: '0.75rem 1.5rem', background: '#f57c00', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold' }}
            >
              Importation
            </button>
          </div>
        </div>

        <div style={{ background: '#f3e5f5', padding: '1.5rem', borderRadius: 8, marginBottom: '2rem' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#7b1fa2' }}>Styles et Emojis</h3>
          <ColorLegend />
          <div style={{ marginTop: '1rem', padding: '1rem', background: '#fff', borderRadius: 6 }}>
            <strong>Exemples de styles de plats :</strong>
            <div style={{ marginTop: '0.5rem' }}>
              Entree : Salade verte / Plat : Poulet roti / Garniture : Riz / Legume : Brocoli / Dessert : Tarte / Autre : Pain
            </div>
          </div>
        </div>

        <div style={{ background: '#e8f5e9', padding: '1.5rem', borderRadius: 8, marginBottom: '2rem' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#2e7d32' }}>Menu de la Semaine N {currentWeekNumber} ({currentYear})</h3>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>Chargement...</div>
          ) : hasMenuSemaine ? (
            <>
              <MenuTable menu={menuSemaine} />
              
              <div style={{ background: '#fff3cd', color: '#856404', padding: '1rem', borderRadius: 8, marginTop: '1rem', fontSize: '0.95rem' }}>
                <strong>DEBUG - Menu de la semaine</strong><br />
                <div>Semaine : {currentWeekNumber} / {currentYear}</div>
                <div>menuSemaine.days : {JSON.stringify(menuSemaine?.days || [])}</div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', color: '#d32f2f', fontWeight: 'bold', padding: '2rem' }}>
              Aucun menu de la semaine disponible.
            </div>
          )}
        </div>

        <div style={{ background: '#fff3e0', padding: '1.5rem', borderRadius: 8, marginBottom: '2rem' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#e65100' }}>Menu du Jour : {jourActuel}</h3>
          
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
            </>
          ) : (
            <div style={{ textAlign: 'center', color: '#d32f2f', fontWeight: 'bold', padding: '2rem' }}>
              Aucun menu disponible pour {jourActuel}.
            </div>
          )}
        </div>

      </PageLayout>
    </main>
  );
};

export default AuthCallbackDebug;

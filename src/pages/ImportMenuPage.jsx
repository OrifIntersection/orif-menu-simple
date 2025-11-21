// Page d'import de menus depuis Excel
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import ExcelImportMenu from '../components/ExcelImportMenu';
import { groupMenusByDayAndMoment } from '../utils/categoryMapper';
import { MenuService } from '../services/MenuService';
import { getWeekDates } from '../utils/dateUtils';

export default function ImportMenuPage() {
  const navigate = useNavigate();
  const [importedMenus, setImportedMenus] = useState(null);
  const [weekNumber, setWeekNumber] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  // Gérer l'import du fichier Excel
  function handleImport(week, menus) {
    setWeekNumber(week);
    setImportedMenus(menus);
    setImportResult(null);
  }

  // Confirmer et sauvegarder en base de données
  async function handleConfirmImport() {
    if (!importedMenus || !weekNumber) return;

    setImporting(true);
    setImportResult(null);

    try {
      // Extraire l'année et le numéro de semaine depuis "2025-49"
      const [year, week] = weekNumber.split('-').map(Number);

      // Obtenir les dates de la semaine
      const weekDates = getWeekDates(year, week);

      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      // Parcourir chaque plat importé
      // NOTE: On n'efface RIEN avant l'import. assignDishToMealByType() remplacera 
      // automatiquement les plats existants du même type, mais préservera les plats 
      // non mentionnés dans l'Excel (évite la perte de données).
      for (const menu of importedMenus) {
        try {
          let dateStr;

          // Support pour NOUVEAU FORMAT (avec date directe)
          if (menu.date) {
            dateStr = menu.date.toISOString().split('T')[0];
          } else if (menu.jour) {
            // Support pour ANCIEN FORMAT (avec jour de la semaine)
            const dayMapping = {
              'Lundi': 0,
              'Mardi': 1,
              'Mercredi': 2,
              'Jeudi': 3,
              'Vendredi': 4,
              'Samedi': 5,
              'Dimanche': 6
            };

            const dayIndex = dayMapping[menu.jour];
            if (dayIndex === undefined) {
              throw new Error(`Jour invalide: ${menu.jour}`);
            }

            const date = weekDates[dayIndex];
            dateStr = date.toISOString().split('T')[0];
          } else {
            throw new Error('Format de données invalide: pas de date ni de jour');
          }

          // Normaliser le moment (MIDI ou SOIR)
          const moment = menu.moment.trim();
          const mealType = moment === 'Midi' ? 'MIDI' : moment === 'Soir' ? 'SOIR' : null;
          if (!mealType) {
            throw new Error(`Moment invalide: ${moment}`);
          }

          // Créer ou récupérer le plat avec son type
          const dishType = menu.typePlat || 'AUTRE';
          const dish = await MenuService.getOrCreateDish(menu.plat, dishType);

          // Assigner le plat au meal (via la méthode basée sur les ENUMs)
          await MenuService.assignDishToMealByType(dateStr, mealType, dishType, dish.id);

          successCount++;
        } catch (error) {
          const identifier = menu.dateStr || menu.jour || 'Date inconnue';
          console.error(`Erreur pour ${identifier} ${menu.moment} - ${menu.plat}:`, error);
          errorCount++;
          errors.push(`${identifier} ${menu.moment} - ${menu.plat}: ${error.message}`);
        }
      }

      // Afficher le résultat
      setImportResult({
        success: true,
        successCount,
        errorCount,
        errors
      });

      // Navigation automatique vers l'éditeur de semaine après un import réussi
      if (errorCount === 0) {
        console.log('✅ Import réussi, redirection vers l\'éditeur de semaine...');
        setTimeout(() => {
          navigate(`/admin/week/${week}`);
        }, 2000);
      } else {
        console.warn(`⚠️ Import terminé avec ${errorCount} erreur(s)`);
      }

    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      setImportResult({
        success: false,
        error: error.message
      });
    } finally {
      setImporting(false);
    }
  }

  // Réinitialiser l'import
  function handleReset() {
    setImportedMenus(null);
    setWeekNumber(null);
    setImportResult(null);
  }

  // Grouper les menus par jour et moment pour l'affichage
  const groupedMenus = importedMenus ? groupMenusByDayAndMoment(importedMenus) : null;

  return (
    <AdminLayout title="Import de menus Excel">
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Composant d'import */}
        {!importedMenus && (
          <ExcelImportMenu onImport={handleImport} />
        )}

        {/* Prévisualisation et validation */}
        {importedMenus && (
          <div>
            <div style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '1rem', 
              borderRadius: '8px',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ marginTop: 0 }}>📊 Résumé de l'import</h3>
              <p><strong>Semaine :</strong> {weekNumber}</p>
              <p><strong>Total de plats :</strong> {importedMenus.length}</p>
            </div>

            {/* Aperçu des menus */}
            <div style={{ 
              border: '2px solid #28a745',
              borderRadius: '8px',
              padding: '1.5rem',
              marginBottom: '1.5rem',
              backgroundColor: 'white'
            }}>
              <h3 style={{ marginTop: 0, color: '#28a745' }}>👁️ Aperçu des menus</h3>
              
              {Object.keys(groupedMenus).map(jour => (
                <div key={jour} style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ 
                    backgroundColor: '#007bff', 
                    color: 'white', 
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    marginBottom: '0.75rem'
                  }}>
                    {jour}
                  </h4>
                  
                  {Object.keys(groupedMenus[jour]).map(moment => (
                    <div key={moment} style={{ marginBottom: '1rem', marginLeft: '1rem' }}>
                      <h5 style={{ 
                        color: '#495057',
                        marginBottom: '0.5rem',
                        borderBottom: '1px solid #dee2e6',
                        paddingBottom: '0.25rem'
                      }}>
                        {moment}
                      </h5>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {groupedMenus[jour][moment].map((menu, idx) => (
                          <li key={idx} style={{ padding: '0.25rem 0', color: '#000' }}>
                            {menu.plat}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Résultat de l'import */}
            {importResult && (
              <div style={{ 
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                backgroundColor: importResult.success ? '#d4edda' : '#f8d7da',
                border: `1px solid ${importResult.success ? '#c3e6cb' : '#f5c6cb'}`,
                color: importResult.success ? '#155724' : '#721c24'
              }}>
                {importResult.success ? (
                  <>
                    <h4 style={{ marginTop: 0 }}>✅ Import réussi !</h4>
                    <p><strong>{importResult.successCount} plats</strong> importés avec succès.</p>
                    {importResult.errorCount > 0 && (
                      <>
                        <p><strong>{importResult.errorCount} erreur(s)</strong> rencontrée(s) :</p>
                        <ul style={{ fontSize: '0.9rem' }}>
                          {importResult.errors.map((error, idx) => (
                            <li key={idx}>{error}</li>
                          ))}
                        </ul>
                      </>
                    )}
                    {importResult.errorCount === 0 && (
                      <p>Redirection vers l'éditeur de semaine...</p>
                    )}
                  </>
                ) : (
                  <>
                    <h4 style={{ marginTop: 0 }}>❌ Erreur lors de l'import</h4>
                    <p>{importResult.error}</p>
                  </>
                )}
              </div>
            )}

            {/* Boutons d'action */}
            <div style={{ 
              display: 'flex', 
              gap: '1rem',
              justifyContent: 'center',
              marginTop: '2rem'
            }}>
              <button
                onClick={handleConfirmImport}
                disabled={importing}
                style={{
                  padding: '1rem 2rem',
                  fontSize: '1rem',
                  backgroundColor: importing ? '#6c757d' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: importing ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {importing ? '⏳ Import en cours...' : `✅ Confirmer l'import (${importedMenus.length} plats)`}
              </button>

              <button
                onClick={handleReset}
                disabled={importing}
                style={{
                  padding: '1rem 2rem',
                  fontSize: '1rem',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: importing ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold'
                }}
              >
                🔄 Recommencer
              </button>

              <button
                onClick={() => navigate('/admin')}
                disabled={importing}
                style={{
                  padding: '1rem 2rem',
                  fontSize: '1rem',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: importing ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold'
                }}
              >
                ❌ Annuler
              </button>

              <button
                onClick={() => navigate('/import-local')}
                disabled={importing}
                style={{
                  padding: '1rem 2rem',
                  fontSize: '1rem',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: importing ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold'
                }}
              >
                🛠️ Importation locale (robuste)
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

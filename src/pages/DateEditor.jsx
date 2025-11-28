import React, { useState, useEffect, useCallback } from 'react';
import { MenuService } from '../services/MenuService';
import AdminLayout from '../components/AdminLayout';
import { formatDateForDisplay, getWeekNumber } from '../utils/dateUtils';

const DateEditor = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mealTypes, setMealTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [currentMenu, setCurrentMenu] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // États pour le modal de création de plat
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newDishData, setNewDishData] = useState({
    name: '',
    mealTypeId: null,
    categoryId: null,
    selectedCategory: ''
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Charger tous les plats
      const dishesData = await MenuService.getAllDishes();
      setDishes(dishesData);
      
      // Types de repas (MIDI, SOIR) - hardcodés pour le nouveau schéma
      setMealTypes([
        { id: 'MIDI', code: 'MIDI', label: 'Midi', emoji: '☀️' },
        { id: 'SOIR', code: 'SOIR', label: 'Soir', emoji: '🌙' }
      ]);
      
      // Catégories de plats (types de plats) - depuis le schéma SQL
      setCategories([
        { id: 'ENTREE', code: 'ENTREE', label: 'Entrée', emoji: '🥗' },
        { id: 'PLAT', code: 'PLAT', label: 'Plat principal', emoji: '🍽️' },
        { id: 'GARNITURE', code: 'GARNITURE', label: 'Garniture', emoji: '🥔' },
        { id: 'LEGUME', code: 'LEGUME', label: 'Légume', emoji: '🥬' },
        { id: 'DESSERT', code: 'DESSERT', label: 'Dessert', emoji: '🍰' },
        { id: 'AUTRE', code: 'AUTRE', label: 'Autre', emoji: '✨' }
      ]);
      
      // Charger le menu pour cette date
      const dateStr = selectedDate instanceof Date ? selectedDate.toISOString().slice(0, 10) : selectedDate;
      const mealsData = await MenuService.getMenuForDate(dateStr);
      
      // Convertir le format Supabase en structure DateEditor
      const menuMap = {};
      mealsData.forEach(meal => {
        meal.meals_dishes?.forEach(link => {
          const key = `${meal.meal_type}_${link.dishes.dish_type}`;
          menuMap[key] = {
            dish_id: link.dish_id,
            dish_name: link.dishes.name,
            meal_type: meal.meal_type,
            dish_type: link.dishes.dish_type
          };
        });
      });
      
      setCurrentMenu(menuMap);
    } catch (err) {
      setError('Erreur lors du chargement des données: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getAssignedDish = (mealTypeId, categoryId) => {
    const key = `${mealTypeId}_${categoryId}`;
    return currentMenu[key] || null;
  };

  const handleManualEntry = async (mealTypeId, categoryId) => {
    const dishName = prompt('Entrez le nom du plat (ex: Salade verte, Steak, Riz...) :');
    if (!dishName || !dishName.trim()) return;

    const trimmedName = dishName.trim();
    const dateStr = selectedDate instanceof Date ? selectedDate.toISOString().slice(0, 10) : selectedDate;
    
    // Recherche de plats similaires (tolérant aux erreurs)
    const similarDishes = dishes.filter(dish => 
      dish.name.toLowerCase().includes(trimmedName.toLowerCase()) ||
      trimmedName.toLowerCase().includes(dish.name.toLowerCase()) ||
      dish.name.toLowerCase().replace(/[^a-z0-9]/g, '').includes(trimmedName.toLowerCase().replace(/[^a-z0-9]/g, ''))
    );

    if (similarDishes.length > 0) {
      // Proposer les plats similaires
      const options = similarDishes.map((dish, index) => `${index + 1}. ${dish.name}`).join('\n');
      const choice = prompt(
        `Plats similaires trouvés pour "${trimmedName}":\n\n${options}\n\nTapez le numéro du plat ou "0" pour créer un nouveau plat:`
      );
      
      if (!choice) return;
      
      const choiceNum = parseInt(choice);
      if (choiceNum > 0 && choiceNum <= similarDishes.length) {
        // Utiliser un plat existant - NOUVEAU SCHEMA
        await MenuService.assignDishToMealByType(dateStr, mealTypeId, categoryId, similarDishes[choiceNum - 1].id);
        await loadData();
        return;
      } else if (choiceNum === 0) {
        // Créer un nouveau plat
        await createAndAssignNewDish(trimmedName, mealTypeId, categoryId);
        return;
      }
    } else {
      // Aucun plat similaire, proposer de créer un nouveau plat
      const createNew = confirm(`Aucun plat trouvé pour "${trimmedName}".\n\nVoulez-vous créer ce nouveau plat ?`);
      if (createNew) {
        await createAndAssignNewDish(trimmedName, mealTypeId, categoryId);
      }
    }
  };

  const handleCreateDishWithCategory = async () => {
    try {
      if (!newDishData.selectedCategory) {
        alert('Veuillez sélectionner une catégorie');
        return;
      }

      const dateStr = selectedDate instanceof Date ? selectedDate.toISOString().slice(0, 10) : selectedDate;
      
      // Créer le nouveau plat - NOUVEAU SCHEMA
      const newDish = await MenuService.getOrCreateDish(newDishData.name, newDishData.selectedCategory);
      
      // Assigner le nouveau plat au menu - NOUVEAU SCHEMA
      await MenuService.assignDishToMealByType(dateStr, newDishData.mealTypeId, newDishData.selectedCategory, newDish.id);
      
      // Recharger les plats
      await loadData();
      
      // Fermer le modal et réinitialiser
      setShowCategoryModal(false);
      setNewDishData({ name: '', mealTypeId: null, categoryId: null, selectedCategory: '' });
      
      alert(`Nouveau plat "${newDishData.name}" créé et ajouté au menu !`);
    } catch (err) {
      setError('Erreur lors de la création du plat: ' + err.message);
    }
  };

  const createAndAssignNewDish = async (dishName, mealTypeId, categoryId) => {
    try {
      if (categories.length === 0) {
        throw new Error('Aucune catégorie disponible pour créer le plat');
      }
      
      // Ouvrir le modal pour sélectionner la catégorie
      setNewDishData({
        name: dishName,
        mealTypeId: mealTypeId,
        categoryId: categoryId,
        selectedCategory: ''
      });
      setShowCategoryModal(true);
      
    } catch (err) {
      setError('Erreur lors de la création du plat: ' + err.message);
    }
  };

  const handleRemoveDish = async (mealTypeId, categoryId) => {
    const confirmRemove = window.confirm('Voulez-vous vraiment supprimer ce plat du menu ?');
    if (confirmRemove) {
      try {
        const dateStr = selectedDate instanceof Date ? selectedDate.toISOString().slice(0, 10) : selectedDate;
        // NOUVEAU SCHEMA - removeDishFromMealByType()
        await MenuService.removeDishFromMealByType(dateStr, mealTypeId, categoryId);
        await loadData();
      } catch (err) {
        setError('Erreur lors de la suppression: ' + err.message);
      }
    }
  };

  const weekNumber = getWeekNumber(selectedDate);

  return (
    <AdminLayout title={`Semaine ${weekNumber} - Éditeur`}>
      <div style={{ margin: '2rem 0', textAlign: 'center' }}>
          <label style={{ marginRight: '1rem', fontWeight: 'bold' }}>
            Date à éditer:
          </label>
          <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            style={{
              padding: '0.5rem',
              fontSize: '1rem',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            Chargement...
          </div>
        )}

        {error && (
          <div style={{
            background: '#f8d7da',
            color: '#721c24',
            padding: '1rem',
            borderRadius: '4px',
            margin: '1rem 0'
          }}>
            {error}
          </div>
        )}

        {!loading && (
          <>
            <div style={{ margin: '2rem 0' }}>
              <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>
                 Menu du {formatDateForDisplay(selectedDate)}
              </h2>
              
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                border: '2px solid #333',
                fontSize: '0.9rem'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{
                      border: '1px solid #333',
                      padding: '0.75rem',
                      textAlign: 'center',
                      fontWeight: 'bold'
                    }}>
                      Catégorie
                    </th>
                    {mealTypes.map(mealType => (
                      <th key={mealType.id} style={{
                        border: '1px solid #333',
                        padding: '0.75rem',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        backgroundColor: '#e9ecef'
                      }}>
                        {mealType.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {categories.map(category => (
                    <tr key={category.id}>
                      <td style={{
                        border: '1px solid #333',
                        padding: '0.75rem',
                        fontWeight: 'bold',
                        backgroundColor: '#f8f9fa'
                      }}>
                        {category.label}
                      </td>
                      {mealTypes.map(mealType => {
                        const assignedDish = getAssignedDish(mealType.id, category.id);
                        
                        return (
                          <td key={`${mealType.id}_${category.id}`} style={{
                            border: '1px solid #333',
                            padding: '0.5rem',
                            textAlign: 'center',
                            minHeight: '100px',
                            verticalAlign: 'top'
                          }}>
                            {assignedDish ? (
                              <div style={{ marginBottom: '0.5rem' }}>
                                <div style={{
                                  padding: '0.5rem',
                                  backgroundColor: '#d4edda',
                                  borderRadius: '4px',
                                  marginBottom: '0.5rem',
                                  fontSize: '0.85rem',
                                  fontWeight: 'bold'
                                }}>
                                  {assignedDish.dish_name}
                                </div>
                                <button
                                  onClick={() => handleRemoveDish(mealType.id, category.id)}
                                  style={{
                                    padding: '0.25rem 0.5rem',
                                    backgroundColor: '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '0.75rem'
                                  }}
                                >
                                   Supprimer
                                </button>
                              </div>
                            ) : (
                              <div>
                                <button
                                  onClick={() => handleManualEntry(mealType.id, category.id)}
                                  style={{
                                    padding: '0.5rem',
                                    backgroundColor: '#28a745',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '0.75rem',
                                    width: '100%'
                                  }}
                                >
                                   Ajouter plat
                                </button>
                              </div>
                            )}
                            <button
                              onClick={() => loadData()}
                              style={{
                                padding: '0.25rem 0.5rem',
                                backgroundColor: '#17a2b8',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                marginTop: '0.25rem',
                                width: '100%'
                              }}
                            >
                               Rafraîchir
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{
              margin: '2rem 0',
              padding: '1.5rem',
              backgroundColor: '#e3f2fd',
              borderRadius: '8px',
              border: '1px solid #bbdefb'
            }}>
              <h3 style={{ marginTop: 0, color: '#1565c0' }}>
                 Guide d'utilisation - Interface Scrum
              </h3>
              <ul style={{ color: '#1565c0', lineHeight: '1.6' }}>
                <li><strong>Ajouter :</strong> Cliquez sur " Ajouter plat" et saisissez le nom</li>
                <li><strong>Supprimer :</strong> Cliquez sur " Supprimer" pour retirer un plat</li>
                <li><strong>Aperçu :</strong> Utilisez " Rafraîchir" pour voir l'état actuel</li>
                <li><strong>Saisie :</strong> Tapez le nom du plat, la recherche est tolérante aux erreurs</li>
                <li><strong> Nouveau plat :</strong> Si le plat n'existe pas, proposez d'en créer un nouveau !</li>
                <li><strong>Catégories :</strong> Lors de la création, choisissez la catégorie du nouveau plat</li>
              </ul>
            </div>
          </>
        )}

        {/* Modal pour sélectionner la catégorie du nouveau plat */}
        {showCategoryModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '10px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
              maxWidth: '400px',
              width: '90%'
            }}>
              <h3 style={{ marginTop: 0, color: '#333' }}>
                 Nouveau plat: "{newDishData.name}"
              </h3>
              <p style={{ marginBottom: '1rem', color: '#666' }}>
                Choisissez une catégorie de plat:
              </p>
              
              <select
                value={newDishData.selectedCategory}
                onChange={(e) => setNewDishData(prev => ({
                  ...prev,
                  selectedCategory: e.target.value
                }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  marginBottom: '1rem',
                  border: '2px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '1rem'
                }}
              >
                <option value="">-- Sélectionnez une catégorie --</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setShowCategoryModal(false);
                    setNewDishData({ name: '', mealTypeId: null, categoryId: null, selectedCategory: '' });
                  }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                   Annuler
                </button>
                
                <button
                  onClick={handleCreateDishWithCategory}
                  disabled={!newDishData.selectedCategory}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: newDishData.selectedCategory ? '#28a745' : '#ccc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: newDishData.selectedCategory ? 'pointer' : 'not-allowed'
                  }}
                >
                   Créer le plat
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Navigation rapide */}
        <div style={{ 
          marginTop: '2rem',
          padding: '1.5rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h4 style={{ margin: '0 0 1rem 0', color: '#495057' }}>🧭 Navigation rapide</h4>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '1rem', 
            flexWrap: 'wrap' 
          }}>
            <button
              onClick={() => {
                const prevDate = new Date(selectedDate);
                prevDate.setDate(prevDate.getDate() - 1);
                setSelectedDate(prevDate);
              }}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.9rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              ⬅️ Jour précédent
            </button>
            <button
              onClick={() => {
                const nextDate = new Date(selectedDate);
                nextDate.setDate(nextDate.getDate() + 1);
                setSelectedDate(nextDate);
              }}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.9rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              ➡️ Jour suivant
            </button>
            <button
              onClick={() => setSelectedDate(new Date())}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.9rem',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              📅 Aller à aujourd'hui
            </button>
          </div>
        </div>
    </AdminLayout>
  );
};

export default DateEditor;

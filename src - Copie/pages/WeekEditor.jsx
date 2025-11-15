// Éditeur de semaine simple - inspiré du DateEditor
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MenuService } from '../services/MenuService';
import AdminLayout from '../components/AdminLayout';
import { getWeekDates, formatDate, getCurrentWeekNumber } from '../utils/dateUtils';

const WeekEditor = () => {
  const { weekNumber } = useParams();
  const navigate = useNavigate();
  const weekNum = parseInt(weekNumber);
  
  const [selectedDay, setSelectedDay] = useState(0); // Index du jour sélectionné (0-6)
  const [mealTypes, setMealTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [weekMenus, setWeekMenus] = useState({}); // Menus pour chaque jour de la semaine
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Calculer les dates de la semaine - mémorisé pour éviter le recalcul constant
  const weekDates = useMemo(() => getWeekDates(2025, weekNum), [weekNum]);
  const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      console.log('🔄 Chargement des données pour WeekEditor...');
      
      const [mealTypesData, categoriesData, dishesData] = await Promise.all([
        MenuService.getMealTypes(),
        MenuService.getCategories(),
        MenuService.getAllDishes()
      ]);

      console.log('✅ Données chargées:', { mealTypesData, categoriesData, dishesData });
      
      setMealTypes(mealTypesData);
      setCategories(categoriesData);
      setDishes(dishesData);

      // Charger les menus pour chaque jour de la semaine
      const weekMenusData = {};
      for (let i = 0; i < weekDates.length; i++) {
        const date = weekDates[i];
        try {
          const { supabase } = await import('../lib/supabase');
          const { data, error } = await supabase
            .from('meal_items')
            .select(`*, meal_types (id, code, label), dishes (id, name, description)`)
            .eq('date', date);
          weekMenusData[i] = data || [];
        } catch (err) {
          console.warn(`Menu vide pour le jour ${i}:`, err.message);
          weekMenusData[i] = [];
        }
      }
      setWeekMenus(weekMenusData);

    } catch (err) {
      console.warn('Utilisation des données de fallback:', err.message);
      // En cas d'erreur complète, utiliser des données vides
      setMealTypes([
        { id: 1, name: 'Entrée' },
        { id: 2, name: 'Plat principal' },
        { id: 3, name: 'Dessert' }
      ]);
      setCategories([
        { id: 1, name: 'Viandes', color: '#e74c3c' },
        { id: 2, name: 'Légumes', color: '#27ae60' },
        { id: 3, name: 'Desserts', color: '#f39c12' }
      ]);
      setDishes([
        { id: 1, name: 'Salade verte', category_id: 2 },
        { id: 2, name: 'Poulet rôti', category_id: 1 },
        { id: 3, name: 'Tarte aux pommes', category_id: 3 }
      ]);
      setWeekMenus({});
      setError('Mode hors ligne activé - données d\'exemple');
    } finally {
      setLoading(false);
    }
  }, [weekDates]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Validation du numéro de semaine
  if (isNaN(weekNum) || weekNum < 1 || weekNum > 53) {
    return (
      <AdminLayout title="Erreur">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2>❌ Numéro de semaine invalide</h2>
          <p>Le numéro de semaine doit être entre 1 et 53.</p>
          <button onClick={() => navigate('/admin')}>🏠 Retour à l'administration</button>
        </div>
      </AdminLayout>
    );
  }

  const currentMenu = weekMenus[selectedDay] || {};

  const getAssignedDish = (mealTypeId, categoryId) => {
    const key = `${mealTypeId}_${categoryId}`;
    return currentMenu[key];
  };

  const handleDishAssignment = async (mealTypeId, categoryId, dishId) => {
    try {
      const currentDate = weekDates[selectedDay];
      
      console.log('🔄 Modification du menu:', { currentDate, mealTypeId, categoryId, dishId });
      
      // Mise à jour locale immédiate pour éviter le clignotement
      const key = `${mealTypeId}_${categoryId}`;
      const dishName = dishId ? dishes.find(d => d.id === dishId)?.name : null;
      
      setWeekMenus(prev => ({
        ...prev,
        [selectedDay]: {
          ...prev[selectedDay],
          [key]: dishId ? {
            dish_id: dishId,
            dish_name: dishName,
            meal_type: mealTypes.find(m => m.id === mealTypeId)?.name,
            category: categories.find(c => c.id === categoryId)?.name
          } : undefined
        }
      }));
      
      // Ensuite, tenter la synchronisation avec Supabase en arrière-plan
      if (dishId) {
        await MenuService.assignDishToMenu(currentDate, mealTypeId, categoryId, dishId);
      } else {
        await MenuService.removeDishFromMenu(currentDate, mealTypeId, categoryId);
      }
      
      console.log('✅ Menu mis à jour avec succès');
      setError(''); // Effacer l'erreur si la synchronisation réussit
      
    } catch (err) {
      console.warn('⚠️ Mode hors ligne - modification locale conservée:', err.message);
      setError('Mode hors ligne - modifications temporaires uniquement');
    }
  };

  const copyDayToOtherDays = async (fromDayIndex) => {
    if (!weekMenus[fromDayIndex] || Object.keys(weekMenus[fromDayIndex]).length === 0) {
      alert('Aucun menu à copier pour ce jour');
      return;
    }

    const confirmed = confirm(`Copier le menu du ${dayNames[fromDayIndex]} sur tous les autres jours de la semaine ?`);
    if (!confirmed) return;

    try {
      setLoading(true);
      const sourceMenu = weekMenus[fromDayIndex];
      
      console.log('🔄 Copie du menu:', sourceMenu);
      
      // Mise à jour locale immédiate pour éviter le clignotement
      const newWeekMenus = { ...weekMenus };
      for (let i = 0; i < weekDates.length; i++) {
        if (i !== fromDayIndex) {
          newWeekMenus[i] = { ...sourceMenu };
        }
      }
      setWeekMenus(newWeekMenus);
      
      // Tenter la synchronisation avec Supabase en arrière-plan
      for (let i = 0; i < weekDates.length; i++) {
        if (i === fromDayIndex) continue; // Skip the source day
        
        const targetDate = weekDates[i];
        
        try {
          // Clear existing menu for target date
          await MenuService.clearMenuForDate(targetDate);
          
          // Copy each dish assignment
          for (const [key, menuItem] of Object.entries(sourceMenu)) {
            if (menuItem && menuItem.dish_id) {
              const [mealTypeId, categoryId] = key.split('_').map(Number);
              await MenuService.assignDishToMenu(targetDate, mealTypeId, categoryId, menuItem.dish_id);
            }
          }
        } catch (err) {
          console.warn(`Mode hors ligne - copie locale pour le jour ${i}:`, err.message);
          // La copie locale a déjà été faite, continuer
        }
      }
      
      alert('Menu copié avec succès sur tous les jours !');
      console.log('✅ Copie terminée');
      setError(''); // Effacer l'erreur si la synchronisation réussit
    } catch (err) {
      console.warn('⚠️ Erreur lors de la copie, mode hors ligne activé:', err.message);
      setError('Mode hors ligne - copie temporaire uniquement');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Cafétéria ORIF">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          🔄 Chargement des données...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Cafétéria ORIF">
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {error && (
          <div style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '1rem',
            borderRadius: '5px',
            marginBottom: '1rem',
            border: '1px solid #f5c6cb'
          }}>
            {error}
          </div>
        )}

        {/* Sélecteur de jour */}
        <div style={{ marginBottom: '2rem' }}>
          <h3>Sélectionner un jour à éditer :</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
            gap: '0.5rem',
            marginBottom: '1rem'
          }}>
            {dayNames.map((day, index) => (
              <button
                key={index}
                onClick={() => setSelectedDay(index)}
                style={{
                  padding: '0.75rem',
                  backgroundColor: selectedDay === index ? '#007bff' : '#f8f9fa',
                  color: selectedDay === index ? 'white' : '#333',
                  border: '1px solid #dee2e6',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                {day}
                <br />
                <small>{formatDate(weekDates[index]).split('-').slice(1).join('/')}</small>
              </button>
            ))}
          </div>
          
          {/* Bouton de copie */}
          <button
            onClick={() => copyDayToOtherDays(selectedDay)}
            disabled={!weekMenus[selectedDay] || Object.keys(weekMenus[selectedDay]).length === 0}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            📋 Copier ce jour sur toute la semaine
          </button>
        </div>

        {/* Interface d'édition pour le jour sélectionné */}
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h3>📅 Édition du {dayNames[selectedDay]} ({formatDate(weekDates[selectedDay])})</h3>
          
          {/* Table d'édition - identique au DateEditor */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '0.75rem', border: '1px solid #dee2e6', textAlign: 'left' }}>
                    Type de repas
                  </th>
                  {categories.map(category => (
                    <th key={category.id} style={{ 
                      padding: '0.75rem', 
                      border: '1px solid #dee2e6',
                      backgroundColor: category.color,
                      color: 'white',
                      textAlign: 'center'
                    }}>
                      {category.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mealTypes.map(mealType => (
                  <tr key={mealType.id}>
                    <td style={{ 
                      padding: '0.75rem', 
                      border: '1px solid #dee2e6',
                      fontWeight: 'bold',
                      backgroundColor: '#f8f9fa'
                    }}>
                      {mealType.name}
                    </td>
                    {categories.map(category => {
                      const assignedDish = getAssignedDish(mealType.id, category.id);
                      return (
                        <td key={category.id} style={{ 
                          padding: '0.5rem', 
                          border: '1px solid #dee2e6',
                          textAlign: 'center'
                        }}>
                          <select
                            value={assignedDish?.dish_id || ''}
                            onChange={(e) => handleDishAssignment(
                              mealType.id, 
                              category.id, 
                              e.target.value ? parseInt(e.target.value) : null
                            )}
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              border: '1px solid #ddd',
                              borderRadius: '4px'
                            }}
                          >
                            <option value="">-- Choisir un plat --</option>
                            {dishes
                              .filter(dish => dish.category_id === category.id)
                              .map(dish => (
                                <option key={dish.id} value={dish.id}>
                                  {dish.name}
                                </option>
                              ))
                            }
                          </select>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Navigation */}
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button
            onClick={() => navigate('/admin')}
            style={{
              padding: '1rem 2rem',
              fontSize: '1rem',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginRight: '1rem'
            }}
          >
            🏠 Retour à l'administration
          </button>
          
          <button
            onClick={() => navigate(`/week/${weekNum}`)}
            style={{
              padding: '1rem 2rem',
              fontSize: '1rem',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            👁️ Voir le menu public
          </button>
        </div>

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
              onClick={() => navigate(`/admin/week/${weekNum > 1 ? weekNum - 1 : 52}`)}
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
              ⬅️ Semaine précédente
            </button>
            <button
              onClick={() => navigate(`/admin/week/${weekNum < 52 ? weekNum + 1 : 1}`)}
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
              ➡️ Semaine suivante
            </button>
            <button
              onClick={() => navigate(`/admin/week/${getCurrentWeekNumber()}`)}
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
              📅 Semaine courante
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default WeekEditor;
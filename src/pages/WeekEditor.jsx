import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ApiService from '../services/ApiService';
import AdminLayout from '../components/AdminLayout';
import { getWeekDates, formatDate } from '../utils/dateUtils';

const WeekEditor = () => {
  const { weekNumber } = useParams();
  const navigate = useNavigate();
  const weekNum = parseInt(weekNumber);
  
  const [selectedDay, setSelectedDay] = useState(0);
  const [dishes, setDishes] = useState([]);
  const [weekMenus, setWeekMenus] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const weekDates = useMemo(() => getWeekDates(2025, weekNum), [weekNum]);
  const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  const mealTypes = [
    { code: 'MIDI', label: 'Midi', emoji: '☀️' },
    { code: 'SOIR', label: 'Soir', emoji: '🌙' }
  ];

  const dishTypes = [
    { code: 'ENTREE', label: 'Entrée', emoji: '🥗' },
    { code: 'PLAT', label: 'Plat principal', emoji: '🍽️' },
    { code: 'GARNITURE', label: 'Garniture', emoji: '🥔' },
    { code: 'LEGUME', label: 'Légume', emoji: '🥬' },
    { code: 'DESSERT', label: 'Dessert', emoji: '🍰' },
    { code: 'AUTRE', label: 'Autre', emoji: '✨' }
  ];

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const dishesData = await ApiService.getAllDishes();
      setDishes(dishesData);

      const weekMenusData = {};
      for (let i = 0; i < weekDates.length; i++) {
        const dateObj = weekDates[i];
        const dateStr = dateObj instanceof Date 
          ? `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`
          : dateObj;
        try {
          const mealsData = await ApiService.getMenuForDate(dateStr);
          
          const dayMenu = {};
          if (mealsData && mealsData.length > 0) {
            mealsData.forEach(meal => {
              const mealType = meal.meal_type;
              const mealDishes = meal.meals_dishes || [];
              
              mealDishes.forEach(mealDish => {
                const dish = mealDish.dishes;
                if (!dish) return;
                
                const dishType = dish.dish_type;
                const key = `${mealType}_${dishType}`;
                
                dayMenu[key] = {
                  dish_id: dish.id,
                  dish_name: dish.name,
                  meal_type: mealType,
                  dish_type: dishType
                };
              });
            });
          }
          
          weekMenusData[i] = dayMenu;
        } catch (err) {
          console.warn(`Menu vide pour le jour ${i}:`, err.message);
          weekMenusData[i] = {};
        }
      }
      setWeekMenus(weekMenusData);

    } catch (err) {
      console.warn('Utilisation des données de fallback:', err.message);
      setDishes([]);
      setWeekMenus({});
      setError('Mode hors ligne activé - données d\'exemple');
    } finally {
      setLoading(false);
    }
  }, [weekDates]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isNaN(weekNum) || weekNum < 1 || weekNum > 53) {
    return (
      <AdminLayout title="Erreur">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2>Numero de semaine invalide</h2>
          <p>Le numero de semaine doit etre entre 1 et 53.</p>
          <button onClick={() => navigate('/admin')}>Retour a l'administration</button>
        </div>
      </AdminLayout>
    );
  }

  const currentMenu = weekMenus[selectedDay] || {};

  const getAssignedDish = (mealType, dishType) => {
    const key = `${mealType}_${dishType}`;
    return currentMenu[key];
  };

  const handleDishAssignment = async (mealType, dishType, dishId) => {
    try {
      const dateObj = weekDates[selectedDay];
      const currentDate = dateObj instanceof Date 
        ? `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`
        : dateObj;
      
      const key = `${mealType}_${dishType}`;
      const dishName = dishId ? dishes.find(d => d.id === dishId)?.name : null;
      
      setWeekMenus(prev => ({
        ...prev,
        [selectedDay]: {
          ...prev[selectedDay],
          [key]: dishId ? {
            dish_id: dishId,
            dish_name: dishName,
            meal_type: mealType,
            dish_type: dishType
          } : undefined
        }
      }));
      
      if (dishId) {
        await ApiService.assignDishToMealByType(currentDate, mealType, dishType, dishId);
      } else {
        await ApiService.removeDishFromMealByType(currentDate, mealType, dishType);
      }
      
      setError('');
      
    } catch (err) {
      console.warn('Mode hors ligne - modification locale conservee:', err.message);
      setError('Mode hors ligne - modifications temporaires uniquement');
    }
  };

  const copyDayToOtherDays = async (fromDayIndex) => {
    if (!weekMenus[fromDayIndex] || Object.keys(weekMenus[fromDayIndex]).length === 0) {
      alert('Aucun menu a copier pour ce jour');
      return;
    }

    const confirmed = confirm(`Copier le menu du ${dayNames[fromDayIndex]} sur tous les autres jours de la semaine ?`);
    if (!confirmed) return;

    try {
      setLoading(true);
      const sourceMenu = weekMenus[fromDayIndex];
      
      const newWeekMenus = { ...weekMenus };
      for (let i = 0; i < weekDates.length; i++) {
        if (i !== fromDayIndex) {
          newWeekMenus[i] = { ...sourceMenu };
        }
      }
      setWeekMenus(newWeekMenus);
      
      for (let i = 0; i < weekDates.length; i++) {
        if (i === fromDayIndex) continue;
        
        const dateObj = weekDates[i];
        const targetDate = dateObj instanceof Date 
          ? `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`
          : dateObj;
        
        try {
          const mealTypesInSource = new Set();
          for (const [key, menuItem] of Object.entries(sourceMenu)) {
            if (menuItem && menuItem.dish_id) {
              const [mealType] = key.split('_');
              mealTypesInSource.add(mealType);
            }
          }

          for (const mealType of mealTypesInSource) {
            await ApiService.clearMealByType(targetDate, mealType);
          }
          
          for (const [key, menuItem] of Object.entries(sourceMenu)) {
            if (menuItem && menuItem.dish_id) {
              const [mealType, dishType] = key.split('_');
              await ApiService.assignDishToMealByType(targetDate, mealType, dishType, menuItem.dish_id);
            }
          }
        } catch (err) {
          console.warn(`Mode hors ligne - copie locale pour le jour ${i}:`, err.message);
        }
      }
      
      await loadData();
      
      alert('Menu copie avec succes sur tous les jours !');
      setError('');
    } catch (err) {
      console.warn('Erreur lors de la copie, mode hors ligne active:', err.message);
      setError('Mode hors ligne - copie temporaire uniquement');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Cafeteria ORIF">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          Chargement des donnees...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Cafeteria ORIF">
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

        <div style={{ marginBottom: '2rem' }}>
          <h3>Selectionner un jour a editer :</h3>
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

          <button
            onClick={() => copyDayToOtherDays(selectedDay)}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
              width: '100%'
            }}
          >
            Copier ce jour sur tous les autres jours
          </button>
        </div>

        <h2>Editer le menu du {dayNames[selectedDay]} ({formatDate(weekDates[selectedDay])})</h2>

        <div style={{ marginTop: '2rem' }}>
          {mealTypes.map(mealType => (
            <div key={mealType.code} style={{ marginBottom: '3rem' }}>
              <h3>{mealType.emoji} {mealType.label}</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '0.75rem', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6' }}>
                      Type de plat
                    </th>
                    <th style={{ textAlign: 'left', padding: '0.75rem', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6' }}>
                      Plat selectionne
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dishTypes.map(dishType => {
                    const assignedDish = getAssignedDish(mealType.code, dishType.code);
                    const filteredDishes = dishes.filter(d => d.dish_type === dishType.code);
                    
                    return (
                      <tr key={dishType.code}>
                        <td style={{ padding: '0.75rem', border: '1px solid #dee2e6', fontWeight: 'bold' }}>
                          {dishType.emoji} {dishType.label}
                        </td>
                        <td style={{ padding: '0.75rem', border: '1px solid #dee2e6' }}>
                          <select
                            value={assignedDish?.dish_id || ''}
                            onChange={(e) => handleDishAssignment(
                              mealType.code,
                              dishType.code,
                              e.target.value ? parseInt(e.target.value) : null
                            )}
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              border: '1px solid #ced4da',
                              borderRadius: '4px',
                              fontSize: '0.9rem'
                            }}
                          >
                            <option value="">-- Aucun plat --</option>
                            {filteredDishes.map(dish => (
                              <option key={dish.id} value={dish.id}>
                                {dish.name}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button
            onClick={() => navigate('/admin')}
            style={{
              padding: '0.75rem 2rem',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Retour a l'administration
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default WeekEditor;

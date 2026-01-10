// Fonction pour retirer les accents (normalisation Unicode)
function removeAccents(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Normaliser les codes de repas Supabase vers "Midi" ou "Soir"
function normalizeMealType(code) {
  if (!code) return null;
  
  const normalized = removeAccents(code.toLowerCase().trim());
  
  const mealMapping = {
    'midi': 'Midi',
    'lunch': 'Midi',
    'dejeuner': 'Midi',
    'soir': 'Soir',
    'dinner': 'Soir',
    'diner': 'Soir',
    'souper': 'Soir'
  };
  
  return mealMapping[normalized] || null;
}

// Normaliser les types de plats vers les clés attendues
function normalizeDishType(type) {
  if (!type) return 'AUTRE';
  
  const normalized = removeAccents(type.toUpperCase().trim());
  
  const mapping = {
    'ENTREE': 'ENTREE',
    'ENTREE FROIDE': 'ENTREE',
    'ENTREE CHAUDE': 'ENTREE',
    'STARTER': 'ENTREE',
    'APPETIZER': 'ENTREE',
    'PLAT': 'PLAT',
    'PLAT PRINCIPAL': 'PLAT',
    'PLAT CHAUD': 'PLAT',
    'MAIN': 'PLAT',
    'MAIN COURSE': 'PLAT',
    'GARNITURE': 'GARNITURE',
    'ACCOMPAGNEMENT': 'GARNITURE',
    'SIDE': 'GARNITURE',
    'SIDE DISH': 'GARNITURE',
    'LEGUME': 'LEGUME',
    'LEGUMES': 'LEGUME',
    'VEGETABLE': 'LEGUME',
    'VEGETABLES': 'LEGUME',
    'DESSERT': 'DESSERT',
    'DESSERT CHAUD': 'DESSERT',
    'DESSERT FROID': 'DESSERT',
    'SWEET': 'DESSERT',
    'AUTRE': 'AUTRE',
    'OTHER': 'AUTRE',
    'DIVERS': 'AUTRE'
  };
  
  return mapping[normalized] || 'AUTRE';
}

export function normalizeMenu(menu, weekNumber) {
  if (!menu) return null;
  
  if (menu.days && menu.data) {
    return {
      weekNumber: menu.week_number || weekNumber,
      weekLabel: menu.week_label || `Semaine ${menu.week_number || weekNumber}`,
      year: menu.year || new Date().getFullYear(),
      days: menu.days || [],
      meals: menu.meals || ['Midi', 'Soir'],
      data: menu.data || {}
    };
  }
  
  if (Array.isArray(menu) && menu.length > 0 && menu[0].meal_date) {
    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    const meals = ['Midi', 'Soir'];
    const data = {};
    
    meals.forEach(meal => {
      data[meal] = {};
      days.forEach(day => {
        data[meal][day] = '';
      });
    });
    
    menu.forEach(mealItem => {
      if (!mealItem.meal_date) return;
      const datePart = mealItem.meal_date.split('T')[0];
      const [dateYear, dateMonth, dateDay] = datePart.split('-').map(Number);
      const date = new Date(dateYear, dateMonth - 1, dateDay);
      if (isNaN(date.getTime())) return;
      
      const dayIndex = (date.getDay() + 6) % 7;
      const day = days[dayIndex];
      if (!day || dayIndex < 0 || dayIndex > 6) return;
      
      const rawMealType = mealItem.meal_type;
      const mealType = normalizeMealType(rawMealType);
      if (!mealType) return;
      
      const dishes = mealItem.meals_dishes || [];
      dishes.forEach(mealDish => {
        const dish = mealDish.dishes;
        if (!dish || !dish.name) return;
        
        const dishType = normalizeDishType(dish.dish_type || 'AUTRE');
        const dishWithType = `${dishType}: ${dish.name}`;
        
        if (!data[mealType][day]) {
          data[mealType][day] = dishWithType;
        } else {
          data[mealType][day] += ` / ${dishWithType}`;
        }
      });
    });
    
    return {
      weekNumber: weekNumber,
      weekLabel: `Semaine ${weekNumber}`,
      year: menu[0]?.meal_date ? new Date(menu[0].meal_date).getFullYear() : new Date().getFullYear(),
      days,
      meals,
      data
    };
  }
  
  if (menu.items && Array.isArray(menu.items)) {
    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    const meals = ['Midi', 'Soir'];
    const data = {};
    
    meals.forEach(meal => {
      data[meal] = {};
      days.forEach(day => {
        data[meal][day] = '';
      });
    });
    
    menu.items.forEach(item => {
      if (!item.date) return;
      const date = new Date(item.date);
      if (isNaN(date.getTime())) return;
      
      const dayIndex = (date.getDay() + 6) % 7;
      const day = days[dayIndex];
      if (!day || dayIndex < 0 || dayIndex > 6) return;
      
      const rawMealType = item.meal_types?.code || item.meal_type;
      const mealType = normalizeMealType(rawMealType);
      if (!mealType) return;
      
      const rawDishType = item.dishes?.dish_type || item.dish_type || 'AUTRE';
      const dishType = normalizeDishType(rawDishType);
      const dishName = item.dishes?.name || item.dish_name || '';
      if (!dishName.trim()) return;
      
      const dishWithType = `${dishType}: ${dishName}`;
      
      if (!data[mealType][day]) {
        data[mealType][day] = dishWithType;
      } else {
        data[mealType][day] += ` / ${dishWithType}`;
      }
    });
    
    return {
      weekNumber: weekNumber,
      weekLabel: `Semaine ${weekNumber}`,
      year: new Date().getFullYear(),
      days,
      meals,
      data
    };
  }
  
  return null;
}

export function filterWeekdays(menu) {
  if (!menu) return null;
  
  const weekdays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
  const meals = menu.meals || ['Midi', 'Soir'];
  const filteredData = {};
  
  meals.forEach(mealType => {
    filteredData[mealType] = {};
    weekdays.forEach(day => {
      filteredData[mealType][day] = (menu.data && menu.data[mealType] && menu.data[mealType][day]) || '';
    });
  });
  
  return {
    ...menu,
    days: weekdays,
    data: filteredData
  };
}

export function extractDayFromMenu(menu, dayName) {
  if (!menu || !menu.data) return null;
  
  const meals = menu.meals || ['Midi', 'Soir'];
  const dayData = {};
  
  meals.forEach(mealType => {
    dayData[mealType] = {};
    dayData[mealType][dayName] = (menu.data[mealType] && menu.data[mealType][dayName]) || '';
  });
  
  return {
    ...menu,
    days: [dayName],
    data: dayData
  };
}
ENDOFFILE
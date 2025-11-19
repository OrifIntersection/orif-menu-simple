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
      const date = new Date(item.date);
      const dayIndex = (date.getDay() + 6) % 7;
      const day = days[dayIndex];
      const mealType = item.meal_types?.code || item.meal_type || 'Midi';
      const dishType = item.dishes?.dish_type || item.dish_type || 'AUTRE';
      const dishName = item.dishes?.name || item.dish_name || '';
      
      // Format: "TYPE: Nom du plat" pour que les émojis s'affichent
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

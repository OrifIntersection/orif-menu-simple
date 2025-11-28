// Fonction pour retirer les accents (normalisation Unicode)
function removeAccents(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Normaliser les codes de repas Supabase vers "Midi" ou "Soir"
function normalizeMealType(code) {
  if (!code) return null; // Rejeter au lieu de deviner
  
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
  
  return mealMapping[normalized] || null; // Retourne null si inconnu
}

// Normaliser les types de plats vers les clés attendues
function normalizeDishType(type) {
  if (!type) return 'AUTRE';
  
  // Retirer les accents et mettre en majuscules
  const normalized = removeAccents(type.toUpperCase().trim());
  
  // Mapping étendu des variations possibles
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
  
  // Déjà normalisé (localStorage format)
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
  
  // NOUVELLE STRUCTURE: Array de meals avec jointures
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
      // Valider la date
      if (!mealItem.meal_date) return;
      // Créer la date sans problème de timezone: YYYY-MM-DD
      const [dateYear, dateMonth, dateDay] = mealItem.meal_date.split('-').map(Number);
      const date = new Date(dateYear, dateMonth - 1, dateDay);
      if (isNaN(date.getTime())) return;
      
      const dayIndex = (date.getDay() + 6) % 7;
      const day = days[dayIndex];
      if (!day || dayIndex < 0 || dayIndex > 6) return;
      
      // Normaliser le type de repas
      const rawMealType = mealItem.meal_type;
      const mealType = normalizeMealType(rawMealType);
      if (!mealType) {
        console.warn(`Type de repas inconnu ignoré: "${rawMealType}"`);
        return;
      }
      
      // Traiter les plats de ce meal
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
      year: new Date().getFullYear(),
      days,
      meals,
      data
    };
  }
  
  // ANCIENNE STRUCTURE: items array (meal_items)
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
      // Valider la date
      if (!item.date) return;
      const date = new Date(item.date);
      if (isNaN(date.getTime())) return; // Date invalide
      
      const dayIndex = (date.getDay() + 6) % 7;
      const day = days[dayIndex];
      
      // Vérifier que le jour est valide
      if (!day || dayIndex < 0 || dayIndex > 6) return;
      
      // Normaliser le type de repas (Midi/Soir)
      const rawMealType = item.meal_types?.code || item.meal_type;
      const mealType = normalizeMealType(rawMealType);
      
      // Rejeter si le type de repas est inconnu
      if (!mealType) {
        console.warn(`Type de repas inconnu ignoré: "${rawMealType}"`);
        return;
      }
      
      // Normaliser le type de plat (ENTREE/PLAT/etc.)
      const rawDishType = item.dishes?.dish_type || item.dish_type || 'AUTRE';
      const dishType = normalizeDishType(rawDishType);
      
      // Récupérer le nom du plat
      const dishName = item.dishes?.name || item.dish_name || '';
      
      // Ignorer les plats sans nom
      if (!dishName.trim()) {
        console.warn(`Plat sans nom ignoré pour ${mealType} - ${day}`);
        return;
      }
      
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

// Extraire un seul jour d'un menu hebdomadaire
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

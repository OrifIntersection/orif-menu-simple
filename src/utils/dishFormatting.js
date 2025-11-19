export const DISH_TYPE_CONFIG = {
  ENTREE: {
    color: '#A5D8FF',
    darkColor: '#339AF0',
    icon: '🥗',
    label: 'Entrée'
  },
  PLAT: {
    color: '#74C0FC',
    darkColor: '#1971C2',
    icon: '🍽️',
    label: 'Plat'
  },
  GARNITURE: {
    color: '#FFA94D',
    darkColor: '#E8590C',
    icon: '🥔',
    label: 'Garniture'
  },
  LEGUME: {
    color: '#69DB7C',
    darkColor: '#2B8A3E',
    icon: '🥬',
    label: 'Légume'
  },
  DESSERT: {
    color: '#FFC9C9',
    darkColor: '#E03131',
    icon: '🍰',
    label: 'Dessert'
  },
  AUTRE: {
    color: '#CED4DA',
    darkColor: '#495057',
    icon: '✨',
    label: 'Autre'
  }
};

export function parseDishString(dishString) {
  if (!dishString || typeof dishString !== 'string') return [];
  
  const dishes = dishString.split(' / ').map(item => item.trim()).filter(Boolean);
  
  return dishes.map(dish => {
    const match = dish.match(/^([A-Z]+):\s*(.+)$/);
    if (match) {
      const [, type, name] = match;
      return {
        type: type.toUpperCase(),
        name: name.trim(),
        config: DISH_TYPE_CONFIG[type.toUpperCase()] || DISH_TYPE_CONFIG.AUTRE
      };
    }
    return {
      type: 'AUTRE',
      name: dish,
      config: DISH_TYPE_CONFIG.AUTRE
    };
  });
}

import React from 'react';
import { parseDishString, DISH_TYPE_CONFIG } from '../utils/dishFormatting';

const TYPE_ORDER = ['ENTREE', 'PLAT', 'GARNITURE', 'LEGUME', 'DESSERT', 'AUTRE'];

export default function DishListWeek({ dishString }) {
  if (!dishString || typeof dishString !== 'string') {
    return <span style={{ color: '#999', fontStyle: 'italic' }}>Aucun plat</span>;
  }

  const dishes = parseDishString(dishString);
  
  if (dishes.length === 0) {
    return <span style={{ color: '#999', fontStyle: 'italic' }}>Aucun plat</span>;
  }

  const groupedByType = dishes.reduce((acc, dish) => {
    if (!acc[dish.type]) {
      acc[dish.type] = [];
    }
    acc[dish.type].push(dish);
    return acc;
  }, {});

  const sortedTypes = TYPE_ORDER.filter(type => groupedByType[type]);

  return (
    <div style={{ lineHeight: '1.8' }}>
      {sortedTypes.map((type, typeIdx) => (
        <React.Fragment key={type}>
          {groupedByType[type].map((dish, dishIdx) => {
            const emoji = DISH_TYPE_CONFIG[dish.type]?.icon || '✨';
            return (
              <React.Fragment key={`${type}-${dishIdx}`}>
                <span style={{ marginRight: '4px' }}>{emoji}</span>
                <span 
                  style={{ 
                    color: '#212529',
                    fontWeight: '500'
                  }}
                >
                  {dish.name}
                </span>
                {(typeIdx < sortedTypes.length - 1 || dishIdx < groupedByType[type].length - 1) && (
                  <span style={{ color: '#adb5bd', margin: '0 6px' }}> / </span>
                )}
              </React.Fragment>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
}

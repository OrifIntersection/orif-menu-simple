import React from 'react';
import { CoffeeOutlined, FireOutlined, AppleOutlined, StarOutlined, SmileOutlined, MoreOutlined } from '@ant-design/icons';
import { parseDishString, DISH_TYPE_CONFIG } from '../utils/dishFormatting';

const TYPE_ORDER = ['ENTREE', 'PLAT', 'GARNITURE', 'LEGUME', 'DESSERT', 'AUTRE'];

const DISH_ICONS = {
  ENTREE: CoffeeOutlined,
  PLAT: FireOutlined,
  GARNITURE: AppleOutlined,
  LEGUME: StarOutlined,
  DESSERT: SmileOutlined,
  AUTRE: MoreOutlined
};

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
            const Icon = DISH_ICONS[dish.type] || MoreOutlined;
            return (
              <React.Fragment key={`${type}-${dishIdx}`}>
                <Icon 
                  style={{ 
                    color: DISH_TYPE_CONFIG[dish.type]?.darkColor || '#495057',
                    marginRight: '4px',
                    fontSize: '14px'
                  }}
                />
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

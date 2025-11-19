import React from 'react';
import { Tag } from 'antd';
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
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', lineHeight: '1.8' }}>
      {sortedTypes.map((type) => (
        <React.Fragment key={type}>
          {groupedByType[type].map((dish, dishIdx) => (
            <Tag 
              key={`${type}-${dishIdx}`}
              color={DISH_TYPE_CONFIG[dish.type]?.color || '#CED4DA'}
              style={{ 
                margin: 0,
                fontSize: '13px',
                padding: '4px 10px',
                borderRadius: '4px',
                border: 'none'
              }}
            >
              {dish.name}
            </Tag>
          ))}
        </React.Fragment>
      ))}
    </div>
  );
}

import React from 'react';
import { parseDishString } from '../utils/dishFormatting';

export default function DishList({ dishString, style = 'minimal' }) {
  const dishes = parseDishString(dishString);
  
  if (dishes.length === 0) {
    return <span style={{ color: '#999' }}>Aucun plat</span>;
  }

  if (style === 'minimal') {
    return (
      <div className="dish-list-minimal">
        {dishes.map((dish, idx) => (
          <div key={idx} className="dish-item-minimal">
            <span 
              className="dish-color-bar" 
              style={{ backgroundColor: dish.config.color }}
            />
            <span className="dish-name">{dish.name}</span>
          </div>
        ))}
      </div>
    );
  }

  if (style === 'icons') {
    return (
      <div className="dish-list-icons">
        {dishes.map((dish, idx) => (
          <div key={idx} className="dish-item-icons">
            <span className="dish-icon">{dish.config.icon}</span>
            <span className="dish-name">{dish.name}</span>
          </div>
        ))}
      </div>
    );
  }

  if (style === 'badges') {
    return (
      <div className="dish-list-badges">
        {dishes.map((dish, idx) => (
          <div key={idx} className="dish-item-badges">
            <span 
              className="dish-badge" 
              style={{ 
                background: `linear-gradient(135deg, ${dish.config.color} 0%, ${dish.config.darkColor} 100%)`,
              }}
              title={dish.config.label}
            />
            <span className="dish-name">{dish.name}</span>
          </div>
        ))}
      </div>
    );
  }

  if (style === 'cards') {
    const groupedByType = dishes.reduce((acc, dish) => {
      if (!acc[dish.type]) {
        acc[dish.type] = [];
      }
      acc[dish.type].push(dish);
      return acc;
    }, {});

    return (
      <div className="dish-list-cards">
        {Object.entries(groupedByType).map(([type, dishesOfType]) => (
          <div 
            key={type} 
            className="dish-card"
            style={{ 
              borderTopColor: dishesOfType[0].config.darkColor,
              backgroundColor: dishesOfType[0].config.color + '15'
            }}
          >
            <div className="dish-card-header">
              <span className="dish-card-icon">{dishesOfType[0].config.icon}</span>
              <span className="dish-card-title">{dishesOfType[0].config.label}</span>
            </div>
            <div className="dish-card-items">
              {dishesOfType.map((dish, idx) => (
                <div key={idx} className="dish-card-item">{dish.name}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return dishString;
}

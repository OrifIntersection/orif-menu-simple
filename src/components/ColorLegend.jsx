import React from 'react';
import { getDishTypeConfig, DISH_TYPE_ORDER } from '../utils/dishFormatting';

export default function ColorLegend() {
  return (
    <div className="color-legend">
      <h3>💡 Légende des couleurs</h3>
      <div className="legend-items">
        {DISH_TYPE_ORDER.map(type => {
          const config = getDishTypeConfig(type);
          return (
            <div key={type} className="legend-item">
              <span 
                className="legend-color" 
                style={{ backgroundColor: config.color }}
              ></span>
              <span className="legend-label">{config.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

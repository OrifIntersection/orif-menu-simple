import React from 'react';
import PageLayout from '../components/PageLayout';
import DishList from '../components/DishList';

export default function StyleDemo() {
  const [selectedStyle, setSelectedStyle] = React.useState('minimal');

  const exampleMenu = "ENTREE: Salade / PLAT: Steak haché de boeuf / PLAT: Escalope panée / GARNITURE: Frites / LEGUME: Petits pois / LEGUME: Épinards / GARNITURE: Pommes sautées / LEGUME: Julienne de légumes / DESSERT: Jalousie aux pommes";

  const styles = [
    { id: 'minimal', label: '🎯 Minimaliste', desc: 'Bandes de couleur à gauche' },
    { id: 'icons', label: '🍽️ Icônes', desc: 'Icônes devant chaque plat' },
    { id: 'badges', label: '🏷️ Badges', desc: 'Pastilles colorées' },
    { id: 'cards', label: '📋 Cartes', desc: 'Groupés par catégorie' }
  ];

  return (
    <PageLayout title="Styles d'affichage des menus">
      <div className="container">
        <h2 style={{ marginBottom: '24px', fontSize: '1.8em' }}>Choisissez votre style préféré</h2>
        
        <div className="style-selector">
          {styles.map(style => (
            <button
              key={style.id}
              className={`style-btn ${selectedStyle === style.id ? 'active' : ''}`}
              onClick={() => setSelectedStyle(style.id)}
            >
              <div>{style.label}</div>
              <div style={{ fontSize: '0.85em', fontWeight: 'normal', marginTop: '4px', opacity: 0.8 }}>
                {style.desc}
              </div>
            </button>
          ))}
        </div>

        <div style={{ 
          padding: '24px', 
          background: '#f8f9fa', 
          borderRadius: '12px',
          border: '2px solid #dee2e6'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#495057' }}>
            Aperçu : Menu du Lundi Midi
          </h3>
          <DishList dishString={exampleMenu} style={selectedStyle} />
        </div>

        <div style={{ marginTop: '32px', padding: '20px', background: '#e7f5ff', borderRadius: '8px' }}>
          <h4 style={{ marginTop: 0, color: '#1971c2' }}>💡 Légende des couleurs</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginTop: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: '#A5D8FF' }} />
              <span>🥗 Entrée</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: '#74C0FC' }} />
              <span>🍽️ Plat</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: '#FFA94D' }} />
              <span>🥔 Garniture</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: '#69DB7C' }} />
              <span>🥬 Légume</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: '#FFC9C9' }} />
              <span>🍰 Dessert</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: '#CED4DA' }} />
              <span>✨ Autre</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '24px', padding: '16px', background: '#fff3cd', borderRadius: '8px', borderLeft: '4px solid #ffc107' }}>
          <strong>✨ Comment appliquer le style choisi :</strong>
          <p style={{ marginBottom: 0, marginTop: '8px' }}>
            Une fois que vous avez choisi votre style préféré, dites-moi lequel vous aimez et je l'appliquerai automatiquement à toutes les pages (menu du jour, menu de la semaine, prévisualisation d'import).
          </p>
        </div>
      </div>
    </PageLayout>
  );
}

import React from 'react';
import MenuTable from '../components/MenuTable';
import PageLayout from '../components/PageLayout';

export default function EmojiDemo() {
  const demoMenu = {
    weekNumber: 47,
    weekLabel: '2025-47',
    year: 2025,
    days: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'],
    meals: ['Midi', 'Soir'],
    data: {
      Midi: {
        Lundi: 'ENTREE: Salade verte / PLAT: Poulet rôti / GARNITURE: Pommes de terre / LEGUME: Haricots verts / DESSERT: Tarte aux pommes',
        Mardi: 'ENTREE: Soupe / PLAT: Saumon grillé / GARNITURE: Riz / LEGUME: Brocoli / DESSERT: Yaourt',
        Mercredi: 'PLAT: Bœuf bourguignon / GARNITURE: Pâtes / LEGUME: Carottes / DESSERT: Fruits',
        Jeudi: 'ENTREE: Salade composée / PLAT: Poulet au curry / GARNITURE: Riz basmati / DESSERT: Mousse au chocolat',
        Vendredi: 'PLAT: Pizza / GARNITURE: Salade / DESSERT: Glace / AUTRE: Pain'
      },
      Soir: {
        Lundi: 'PLAT: Omelette / GARNITURE: Frites / LEGUME: Salade / DESSERT: Compote',
        Mardi: 'PLAT: Quiche / LEGUME: Salade verte / DESSERT: Fromage blanc',
        Mercredi: 'PLAT: Soupe / GARNITURE: Pain / DESSERT: Fruit',
        Jeudi: 'PLAT: Croque-monsieur / LEGUME: Salade / DESSERT: Yaourt',
        Vendredi: 'PLAT: Sandwich / LEGUME: Crudités / DESSERT: Brownie'
      }
    }
  };

  return (
    <PageLayout title="Cafétéria ORIF">
      <div style={{ marginBottom: '1rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          Démonstration des Émojis - Menu la semaine N° 47 (18-22 novembre 2025)
        </h2>
        <div style={{ 
          background: '#e3f2fd', 
          padding: '1rem', 
          borderRadius: '8px', 
          marginBottom: '1.5rem',
          textAlign: 'center'
        }}>
          <strong>✅ Les icônes ont été remplacées par des émojis</strong><br />
          <strong>✅ La légende apparaît en bas du tableau</strong><br />
          <strong>✅ Seuls les jours Lundi-Vendredi sont affichés</strong>
        </div>
      </div>
      <MenuTable menu={demoMenu} />
    </PageLayout>
  );
}

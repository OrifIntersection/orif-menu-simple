# Exemple d'utilisation du MenuDrawer

Le composant `MenuDrawer` a été créé pour afficher un menu latéral (sidebar) sur mobile qui permet de naviguer entre différents menus.

## Intégration dans HomePage (exemple)

```jsx
import { useState } from "react";
import MenuDrawer from "./components/MenuDrawer";
import MenuTable from "./components/MenuTable";
import defaultMenu from "./data/defaultMenu";
import { getWeekLabel, getCurrentYear } from "./utils/dateUtils";

function HomePage() {
  // Créer plusieurs menus (exemple)
  const menusData = [
    {
      id: "week-1",
      ...defaultMenu,
      weekLabel: getWeekLabel(getCurrentYear(), 1)
    },
    {
      id: "week-2",
      ...defaultMenu,
      weekLabel: getWeekLabel(getCurrentYear(), 2)
    },
    {
      id: "week-3",
      ...defaultMenu,
      weekLabel: getWeekLabel(getCurrentYear(), 3)
    }
  ];

  const [selectedMenuId, setSelectedMenuId] = useState(menusData[0].id);
  const currentMenu = menusData.find(m => m.id === selectedMenuId);

  return (
    <main className="container">
      <div className="topbar">
        <div className="brand">
          {/* Bouton du drawer - visible uniquement sur mobile */}
          <MenuDrawer 
            menus={menusData}
            currentMenuId={selectedMenuId}
            onSelectMenu={setSelectedMenuId}
          />
          <div className="logo"></div>
          <span>ORIF Menu</span>
        </div>
        
        <div className="toolbar">
          <button>📆 Aujourd'hui</button>
          <button>⚙️ Admin</button>
        </div>
      </div>

      <MenuTable menu={currentMenu} />
      
      <Footer />
    </main>
  );
}
```

## Fonctionnalités

- **Bouton hamburger** : Visible uniquement sur mobile (< 769px)
- **Overlay sombre** : Ferme le drawer quand on clique à côté
- **Liste des menus** : Chaque menu affiche son label et des métadonnées
- **Menu actif** : Le menu courant est surligné en bleu
- **Animation fluide** : Le drawer glisse depuis la gauche

## Pour afficher plusieurs semaines sauvegardées

Vous pouvez modifier `storage.js` pour sauvegarder plusieurs menus :

```javascript
const MENUS_KEY = "orif_menus_all";

export function loadAllMenus(fallback = []) {
  try {
    const raw = localStorage.getItem(MENUS_KEY);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function saveAllMenus(menusArray) {
  localStorage.setItem(MENUS_KEY, JSON.stringify(menusArray));
}
```

Voulez-vous que j'intègre le MenuDrawer dans une page spécifique ?

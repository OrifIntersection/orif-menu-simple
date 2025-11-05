// Composant MenuDrawer 100% autonome - Menu latéral qui s'ouvre depuis la droite
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getCurrentWeekNumber, getCurrentYear, getWeekLabel } from "../utils/dateUtils";
import defaultMenu from "../data/defaultMenu";

/**
 * MenuDrawer - Composant complètement autonome sans aucune prop
 * Gère lui-même toutes ses données et son état
 */
export default function MenuDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const currentYear = getCurrentYear();
  const currentWeekNumber = getCurrentWeekNumber();

  // Génération autonome des menus (2 passées + actuelle + 2 futures)
  const menusData = [];
  for (let i = -2; i <= 2; i++) {
    const weekNum = currentWeekNumber + i;
    if (weekNum > 0 && weekNum <= 53) {
      menusData.push({
        id: `week-${weekNum}`,
        ...defaultMenu,
        weekLabel: getWeekLabel(currentYear, weekNum),
        weekNumber: weekNum
      });
    }
  }

  // Déterminer le menu actuel selon la page
  let currentMenuId = `week-${currentWeekNumber}`;
  if (location.pathname.startsWith('/week/')) {
    const weekNum = parseInt(location.pathname.split('/')[2]);
    if (!isNaN(weekNum)) {
      currentMenuId = `week-${weekNum}`;
    }
  }

  // Fonction pour basculer l'état du drawer (ouvert <-> fermé)
  const toggleDrawer = () => setIsOpen(!isOpen);

  const handleMenuClick = (menuId) => {
    const menu = menusData.find(m => m.id === menuId);
    if (menu) {
      navigate(`/week/${menu.weekNumber}`);
    }
    setIsOpen(false);
  };

  /**
   * Gère le clic sur une action de navigation
   * @param {Function} action - La fonction d'action à exécuter
   */
  const handleNavAction = (action) => {
    action(); // Exécute l'action (navigation vers une page)
    setIsOpen(false); // Ferme automatiquement le drawer après action
  };

  // Actions de navigation contextuelles (masque l'action de la page actuelle)
  const navigationActions = [
    {
      icon: "🏠",
      label: "Accueil",
      onClick: () => navigate('/'),
      hidden: location.pathname === '/'
    },
    {
      icon: "📆",
      label: "Consulter une date",
      onClick: () => navigate(`/date/${new Date().toISOString().split('T')[0]}`),
      hidden: location.pathname.startsWith('/date/')
    },
    {
      icon: "📅",
      label: "Consulter une semaine",
      onClick: () => navigate(`/week/${currentWeekNumber}`),
      hidden: location.pathname.startsWith('/week/')
    },
    {
      icon: "⚙️",
      label: "Administration",
      onClick: () => navigate('/admin'),
      hidden: location.pathname.startsWith('/admin')
    }
  ].filter(action => !action.hidden);

  return (
    <>
      {/* Bouton hamburger pour ouvrir le drawer */}
      <button className="menu-drawer-toggle" onClick={toggleDrawer}>
        {/* Icône SVG hamburger (3 lignes horizontales) */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <line x1="3" y1="6" x2="21" y2="6" strokeWidth="2" strokeLinecap="round"/>
          <line x1="3" y1="12" x2="21" y2="12" strokeWidth="2" strokeLinecap="round"/>
          <line x1="3" y1="18" x2="21" y2="18" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        Menus
      </button>

      {/* Overlay sombre qui apparaît derrière le drawer quand il est ouvert */}
      {/* Cliquer sur l'overlay ferme le drawer */}
      {isOpen && <div className="drawer-overlay" onClick={toggleDrawer} />}

      {/* Le drawer principal - s'ouvre depuis la droite avec une animation */}
      {/* La classe "open" est ajoutée quand isOpen est true pour déclencher l'animation CSS */}
      <div className={`menu-drawer ${isOpen ? "open" : ""}`}>
        {/* En-tête du drawer avec titre et bouton de fermeture */}
        <div className="drawer-header">
          <h3>Navigation</h3>
          {/* Bouton X pour fermer le drawer */}
          <button className="drawer-close" onClick={toggleDrawer}>
            ✕
          </button>
        </div>
        
        {/* Contenu scrollable du drawer */}
        <div className="drawer-content">
          {/* Section des actions de navigation */}
          {navigationActions.length > 0 && (
            <div className="drawer-section">
              <h4 className="drawer-section-title">Navigation</h4>
              {/* Boucle sur chaque action pour créer un bouton */}
              {navigationActions.map((action, index) => (
                <button
                  key={index} // Clé unique pour chaque élément de la liste
                  className="drawer-action-item"
                  onClick={() => handleNavAction(action.onClick)} // Exécute l'action au clic
                >
                  {/* Icône emoji de l'action */}
                  <span className="action-icon">{action.icon}</span>
                  {/* Label textuel de l'action */}
                  <span className="action-label">{action.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Section de la liste des menus disponibles */}
          <div className="drawer-section">
            <h4 className="drawer-section-title">Menus des semaines</h4>
            {/* Organiser les menus en catégories: passées, actuelle, futures */}
            {(() => {
              // Trouver l'index du menu actuel
              const currentIndex = menusData.findIndex(m => m.id === currentMenuId);
              const passedMenus = currentIndex > 0 ? menusData.slice(0, currentIndex) : [];
              const currentMenu = menusData.find(m => m.id === currentMenuId);
              const futureMenus = currentIndex >= 0 ? menusData.slice(currentIndex + 1) : menusData;

              return (
                <>
                  {/* Semaines passées */}
                  {passedMenus.length > 0 && (
                    <>
                      <div style={{ marginTop: '12px', marginBottom: '8px', paddingLeft: '8px', fontSize: '0.85em', fontWeight: '600', color: '#9ca3af' }}>
                        📅 Semaines passées
                      </div>
                      {passedMenus.map((menu) => (
                        <button
                          key={menu.id}
                          className="drawer-menu-item"
                          onClick={() => handleMenuClick(menu.id)}
                        >
                          <div className="menu-item-label">{menu.weekLabel}</div>
                          <div className="menu-item-meta">
                            {menu.days.length} jours • {menu.meals.length} repas
                          </div>
                        </button>
                      ))}
                    </>
                  )}

                  {/* Semaine actuelle */}
                  {currentMenu && (
                    <>
                      <div style={{ marginTop: '12px', marginBottom: '8px', paddingLeft: '8px', fontSize: '0.85em', fontWeight: '600', color: '#10b981' }}>
                        ⭐ Semaine actuelle
                      </div>
                      <button
                        key={currentMenu.id}
                        className="drawer-menu-item active"
                        onClick={() => handleMenuClick(currentMenu.id)}
                      >
                        <div className="menu-item-label">{currentMenu.weekLabel}</div>
                        <div className="menu-item-meta">
                          {currentMenu.days.length} jours • {currentMenu.meals.length} repas
                        </div>
                      </button>
                    </>
                  )}

                  {/* Semaines futures */}
                  {futureMenus.length > 0 && (
                    <>
                      <div style={{ marginTop: '12px', marginBottom: '8px', paddingLeft: '8px', fontSize: '0.85em', fontWeight: '600', color: '#3b82f6' }}>
                        🔮 Semaines futures
                      </div>
                      {futureMenus.map((menu) => (
                        <button
                          key={menu.id}
                          className="drawer-menu-item"
                          onClick={() => handleMenuClick(menu.id)}
                        >
                          <div className="menu-item-label">{menu.weekLabel}</div>
                          <div className="menu-item-meta">
                            {menu.days.length} jours • {menu.meals.length} repas
                          </div>
                        </button>
                      ))}
                    </>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </>
  );
}

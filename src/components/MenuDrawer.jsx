// Composant MenuDrawer 100% autonome - Menu latéral qui s'ouvre depuis la droite
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getCurrentWeekNumber, getCurrentYear } from "../utils/dateUtils";
import UserStatus from "./UserStatus";
import { startOfISOWeek, addWeeks } from 'date-fns';

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

  // Récupération des semaines disponibles depuis localStorage
  const [menusData, setMenusData] = useState([]);
  useEffect(() => {
    async function fetchMenus() {
      try {
        // D'ABORD : Vérifier localStorage
        const localMenus = JSON.parse(localStorage.getItem('menus_local') || '[]');
        if (localMenus.length > 0) {
          const formattedMenus = localMenus.map(menu => ({
            id: `week-${menu.week_number}`,
            year: menu.year,
            weekNum: menu.week_number,
            weekLabel: `Semaine ${menu.week_number}`,
            days: menu.days || [],
            meals: menu.meals || []
          }));
          setMenusData(formattedMenus.sort((a, b) => b.year !== a.year ? b.year - a.year : b.weekNum - a.weekNum));
          return;
        }

        // SINON : Essayer Supabase
        const { data, error } = await import("../lib/supabase").then(mod => mod.supabase.from("meals").select("meal_date").order("meal_date", { ascending: false }));
        if (error || !data) {
          setMenusData([]);
        } else {
          // Regrouper par semaine et année
          const weeks = {};
          data.forEach(item => {
            const d = new Date(item.meal_date);
            const year = d.getFullYear();
            // ISO week
            const jan1 = new Date(year, 0, 1);
            const days = Math.floor((d - jan1) / (24 * 60 * 60 * 1000));
            const weekNum = Math.ceil((days + jan1.getDay() + 1) / 7);
            const key = `${year}-W${weekNum}`;
            if (!weeks[key]) weeks[key] = { year, weekNum, dates: [] };
            weeks[key].dates.push(item.meal_date);
          });
          setMenusData(Object.values(weeks).sort((a, b) => b.year !== a.year ? b.year - a.year : b.weekNum - a.weekNum));
        }
      } catch {
        setMenusData([]);
      }
    }
    fetchMenus();
  }, [currentYear]);


  // Fonction pour basculer l'état du drawer (ouvert <-> fermé)
  const toggleDrawer = () => setIsOpen(!isOpen);

  const handleMenuClick = (menuId) => {
    const menu = menusData.find(m => `week-${m.weekNum}` === menuId);
    if (menu) {
      navigate(`/week/${menu.weekNum}`);
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
    // Administration - toujours visible pour développement
    {
      icon: "⚙️",
      label: "Administration",
      onClick: () => navigate('/admin'),
      hidden: false
    }
  ].filter(action => !action.hidden);

  // Actions pour la section Menus - Suppression des doublons
  const menuActions = [
    {
      icon: "📋",
      label: "Calendrier des événements spéciaux",
      onClick: () => navigate('/'), // Pour l'instant redirige vers l'accueil
      hidden: false
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

          {/* Section des menus */}
          {menuActions.length > 0 && (
            <div className="drawer-section">
              <h4 className="drawer-section-title">Menus</h4>
              {/* Boucle sur chaque action de menu pour créer un bouton */}
              {menuActions.map((action, index) => (
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

          {/* Section du statut utilisateur */}
          <div className="drawer-section">
            <h4 className="drawer-section-title">Statut</h4>
            <UserStatus />
          </div>

          {/* Section de test des pages */}
          <div className="drawer-section">
            <h4 className="drawer-section-title">🧪 Test des pages</h4>
            
            {/* Pages principales */}
            <div style={{ marginBottom: '8px', paddingLeft: '8px', fontSize: '0.85em', fontWeight: '600', color: '#9ca3af' }}>
              Pages principales
            </div>
            <button className="drawer-action-item" onClick={() => handleNavAction(() => navigate('/login'))}>
              <span className="action-icon">🔐</span>
              <span className="action-label">Connexion</span>
            </button>
            
            {/* Pages de consultation */}
            <div style={{ marginTop: '12px', marginBottom: '8px', paddingLeft: '8px', fontSize: '0.85em', fontWeight: '600', color: '#9ca3af' }}>
              Pages de consultation
            </div>
            <button className="drawer-action-item" onClick={() => handleNavAction(() => navigate(`/date/${new Date().toISOString().split('T')[0]}`))}>
              <span className="action-icon">📅</span>
              <span className="action-label">Menu du jour</span>
            </button>
            <button className="drawer-action-item" onClick={() => handleNavAction(() => navigate(`/week/${currentWeekNumber}`))}>
              <span className="action-icon">📋</span>
              <span className="action-label">Menu de la semaine</span>
            </button>
            
            {/* Pages d'administration - toujours visibles */}
            <div style={{ marginTop: '12px', marginBottom: '8px', paddingLeft: '8px', fontSize: '0.85em', fontWeight: '600', color: '#9ca3af' }}>
              Administration
            </div>
            <button className="drawer-action-item" onClick={() => handleNavAction(() => navigate('/admin'))}>
              <span className="action-icon">⚙️</span>
              <span className="action-label">Tableau de bord</span>
            </button>
            <button className="drawer-action-item" onClick={() => handleNavAction(() => navigate(`/admin/date/${new Date().toISOString().split('T')[0]}`))}>
              <span className="action-icon">✏️</span>
              <span className="action-label">Éditer le jour</span>
            </button>
            <button className="drawer-action-item" onClick={() => handleNavAction(() => navigate(`/admin/week/${currentWeekNumber}`))}>
              <span className="action-icon">📝</span>
              <span className="action-label">Éditer la semaine</span>
            </button>
            <button className="drawer-action-item" onClick={() => handleNavAction(() => navigate('/auth/callback'))}>
              <span className="action-icon">🔧</span>
              <span className="action-label">Page de debug</span>
            </button>
          </div>

          {/* Section de la liste des menus disponibles */}
          <div className="drawer-section">
            <h4 className="drawer-section-title">Menus des semaines</h4>
            {/* Organiser les menus en catégories: passées, actuelle, futures */}
            {(() => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              
              // Catégoriser les menus selon leurs dates
              const passedMenus = [];
              const currentMenus = [];
              const futureMenus = [];
              
              menusData.forEach((menu) => {
                // Calculer le début et la fin de la semaine ISO
                const jan4 = new Date(menu.year, 0, 4); // 4 janvier est toujours dans la semaine ISO 1
                const week1Start = startOfISOWeek(jan4);
                const weekStart = addWeeks(week1Start, menu.weekNum - 1);
                const fridayEnd = addWeeks(weekStart, 0);
                fridayEnd.setDate(weekStart.getDate() + 4); // Vendredi
                
                if (fridayEnd < today) {
                  // Toutes les dates de travail sont passées
                  passedMenus.push(menu);
                } else if (weekStart <= today && today <= fridayEnd) {
                  // La semaine contient aujourd'hui
                  currentMenus.push(menu);
                } else {
                  // Toutes les dates sont futures
                  futureMenus.push(menu);
                }
              });

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
                            {Array.isArray(menu.days) ? `${menu.days.length} jours • ${Array.isArray(menu.meals) ? menu.meals.length : 0} repas` : 'Menu incomplet'}
                          </div>
                        </button>
                      ))}
                    </>
                  )}

                  {/* Semaine actuelle */}
                  {currentMenus.length > 0 && (
                    <>
                      <div style={{ marginTop: '12px', marginBottom: '8px', paddingLeft: '8px', fontSize: '0.85em', fontWeight: '600', color: '#10b981' }}>
                        ⭐ Semaine actuelle
                      </div>
                      {currentMenus.map((menu) => (
                        <button
                          key={menu.id}
                          className="drawer-menu-item active"
                          onClick={() => handleMenuClick(menu.id)}
                        >
                          <div className="menu-item-label">{menu.weekLabel}</div>
                          <div className="menu-item-meta">
                            {Array.isArray(menu.days) ? `${menu.days.length} jours • ${Array.isArray(menu.meals) ? menu.meals.length : 0} repas` : 'Menu incomplet'}
                          </div>
                        </button>
                      ))}
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
                            {Array.isArray(menu.days) ? `${menu.days.length} jours • ${Array.isArray(menu.meals) ? menu.meals.length : 0} repas` : 'Menu incomplet'}
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

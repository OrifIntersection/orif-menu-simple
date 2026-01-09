import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getCurrentWeekNumber, getCurrentYear } from "../utils/dateUtils";
import UserStatus from "./UserStatus";
import { useAuth } from "../hooks/useAuth";
import ApiService from "../services/ApiService";
import { startOfISOWeek, addWeeks } from 'date-fns';

export default function MenuDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, userRole } = useAuth();
  const currentYear = getCurrentYear();
  const currentWeekNumber = getCurrentWeekNumber();

  const [menusData, setMenusData] = useState([]);
  
  useEffect(() => {
    async function fetchMenus() {
      try {
        const allMenus = await ApiService.getAllMenus();
        setMenusData(allMenus.sort((a, b) => b.year !== a.year ? b.year - a.year : b.weekNum - a.weekNum));
      } catch {
        setMenusData([]);
      }
    }
    fetchMenus();
  }, [currentYear]);

  const toggleDrawer = () => setIsOpen(!isOpen);

  const handleMenuClick = (menuId) => {
    const menu = menusData.find(m => `week-${m.weekNum}` === menuId);
    if (menu) {
      navigate(`/week/${menu.weekNum}`);
    }
    setIsOpen(false);
  };

  const handleNavAction = (action) => {
    action();
    setIsOpen(false);
  };

  const navigationActions = [
    {
      icon: "Home",
      label: "Accueil",
      onClick: () => navigate('/'),
      hidden: location.pathname === '/'
    },
    {
      icon: "Admin",
      label: "Administration",
      onClick: () => navigate('/admin'),
      hidden: !isAuthenticated || userRole === 'guest'
    }
  ].filter(action => !action.hidden);

  return (
    <>
      <button className="menu-drawer-toggle" onClick={toggleDrawer}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <line x1="3" y1="6" x2="21" y2="6" strokeWidth="2" strokeLinecap="round"/>
          <line x1="3" y1="12" x2="21" y2="12" strokeWidth="2" strokeLinecap="round"/>
          <line x1="3" y1="18" x2="21" y2="18" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        Menus
      </button>

      {isOpen && <div className="drawer-overlay" onClick={toggleDrawer} />}

      <div className={`menu-drawer ${isOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <h3>Navigation</h3>
          <button className="drawer-close" onClick={toggleDrawer}>
            X
          </button>
        </div>
        
        <div className="drawer-content">
          <div className="drawer-section">
            <h4 className="drawer-section-title">Statut</h4>
            <UserStatus />
          </div>

          {navigationActions.length > 0 && (
            <div className="drawer-section">
              <h4 className="drawer-section-title">Navigation</h4>
              {navigationActions.map((action, index) => (
                <button
                  key={index}
                  className="drawer-action-item"
                  onClick={() => handleNavAction(action.onClick)}
                >
                  <span className="action-icon">{action.icon}</span>
                  <span className="action-label">{action.label}</span>
                </button>
              ))}
            </div>
          )}

          <div className="drawer-section">
            <h4 className="drawer-section-title">Consultation</h4>
            <button className="drawer-action-item" onClick={() => handleNavAction(() => navigate(`/date/${new Date().toISOString().split('T')[0]}`))}>
              <span className="action-icon">Jour</span>
              <span className="action-label">Menu du jour</span>
            </button>
            <button className="drawer-action-item" onClick={() => handleNavAction(() => navigate(`/week/${currentWeekNumber}`))}>
              <span className="action-icon">Semaine</span>
              <span className="action-label">Menu de la semaine</span>
            </button>
          </div>

          <div className="drawer-section">
            <h4 className="drawer-section-title">Menus des semaines</h4>
            {(() => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              
              const passedMenus = [];
              const currentMenus = [];
              const futureMenus = [];
              
              menusData.forEach((menu) => {
                const jan4 = new Date(menu.year, 0, 4);
                const week1Start = startOfISOWeek(jan4);
                const weekStart = addWeeks(week1Start, menu.weekNum - 1);
                const fridayEnd = addWeeks(weekStart, 0);
                fridayEnd.setDate(weekStart.getDate() + 4);
                
                if (fridayEnd < today) {
                  passedMenus.push(menu);
                } else if (weekStart <= today && today <= fridayEnd) {
                  currentMenus.push(menu);
                } else {
                  futureMenus.push(menu);
                }
              });

              return (
                <>
                  {passedMenus.length > 0 && (
                    <>
                      <div style={{ marginTop: '12px', marginBottom: '8px', paddingLeft: '8px', fontSize: '0.85em', fontWeight: '600', color: '#9ca3af' }}>
                        Semaines passees
                      </div>
                      {passedMenus.map((menu, idx) => (
                        <button
                          key={`menu-${menu.year}-${menu.weekNum}-${idx}`}
                          className="drawer-menu-item"
                          onClick={() => handleMenuClick(`week-${menu.weekNum}`)}
                        >
                          <div className="menu-item-label">Semaine {menu.weekNum} ({menu.year})</div>
                        </button>
                      ))}
                    </>
                  )}

                  {currentMenus.length > 0 && (
                    <>
                      <div style={{ marginTop: '12px', marginBottom: '8px', paddingLeft: '8px', fontSize: '0.85em', fontWeight: '600', color: '#10b981' }}>
                        Semaine actuelle
                      </div>
                      {currentMenus.map((menu, idx) => (
                        <button
                          key={`menu-${menu.year}-${menu.weekNum}-${idx}`}
                          className="drawer-menu-item active"
                          onClick={() => handleMenuClick(`week-${menu.weekNum}`)}
                        >
                          <div className="menu-item-label">Semaine {menu.weekNum} ({menu.year})</div>
                        </button>
                      ))}
                    </>
                  )}

                  {futureMenus.length > 0 && (
                    <>
                      <div style={{ marginTop: '12px', marginBottom: '8px', paddingLeft: '8px', fontSize: '0.85em', fontWeight: '600', color: '#3b82f6' }}>
                        Semaines futures
                      </div>
                      {futureMenus.map((menu, idx) => (
                        <button
                          key={`menu-${menu.year}-${menu.weekNum}-${idx}`}
                          className="drawer-menu-item"
                          onClick={() => handleMenuClick(`week-${menu.weekNum}`)}
                        >
                          <div className="menu-item-label">Semaine {menu.weekNum} ({menu.year})</div>
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

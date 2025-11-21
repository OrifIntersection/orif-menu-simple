// Layout simple pour les pages d'administration
import React from 'react';
import MenuDrawer from './MenuDrawer';
import HeaderPage from './HeaderPage';
import Footer from './Footer';

const AdminLayout = ({ children, title = 'Administration' }) => {
  return (
    <main className="container">
      {/* Header avec menu principal comme dans l'accueil */}
      <header className="topbar">
        <div className="brand">
          {/* Espace vide pour maintenir le style */}
        </div>
        
        <div className="toolbar">
          <div className="toolbar-buttons">
            <MenuDrawer />
          </div>
        </div>
      </header>

      {/* Sous-header spécifique à l'administration */}
      <HeaderPage />
      
      <div style={{ padding: '1rem' }}>
        {children}
      </div>
      <Footer />
    </main>
  );
};

export default AdminLayout;
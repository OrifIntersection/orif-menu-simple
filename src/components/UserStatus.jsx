// Composant pour afficher et gérer le statut utilisateur avec dropdown
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function UserStatus() {
  const { isAuthenticated, signOut, getUserInfo, loading, isSupabaseConfigured } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  // Gestion de la connexion - redirection vers la page de login
  const handleLogin = () => {
    navigate('/login');
    setIsDropdownOpen(false);
  };

  // Gestion de la déconnexion
  const handleLogout = async () => {
    const confirmLogout = confirm('Voulez-vous vous déconnecter ?');
    if (confirmLogout) {
      const result = await signOut();
      if (result.success) {
        navigate('/');
      }
    }
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const getStatusInfo = () => {
    if (loading) {
      return {
        icon: '⏳',
        label: 'Chargement...',
        subtitle: 'Vérification',
        bgColor: '#f8f9fa',
        borderColor: '#e9ecef',
        textColor: '#6c757d'
      };
    }

    if (isAuthenticated) {
      const userInfo = getUserInfo();
      const isAdmin = userInfo.role === 'admin';
      
      return {
        icon: isAdmin ? '👨‍💼' : '👤',
        label: isAdmin ? 'Administrateur' : 'Utilisateur',
        subtitle: userInfo.email || 'Connecté',
        bgColor: isAdmin ? '#e8f5e8' : '#fff3cd',
        borderColor: isAdmin ? '#c3e6c3' : '#ffc107',
        textColor: isAdmin ? '#2d5a2d' : '#856404'
      };
    } else {
      return {
        icon: '👤',
        label: 'Invité',
        subtitle: isSupabaseConfigured ? 'Non connecté' : 'Mode simulation',
        bgColor: '#f8f9fa',
        borderColor: '#e9ecef',
        textColor: '#6c757d'
      };
    }
  };

  const status = getStatusInfo();

  return (
    <div style={{ position: 'relative' }}>
      {/* Bouton principal avec dropdown */}
      <button
        onClick={toggleDropdown}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '12px 16px',
          backgroundColor: status.bgColor,
          border: `1px solid ${status.borderColor}`,
          borderRadius: '8px',
          color: status.textColor,
          cursor: 'pointer',
          fontFamily: 'inherit',
          fontSize: '14px',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-1px)';
          e.target.style.boxShadow = '0 3px 6px rgba(0,0,0,0.1)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = 'none';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '20px' }}>{status.icon}</span>
          <div>
            <div style={{ fontWeight: '600', fontSize: '14px' }}>
              {status.label}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>
              {status.subtitle}
            </div>
          </div>
        </div>
        
        <span 
          style={{ 
            fontSize: '12px', 
            transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}
        >
          ▼
        </span>
      </button>

      {/* Menu dropdown */}
      {isDropdownOpen && (
        <>
          {/* Overlay pour fermer le dropdown */}
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999
            }}
            onClick={() => setIsDropdownOpen(false)}
          />
          
          {/* Contenu du dropdown */}
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '4px',
              backgroundColor: 'white',
              border: '1px solid #e9ecef',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              zIndex: 1000,
              overflow: 'hidden'
            }}
          >
            {!isAuthenticated ? (
              <button
                onClick={handleLogin}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#0d6efd',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f8f9fa';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                <span>🔐</span>
                Se connecter
              </button>
            ) : (
              <button
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#dc3545',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f8f9fa';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                <span>🚪</span>
                Se déconnecter
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
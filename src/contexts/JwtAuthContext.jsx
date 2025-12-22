import React, { useState, useEffect, createContext, useContext } from 'react';
import ApiService from '../services/ApiService';

const JwtAuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(JwtAuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a JwtAuthProvider');
  }
  return context;
};

export const JwtAuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('guest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = ApiService.getToken();
      const savedUser = ApiService.getUser();
      
      if (token && savedUser) {
        try {
          const profile = await ApiService.getProfile();
          setUser(profile);
          setUserRole(profile.role || 'viewer');
          setIsAuthenticated(true);
        } catch (error) {
          console.log('Token invalide, déconnexion');
          ApiService.logout();
        }
      }
      
      setLoading(false);
    };

    initAuth();

    const handleLogout = () => {
      setUser(null);
      setUserRole('guest');
      setIsAuthenticated(false);
    };

    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  const login = async (username, password) => {
    try {
      const data = await ApiService.login(username, password);
      setUser(data.user);
      setUserRole(data.user.role || 'viewer');
      setIsAuthenticated(true);
      return { success: true, message: 'Connexion réussie' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const register = async (username, email, password, full_name) => {
    try {
      const data = await ApiService.register(username, email, password, full_name);
      setUser(data.user);
      setUserRole(data.user.role || 'viewer');
      setIsAuthenticated(true);
      return { success: true, message: 'Compte créé avec succès' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    ApiService.logout();
    setUser(null);
    setUserRole('guest');
    setIsAuthenticated(false);
  };

  const isAdmin = () => userRole === 'admin';

  const getUserInfo = () => ({
    email: user?.email || null,
    fullName: user?.full_name || null,
    username: user?.username || null,
    role: userRole
  });

  const value = {
    isAuthenticated,
    user,
    userRole,
    loading,
    login,
    register,
    logout,
    isAdmin,
    getUserInfo,
    signInWithMagicLink: null,
    signOut: logout,
    isSupabaseConfigured: false
  };

  return (
    <JwtAuthContext.Provider value={value}>
      {children}
    </JwtAuthContext.Provider>
  );
};

export default JwtAuthContext;

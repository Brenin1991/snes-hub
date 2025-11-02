import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, logoutUser } from '../services/api';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('session_token');
      const storedUser = localStorage.getItem('current_user');
      
      if (token && storedUser) {
        // Se temos token e usuário armazenado, usar o usuário armazenado
        // e tentar validar com o servidor em background
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        
        // Validar token em background (sem bloquear a UI)
        try {
          await getCurrentUser();
        } catch (error) {
          console.log('Token inválido, limpando dados');
          localStorage.removeItem('session_token');
          localStorage.removeItem('current_user');
          setCurrentUser(null);
        }
      } else {
        // Se não há token ou usuário, limpar tudo
        localStorage.removeItem('session_token');
        localStorage.removeItem('current_user');
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      localStorage.removeItem('session_token');
      localStorage.removeItem('current_user');
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (userData, sessionToken) => {
    localStorage.setItem('session_token', sessionToken);
    localStorage.setItem('current_user', JSON.stringify(userData));
    setCurrentUser(userData);
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      localStorage.removeItem('session_token');
      localStorage.removeItem('current_user');
      setCurrentUser(null);
    }
  };

  const updateUser = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('current_user', JSON.stringify(userData));
  };

  const value = {
    currentUser,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!currentUser
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

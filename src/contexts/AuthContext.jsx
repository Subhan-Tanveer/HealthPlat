
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authData = localStorage.getItem('healthcare_auth');
    if (authData) {
      const { user, timestamp } = JSON.parse(authData);
      const now = new Date().getTime();
      const oneDay = 24 * 60 * 60 * 1000;
      
      if (now - timestamp < oneDay) {
        setIsAuthenticated(true);
        setUser(user);
      } else {
        localStorage.removeItem('healthcare_auth');
      }
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    if (email === 'user@example.com' && password === '123456') {
      const userData = {
        id: 1,
        name: 'Dr. Sarah Ahmed',
        email: email,
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
        role: 'Patient'
      };
      
      const authData = {
        user: userData,
        timestamp: new Date().getTime()
      };
      
      localStorage.setItem('healthcare_auth', JSON.stringify(authData));
      setIsAuthenticated(true);
      setUser(userData);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('healthcare_auth');
    setIsAuthenticated(false);
    setUser(null);
  };

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

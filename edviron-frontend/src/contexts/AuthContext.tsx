import React, { createContext, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const login = useCallback((token: string, userData: User) => {
    // Store token and user data
    localStorage.setItem('accessToken', token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Update state
    setUser(userData);
    setIsAuthenticated(true);
    
    // Navigate to dashboard
    navigate('/dashboard', { replace: true });
  }, [navigate]);

  const logout = useCallback(() => {
    // Clear all stored data
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    sessionStorage.clear();
    
    // Reset state
    setUser(null);
    setIsAuthenticated(false);
    
    // Force navigate to login and reload
    navigate('/login', { replace: true });
    
    // Force page reload to completely reset app state
    setTimeout(() => {
      window.location.href = '/login';
    }, 100);
  }, [navigate]);

  const value = useMemo(() => ({
    user,
    isAuthenticated,
    login,
    logout
  }), [user, isAuthenticated, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
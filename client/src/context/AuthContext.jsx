import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [admin, setAdmin] = useState(JSON.parse(localStorage.getItem('admin') || 'null'));

  const loginUser = (tokenValue, adminData) => {
    localStorage.setItem('token', tokenValue);
    localStorage.setItem('admin', JSON.stringify(adminData));
    setToken(tokenValue);
    setAdmin(adminData);
  };

  const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    setToken(null);
    setAdmin(null);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, admin, isAuthenticated, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

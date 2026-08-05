import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import apiClient from '../services/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('campusbuddy_token'));
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('campusbuddy_token')));

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let active = true;
    apiClient
      .get('/auth/me')
      .then(({ data }) => {
        if (active) setUser(data?.user ?? null);
      })
      .catch(() => {
        if (active) {
          localStorage.removeItem('campusbuddy_token');
          setToken(null);
          setUser(null);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  const login = async (credentials) => {
    const { data } = await apiClient.post('/auth/login', credentials);
    const nextToken = data?.token;
    if (!nextToken) throw new Error('Authentication failed.');

    localStorage.setItem('campusbuddy_token', nextToken);
    setToken(nextToken);
    setUser(data?.user ?? null);
    return data;
  };

  const register = async (payload) => {
    const { data } = await apiClient.post('/auth/register', payload);
    const nextToken = data?.token;
    if (!nextToken) throw new Error('Registration failed.');

    localStorage.setItem('campusbuddy_token', nextToken);
    setToken(nextToken);
    setUser(data?.user ?? null);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('campusbuddy_token');
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout }),
    [loading, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside an AuthProvider');
  return context;
}

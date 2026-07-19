import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import client, { setAccessToken, setUnauthorizedHandler } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(() => {
    setUser(null);
    setAccessToken(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(clearSession);

    // On app load, try to silently refresh the session using the httpOnly cookie
    const bootstrap = async () => {
      try {
        const res = await client.post('/auth/refresh');
        setAccessToken(res.data.accessToken);
        const meRes = await client.get('/auth/me');
        setUser(meRes.data.data.user);
      } catch {
        clearSession();
      } finally {
        setIsLoading(false);
      }
    };
    bootstrap();
  }, [clearSession]);

  const login = async (email, password) => {
    const res = await client.post('/auth/login', { email, password });
    setAccessToken(res.data.accessToken);
    setUser(res.data.data.user);
    return res.data.data.user;
  };

  const register = async (payload) => {
    const res = await client.post('/auth/register', payload);
    setAccessToken(res.data.accessToken);
    setUser(res.data.data.user);
    return res.data.data.user;
  };

  const logout = async () => {
    try {
      await client.post('/auth/logout');
    } finally {
      clearSession();
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

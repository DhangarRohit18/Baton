import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (orgName: string, email: string, pass: string, name: string) => Promise<void>;
  staticLogin: (role?: 'admin' | 'reviewer' | 'successor') => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const STATIC_DEMO_USER: User = {
  id: 1,
  organization_id: 1,
  email: 'architect@baton-continuity.io',
  full_name: 'Rohit Dhangar (Chief Continuity Architect)',
  role: 'admin',
  is_active: true,
  created_at: new Date().toISOString(),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('baton_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('baton_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        if (token.startsWith('static_demo_')) {
          const saved = localStorage.getItem('baton_user');
          if (saved) {
            setUser(JSON.parse(saved));
          } else {
            setUser(STATIC_DEMO_USER);
            localStorage.setItem('baton_user', JSON.stringify(STATIC_DEMO_USER));
          }
          setIsLoading(false);
          return;
        }

        try {
          const profile = await api.getMe();
          setUser(profile);
          localStorage.setItem('baton_user', JSON.stringify(profile));
        } catch {
          // If offline or network error but user cached, preserve session
          const saved = localStorage.getItem('baton_user');
          if (saved) {
            setUser(JSON.parse(saved));
          } else {
            logout();
          }
        }
      }
      setIsLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async (email: string, pass: string) => {
    const data = await api.login({ email, password: pass });
    localStorage.setItem('baton_token', data.access_token);
    localStorage.setItem('baton_user', JSON.stringify(data.user));
    setToken(data.access_token);
    setUser(data.user);
  };

  const staticLogin = (role: 'admin' | 'reviewer' | 'successor' = 'admin') => {
    const demoUser: User = {
      ...STATIC_DEMO_USER,
      role,
      full_name: role === 'admin' 
        ? 'Rohit Dhangar (Chief Architect)' 
        : role === 'reviewer' 
        ? 'Elena Rostova (Compliance Reviewer)' 
        : 'David Miller (Incoming Successor)',
      email: `${role}@baton-continuity.io`
    };
    const demoToken = 'static_demo_token_baton_2026';
    localStorage.setItem('baton_token', demoToken);
    localStorage.setItem('baton_user', JSON.stringify(demoUser));
    setToken(demoToken);
    setUser(demoUser);
  };

  const register = async (orgName: string, email: string, pass: string, name: string) => {
    const data = await api.register({
      org_name: orgName,
      email,
      password: pass,
      full_name: name,
    });
    localStorage.setItem('baton_token', data.access_token);
    localStorage.setItem('baton_user', JSON.stringify(data.user));
    setToken(data.access_token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('baton_token');
    localStorage.removeItem('baton_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, staticLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

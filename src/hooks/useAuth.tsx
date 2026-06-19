import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api, { clearToken, getToken, setToken } from '../api/client';
import type { Tenant, User } from '../types';

interface AuthContextValue {
  user: User | null;
  tenant: Tenant | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (payload: {
    email: string;
    company_name: string;
    rc_number: string;
    primary_phone: string;
    address_line: string;
    address_city: string;
    address_country: string;
    address_postal_zone?: string;
    state: string;
    company_classification: string;
    tin?: string;
    nrs_business_id?: string;
    nrs_service_id?: string;
    cac_verified?: boolean;
  }) => Promise<{
    message: string;
    email: string;
    profileStatus?: 'verified' | 'pending_review';
    devVerifyUrl?: string;
  }>;
  completeSetup: (token: string, password: string) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setTenant(null);
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      setTenant(data.tenant);
    } catch {
      clearToken();
      setUser(null);
      setTenant(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshMe();
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    setToken(data.token);
    setUser(data.user);
    setTenant(data.tenant);
  };

  const signup = async (payload: {
    email: string;
    company_name: string;
    rc_number: string;
    primary_phone: string;
    address_line: string;
    address_city: string;
    address_country: string;
    address_postal_zone?: string;
    state: string;
    company_classification: string;
    tin?: string;
    nrs_business_id?: string;
    nrs_service_id?: string;
    cac_verified?: boolean;
  }) => {
    const { data } = await api.post('/auth/signup', payload);
    return data as {
      message: string;
      email: string;
      profileStatus?: 'verified' | 'pending_review';
      devVerifyUrl?: string;
    };
  };

  const completeSetup = async (token: string, password: string) => {
    const { data } = await api.post('/auth/set-password', {
      token,
      password,
    });
    setToken(data.token);
    setUser(data.user);
    setTenant(data.tenant);
  };

  const logout = () => {
    clearToken();
    setUser(null);
    setTenant(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, tenant, loading, login, signup, completeSetup, logout, refreshMe }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

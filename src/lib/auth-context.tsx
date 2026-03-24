/**
 * Auth Context & Provider — replaces Angular Auth Guards + AuthServiceService
 *
 * Angular equivalents mapped:
 *   1. AuthGuard (core/guards/auth.guard.ts)
 *      → useAuth().isAuthenticated check in components / route protection
 *      → Angular checks: localStorage.getItem('tokenInfo') → we do the same
 *
 *   2. CheckSessionGuard (providers/guards/check-session.guard.ts)
 *      → AuthProvider runs checkSession on mount & listens for session-expired events
 *
 *   3. AuthServiceService.getTokenInfo() / getLoggedUser() / getCompanyName()
 *      → useAuth() hook exposes: user, company, tokenInfo, sessionId
 *
 *   4. AuthServiceService.logout()
 *      → useAuth().logout()
 *
 *   5. Login flow (login.component.ts)
 *      → useAuth().login() handles: API call, localStorage writes, state update
 *
 * Usage:
 *   const { isAuthenticated, user, company, login, logout } = useAuth();
 */

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { storage } from './storage';
import { toast } from './toast';
import { authApi } from './api-client';
import { STORAGE_KEYS } from './constants';
import type { LoginPayload, LoginResponse, AuthUser, AuthCompany, UserLoginDetail } from './auth-types';

// ─── Context Shape ──────────────────────────────────────────────────────────
interface AuthContextType {
  // State
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  company: AuthCompany | null;
  sessionId: string | null;
  userLoginDetail: UserLoginDetail | null;

  // Actions
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;

  // Helpers (mirror Angular AuthServiceService getters)
  getTokenInfo: () => LoginResponse | null;
  getCompanyName: () => string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ─── Provider ───────────────────────────────────────────────────────────────
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // Mirror Angular AuthGuard: check if tokenInfo exists in localStorage
    const tokenInfo = storage.getItem<LoginResponse>(STORAGE_KEYS.TOKEN_INFO);
    return !!(tokenInfo?.user?.currentSessionId);
  });

  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(() => {
    const tokenInfo = storage.getItem<LoginResponse>(STORAGE_KEYS.TOKEN_INFO);
    return tokenInfo?.user || null;
  });
  const [company, setCompany] = useState<AuthCompany | null>(() => {
    const tokenInfo = storage.getItem<LoginResponse>(STORAGE_KEYS.TOKEN_INFO);
    return tokenInfo?.company || null;
  });
  const [sessionId, setSessionId] = useState<string | null>(() => {
    const tokenInfo = storage.getItem<LoginResponse>(STORAGE_KEYS.TOKEN_INFO);
    return tokenInfo?.user?.currentSessionId || null;
  });
  const [userLoginDetail, setUserLoginDetail] = useState<UserLoginDetail | null>(() => {
    const detail = storage.getItem<UserLoginDetail>(STORAGE_KEYS.USER_LOGIN_DETAIL);
    return detail?.userLoginName ? detail : null;
  });

  // ─── Logout ─────────────────────────────────────────────────────────────
  // Mirrors Angular's AuthServiceService.logout()
  const logout = useCallback(() => {
    storage.removeItem(STORAGE_KEYS.TOKEN_INFO);
    setIsAuthenticated(false);
    setUser(null);
    setCompany(null);
    setSessionId(null);
    toast.success('You have been logged out.', 'Success');
  }, []);

  // ─── Listen for session expiry (from API interceptor) ──────────────────
  // Mirrors Angular's ErrorInterceptor session expired handling
  useEffect(() => {
    const handleSessionExpired = () => {
      console.warn('[Auth] Session expired — logging out');
      logout();
    };

    window.addEventListener('bw-session-expired', handleSessionExpired);
    return () => window.removeEventListener('bw-session-expired', handleSessionExpired);
  }, [logout]);

  // ─── Login ──────────────────────────────────────────────────────────────
  // Mirrors Angular login.component.ts onSubmit()
  const login = useCallback(async (payload: LoginPayload) => {
    setIsLoading(true);
    try {
      const data = await authApi.login(payload);

      // Build userLoginDetail (Angular: login.component.ts line 123)
      const loginDetail: UserLoginDetail = {
        companyShortCode: data.company.shortCode,
        userLoginName: payload.username,
        userName: `${data.user.first_Name} ${data.user.lastname}`,
      };

      // Store everything in localStorage (mirrors Angular login.component.ts lines 128-133)
      storage.setItem(STORAGE_KEYS.TOKEN_INFO, data);
      storage.setItem(STORAGE_KEYS.USER_DATA, { userName: payload.username });
      storage.setItem(STORAGE_KEYS.COMPANY_DATA, { name: data.company.compName });
      storage.setItem(STORAGE_KEYS.COMPANY_INFO, data.company);
      if (data.companyAssets) {
        storage.setItem(STORAGE_KEYS.COMPANY_ASSETS, data.companyAssets);
      }
      storage.setItem(STORAGE_KEYS.USER_LOGIN_DETAIL, loginDetail);

      // Also store api-url (Angular: app.component.ts ngOnInit)
      storage.setItem(STORAGE_KEYS.API_URL, API_BASE_URL_FOR_STORAGE);

      // Update state
      setUser(data.user);
      setCompany(data.company);
      setSessionId(data.user.currentSessionId);
      setUserLoginDetail(loginDetail);
      setIsAuthenticated(true);

      toast.success('You have successfully logged in.', 'Success');
    } finally {
      setIsLoading(false);
    }
    // errors are not caught here; they propagate to the caller (Login component) for UI handling
  }, []);

  // ─── Helper getters (mirror Angular AuthServiceService) ────────────────
  const getTokenInfo = useCallback((): LoginResponse | null => {
    const info = storage.getItem<LoginResponse>(STORAGE_KEYS.TOKEN_INFO);
    return info?.user ? info : null;
  }, []);

  const getCompanyName = useCallback((): string | null => {
    const compData = storage.getItem<{ name?: string }>(STORAGE_KEYS.COMPANY_DATA);
    return compData?.name || null;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        company,
        sessionId,
        userLoginDetail,
        login,
        logout,
        getTokenInfo,
        getCompanyName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ─── Hook ───────────────────────────────────────────────────────────────────
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return ctx;
}

// Internal constant — the URL to store in localStorage
const API_BASE_URL_FOR_STORAGE = 'https://api.baawanerp.com';

/**
 * API client — replaces Angular HTTP interceptors and service layer
 *
 * Angular equivalents mapped:
 *   1. httpInterceptor (providers/interceptor/http.interceptor.ts)
 *      → axios request interceptor: injects sessionId into body + X-Session-ID header
 *   2. ErrorInterceptor (providers/interceptor/error.interceptor.ts)
 *      → axios response interceptor: handles 400/500 errors, session expiry
 *   3. HttpLoaderInterceptor (providers/interceptor/http-loader.interceptor.ts)
 *      → request/response interceptors: manages global loading state
 *   4. AuthServiceService (providers/services/auth-service.service.ts)
 *      → authApi: login, logout, checkSession, forgotPassword, etc.
 *   5. CommonService (providers/services/common.service.ts)
 *      → commonApi: dropdown, itemCategoryList, etc.
 *
 * The proxy server (server.ts) forwards /api-proxy/* to the actual backend
 * to avoid CORS issues, matching the original Angular setup.
 */

import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { storage } from './storage';
import { toast } from './toast';
import { STORAGE_KEYS, API_BASE_URL } from './constants';
import type { LoginPayload, LoginResponse, AuthUser } from './auth-types';

// ─── Active request counter for global loader ───────────────────────────────
let activeRequests = 0;

function notifyLoading(isLoading: boolean) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('bw-loading', { detail: isLoading }));
}

// ─── Create axios instance ──────────────────────────────────────────────────
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// ─── Request Interceptor ────────────────────────────────────────────────────
// Mirrors Angular's httpInterceptor: injects sessionId into body AND header
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Show global loader
  activeRequests++;
  notifyLoading(true);

  const tokenInfo = storage.getItem<{ user?: AuthUser }>(STORAGE_KEYS.TOKEN_INFO);
  const sessionId = tokenInfo?.user?.currentSessionId;

  if (sessionId) {
    // Inject sessionId into request body (Angular behavior)
    if (config.data && typeof config.data === 'object' && !(config.data instanceof FormData)) {
      config.data.sessionId = sessionId;
    }

    // Inject sessionId into FormData (Angular behavior for file uploads)
    if (config.data instanceof FormData) {
      config.data.append('sessionId', sessionId);
    }

    // Add X-Session-ID header (Angular behavior)
    config.headers['X-Session-ID'] = String(sessionId);
  }

  return config;
});

// ─── Response Interceptor ───────────────────────────────────────────────────
// Mirrors Angular's ErrorInterceptor for 400 and 500 errors
api.interceptors.response.use(
  (response) => {
    activeRequests = Math.max(0, activeRequests - 1);
    if (activeRequests === 0) notifyLoading(false);
    return response;
  },
  (error: AxiosError) => {
    activeRequests = Math.max(0, activeRequests - 1);
    if (activeRequests === 0) notifyLoading(false);

    if (!error.response) {
      toast.error('Network error. Please check your connection.');
      return Promise.reject(error);
    }

    const status = error.response.status;
    const data = error.response.data as any;

    // ── Handle 400 (Validation / Session Expired) ──
    if (status === 400) {
      let userMessage = '';

      if (typeof data === 'string') {
        userMessage = data;
      } else if (data?.errors && typeof data.errors === 'object') {
        const messages: string[] = [];
        for (const key in data.errors) {
          if (data.errors[key]?.length > 0) {
            messages.push(data.errors[key].join(', '));
          }
        }
        userMessage = messages.join('\n');
      } else if (data?.message) {
        userMessage = data.message;
      } else if (data?.error) {
        userMessage = data.error;
      } else {
        userMessage = error.message || 'Bad Request. Please check your input.';
      }

      // Check for session expiration (mirrors Angular ErrorInterceptor)
      const isSessionExpired =
        (typeof data === 'string' && data.includes('Invalid Session or Session Expired')) ||
        (data?.message && data.message.includes('Invalid Session or Session Expired'));

      if (isSessionExpired) {
        // Dispatch session-expired event — the AuthProvider handles the redirect
        window.dispatchEvent(new CustomEvent('bw-session-expired'));
      } else {
        toast.info(userMessage, 'Info');
      }

      // Mark as processed to prevent duplicate messages (Angular pattern)
      const cleanError: any = {
        status,
        statusText: '',
        message: '',
        error: '',
        _processedByInterceptor: true,
      };
      return Promise.reject(cleanError);
    }

    // ── Handle 500 (Server Error) ──
    if (status === 500) {
      let message = 'Something went wrong on the server.';

      if (typeof data === 'string') {
        message = data;
      } else if (data?.message) {
        message = data.message;
      } else if (data?.error) {
        message = data.error;
      } else if (data?.title) {
        message = data.title;
      } else if (data?.detail) {
        message = data.detail;
      }

      toast.error(message, 'Error');

      const cleanError: any = {
        status,
        statusText: '',
        message: '',
        error: '',
        _processedByInterceptor: true,
      };
      return Promise.reject(cleanError);
    }

    return Promise.reject(error);
  }
);

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH API — mirrors Angular AuthServiceService
// ═══════════════════════════════════════════════════════════════════════════════
export const authApi = {
  /**
   * POST /api/Auth/Login
   * Angular: AuthServiceService.UserLogin()
   */
  login(payload: LoginPayload): Promise<LoginResponse> {
    return api.post<LoginResponse>('/api/Auth/Login', payload).then(r => r.data);
  },

  /**
   * GET /api/Auth/CheckSession
   * Angular: AuthServiceService.checkSession()
   */
  checkSession(sessionId: string): Promise<any> {
    return api.get('/api/Auth/CheckSession', { params: { sessionId } }).then(r => r.data);
  },

  /**
   * POST /api/Common/ForgotPassword
   * Angular: AuthServiceService.ForgotPassword()
   */
  forgotPassword(data: any): Promise<any> {
    return api.post('/api/Common/ForgotPassword', data).then(r => r.data);
  },

  /**
   * POST /api/Common/ResetPasswordByToken
   * Angular: AuthServiceService.ResetPasswordByToken()
   */
  resetPasswordByToken(data: any): Promise<any> {
    return api.post('/api/Common/ResetPasswordByToken', data).then(r => r.data);
  },

  /**
   * POST /api/Common/ResetPassword
   * Angular: AuthServiceService.ResetPassword()
   */
  resetPassword(data: any): Promise<any> {
    return api.post('/api/Common/ResetPassword', data).then(r => r.data);
  },

  /**
   * POST /api/Company/Create
   * Angular: AuthServiceService.CompanyRegister()
   */
  companyRegister(data: any): Promise<any> {
    return api.post('/api/Company/Create', data).then(r => r.data);
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMMON API — mirrors Angular CommonService
// ═══════════════════════════════════════════════════════════════════════════════
export const commonApi = {
  dropdown(data: any): Promise<any> {
    return api.post('/api/Common/Dropdown', data).then(r => r.data);
  },
  itemCategoryList(data: any): Promise<any> {
    return api.post('/api/Common/Distinct', data).then(r => r.data);
  },
  salesTargetRange(data: any): Promise<any> {
    return api.post('/api/Common/SalesTargetRange', data).then(r => r.data);
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// GENERIC API for any service to use
// ═══════════════════════════════════════════════════════════════════════════════
export const apiClient = {
  get<T = any>(url: string, params?: any): Promise<T> {
    return api.get<T>(url, { params }).then(r => r.data);
  },
  post<T = any>(url: string, data?: any): Promise<T> {
    return api.post<T>(url, data).then(r => r.data);
  },
  put<T = any>(url: string, data?: any): Promise<T> {
    return api.put<T>(url, data).then(r => r.data);
  },
  delete<T = any>(url: string, params?: any): Promise<T> {
    return api.delete<T>(url, { params }).then(r => r.data);
  },
  /** Upload with FormData */
  upload<T = any>(url: string, formData: FormData): Promise<T> {
    return api.post<T>(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },
};

export default api;

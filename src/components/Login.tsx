/**
 * Login Component — Integrated with real Auth API
 * 
 * Angular equivalent: src/app/account/auth/login/login.component.ts
 * 
 * Features preserved from Angular:
 *   - 3-field login (shortcode, username, password)
 *   - "Remember me" (userLoginDetail stored in localStorage)
 *   - "Not you?" button to clear remembered user
 *   - Password visibility toggle
 *   - Loading state on submit
 *   - Error display from API
 *   - Auto-focus on shortcode (new user) or password (returning user)
 * 
 * UI: Kept the new React theme/design unchanged.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Lock, User, Globe, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../lib/auth-context';
import { storage } from '../lib/storage';
import { STORAGE_KEYS } from '../lib/constants';
import type { UserLoginDetail } from '../lib/auth-types';

export const Login: React.FC = () => {
  const { login, isLoading: authLoading, company } = useAuth();

  // ─── Remember-me (Angular: constructor + onNotYouClick) ─────────────────
  const [rememberedUser, setRememberedUser] = useState<UserLoginDetail | null>(() => {
    const detail = storage.getItem<UserLoginDetail>(STORAGE_KEYS.USER_LOGIN_DETAIL);
    return detail?.userLoginName ? detail : null;
  });

  const [formData, setFormData] = useState({
    shortcode: rememberedUser?.companyShortCode || '',
    userName: rememberedUser?.userLoginName || '',
    password: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Refs for auto-focus (Angular: @ViewChild)
  const shortcodeRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // Auto-focus: password if remembered, shortcode if new user
  useEffect(() => {
    setTimeout(() => {
      if (rememberedUser) {
        passwordRef.current?.focus();
      } else {
        shortcodeRef.current?.focus();
      }
    }, 100);
  }, [rememberedUser]);

  // ─── Submit (Angular: onSubmit) ─────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const payload = {
      username: rememberedUser ? rememberedUser.userLoginName : formData.userName,
      password: formData.password,
      shortcode: rememberedUser ? rememberedUser.companyShortCode : formData.shortcode,
    };

    try {
      await login(payload);
      // On success, AuthProvider updates isAuthenticated → App re-renders
    } catch (err: any) {
      console.error('Login error:', err);

      // Check if already handled by interceptor
      if (err._processedByInterceptor) {
        // The interceptor already showed a toast
        return;
      }

      if (!err.response) {
        setError('Connection failed. Please check your network or the server might be unreachable.');
      } else if (err.response?.status === 401) {
        setError('Invalid username or password.');
      } else if (err.response?.status === 404) {
        setError('Login endpoint not found. Please verify API configuration.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (typeof err.response?.data === 'string') {
        setError(err.response.data);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred during login.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Not You? (Angular: onNotYouClick) ──────────────────────────────────
  const handleNotYou = () => {
    setRememberedUser(null);
    setFormData({ shortcode: '', userName: '', password: '' });
    storage.removeItem(STORAGE_KEYS.USER_LOGIN_DETAIL);
    setTimeout(() => shortcodeRef.current?.focus(), 50);
  };

  const companyName = company?.compName || storage.getItem<{ name?: string }>(STORAGE_KEYS.COMPANY_DATA)?.name;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
      >
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="text-primary" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Welcome to BwERP
            </h1>
            {companyName && (
              <p className="text-sm font-medium text-primary mt-1">{companyName}</p>
            )}
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              {rememberedUser
                ? `Welcome back, ${rememberedUser.userName}`
                : 'Please enter your details to sign in'}
            </p>
          </div>

          {/* "Not you?" link for remembered users */}
          {rememberedUser && (
            <div className="mb-4 text-center">
              <button
                type="button"
                onClick={handleNotYou}
                className="text-sm text-primary hover:underline font-medium"
              >
                Not {rememberedUser.userName}? Sign in with a different account
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Short Code — hidden if user is remembered */}
            {!rememberedUser && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Short Code
                </label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    ref={shortcodeRef}
                    type="text"
                    required
                    value={formData.shortcode}
                    onChange={(e) => setFormData({ ...formData, shortcode: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white"
                    placeholder="Enter company short code"
                  />
                </div>
              </div>
            )}

            {/* Username — hidden if user is remembered */}
            {!rememberedUser && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    ref={usernameRef}
                    type="text"
                    required
                    value={formData.userName}
                    onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white"
                    placeholder="Enter your username"
                  />
                </div>
              </div>
            )}

            {/* Password — always shown */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  ref={passwordRef}
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-12 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium">
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Sign In
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>
        
        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Secure Enterprise Login
          </p>
        </div>
      </motion.div>
    </div>
  );
};

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, User, Globe, ArrowRight, Loader2 } from 'lucide-react';
import { authService } from '../services/api';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    userName: '',
    password: '',
    shortcode: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await authService.login(formData);
      onLoginSuccess();
    } catch (err: any) {
      console.error('Login error detail:', err);
      if (!err.response) {
        setError('Connection failed. This might be due to a network error, CORS restrictions, or the server being unreachable.');
      } else if (err.response.status === 401) {
        setError('Invalid username or password.');
      } else if (err.response.status === 404) {
        setError('Login endpoint not found. Please verify the API configuration.');
      } else if (err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.response.data && typeof err.response.data === 'string') {
        setError(err.response.data);
      } else {
        setError(`Error ${err.response.status}: ${err.message || 'An unexpected error occurred during login.'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

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
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome to BwERP</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Please enter your details to sign in</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Short Code
              </label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text"
                  required
                  value={formData.shortcode}
                  onChange={(e) => setFormData({ ...formData, shortcode: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white"
                  placeholder="Enter company short code"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text"
                  required
                  value={formData.userName}
                  onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white"
                  placeholder="••••••••"
                />
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

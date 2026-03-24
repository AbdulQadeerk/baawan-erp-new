/**
 * LocalStorage utility — replaces Angular's LocalStorageServiceService
 * 
 * Angular equivalent: src/app/providers/services/local-storage-service.service.ts
 * 
 * Key differences:
 *   - Angular: Injectable class with DI → Next.js: Plain utility functions
 *   - All methods are identical in behavior (JSON.stringify/parse wrappers)
 */

export const storage = {
  /**
   * Store a value in localStorage (JSON serialized)
   */
  setItem(key: string, value: unknown): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`[Storage] Failed to set item "${key}":`, e);
    }
  },

  /**
   * Retrieve a value from localStorage (JSON parsed)
   * Returns empty object if key doesn't exist — matching Angular behavior
   */
  getItem<T = any>(key: string): T {
    if (typeof window === 'undefined') return {} as T;
    try {
      const raw = localStorage.getItem(key);
      return JSON.parse(raw || '{}') as T;
    } catch (e) {
      console.error(`[Storage] Failed to get item "${key}":`, e);
      return {} as T;
    }
  },

  /**
   * Remove a specific key from localStorage
   */
  removeItem(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  },

  /**
   * Clear all localStorage
   */
  clear(): void {
    if (typeof window === 'undefined') return;
    localStorage.clear();
  },

  // ─── Session Storage ────────────────────────────────────────────────────

  setSessionItem(key: string, value: unknown): void {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`[Storage] Failed to set session item "${key}":`, e);
    }
  },

  getSessionItem<T = any>(key: string): T {
    if (typeof window === 'undefined') return {} as T;
    try {
      const raw = sessionStorage.getItem(key);
      return JSON.parse(raw || '{}') as T;
    } catch (e) {
      console.error(`[Storage] Failed to get session item "${key}":`, e);
      return {} as T;
    }
  },

  removeSessionItem(key: string): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(key);
  },
};

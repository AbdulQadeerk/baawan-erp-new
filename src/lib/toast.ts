/**
 * Toast notification service — replaces Angular's ToastrMessageService
 * 
 * Angular equivalent: src/app/providers/services/toastr-message.service.ts
 * 
 * Features preserved from Angular:
 *   - Duplicate message cooldown (1 second)
 *   - Interceptor-processed error skip
 *   - Success/Error/Info/Warning variants
 * 
 * Implementation: Uses native custom events + a React component for rendering.
 * No external dependency required.
 */

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration?: number;
}

// ─── Duplicate Prevention (matching Angular cooldown logic) ─────────────────
let lastMessage = '';
let lastMessageTime = 0;
const MESSAGE_COOLDOWN = 1000; // 1 second

function isDuplicate(message: string, title?: string): boolean {
  const now = Date.now();
  const key = `${message || ''}_${title || ''}`;

  if (lastMessage === key && (now - lastMessageTime) < MESSAGE_COOLDOWN) {
    console.log('[Toast] Skipping duplicate message within cooldown');
    return true;
  }

  lastMessage = key;
  lastMessageTime = now;
  return false;
}

// ─── Dispatch toast via custom event ────────────────────────────────────────
function dispatch(type: ToastType, message: string, title?: string, duration = 4000) {
  if (isDuplicate(message, title)) return;
  if (typeof window === 'undefined') return;

  const toast: ToastMessage = {
    id: Math.random().toString(36).substr(2, 9),
    type,
    message,
    title,
    duration,
  };

  window.dispatchEvent(new CustomEvent('bw-toast', { detail: toast }));
}

// ─── Public API (mirrors Angular ToastrMessageService) ──────────────────────
export const toast = {
  success(message: string, title?: string) {
    dispatch('success', message, title);
  },

  error(message: string, title?: string) {
    dispatch('error', message, title);
  },

  info(message: string, title?: string, error?: any) {
    // Skip if already processed by interceptor (matches Angular behavior)
    if (error && error._processedByInterceptor) {
      console.log('[Toast] Skipping - already processed by interceptor');
      return;
    }
    dispatch('info', message, title);
  },

  warning(message: string, title?: string) {
    dispatch('warning', message, title);
  },
};

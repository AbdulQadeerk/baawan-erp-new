import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Workaround for "Cannot set property fetch of #<Window> which has only a getter"
// This happens when some polyfills try to overwrite window.fetch
if (typeof window !== 'undefined') {
  try {
    const originalFetch = window.fetch;
    try {
      // Try to delete it first to clear any getter/setter
      delete (window as any).fetch;
    } catch (e) { /* ignore */ }
    
    Object.defineProperty(window, 'fetch', {
      value: originalFetch,
      writable: true,
      configurable: true,
      enumerable: true
    });
  } catch (e) {
    // Silently ignore if we can't redefine it
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

/**
 * Global loading state hook — replaces Angular's LoaderService + HttpLoaderInterceptor
 * 
 * Angular equivalent:
 *   - LoaderService (providers/services/loader.service.ts)
 *   - HttpLoaderInterceptor (providers/interceptor/http-loader.interceptor.ts)
 * 
 * The API client (lib/api-client.ts) dispatches 'bw-loading' events.
 * This hook listens for those events and exposes of an isLoading state.
 */

import { useState, useEffect } from 'react';

export function useGlobalLoader(): boolean {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      setIsLoading((e as CustomEvent<boolean>).detail);
    };
    window.addEventListener('bw-loading', handler);
    return () => window.removeEventListener('bw-loading', handler);
  }, []);

  return isLoading;
}

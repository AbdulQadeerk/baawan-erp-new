/**
 * Loader — React equivalent of Angular's LoaderComponent
 * Angular: src/app/shared/loader/loader.component.ts
 *
 * A configurable loading spinner/overlay component.
 */
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoaderProps {
  message?: string;
  fullScreen?: boolean;
  size?: number;
}

export const Loader: React.FC<LoaderProps> = ({
  message = 'Loading...',
  fullScreen = false,
  size = 32,
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <Loader2 size={size} className="animate-spin text-blue-600 dark:text-blue-400" />
      {message && (
        <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">{message}</span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[999] flex items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
};

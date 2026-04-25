/**
 * ConfirmationModal — React equivalent of Angular's ConfirmationModalComponent
 * Angular: src/app/shared/confirmation-modal/confirmation-modal.component.ts
 */
import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title = 'Confirm',
  message = 'Are you sure?',
  confirmLabel = 'Ok',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: 'text-rose-500',
      btn: 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20',
    },
    warning: {
      icon: 'text-amber-500',
      btn: 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20',
    },
    info: {
      icon: 'text-blue-500',
      btn: 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20',
    },
  };

  const styles = variantStyles[variant];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">{title}</h4>
            <button onClick={onCancel} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <X size={16} className="text-slate-500" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-6 flex items-start gap-4">
            <div className={`p-2 rounded-full bg-slate-100 dark:bg-slate-800 ${styles.icon}`}>
              <AlertTriangle size={20} />
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{message}</p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg transition-all"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 text-sm font-semibold text-white rounded-lg transition-all shadow-lg ${styles.btn}`}
            >
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

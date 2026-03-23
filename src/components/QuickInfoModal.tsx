import React from 'react';
import { 
  X, 
  Lightbulb, 
  ExternalLink, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface QuickInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  ledgerName: string;
}

export const QuickInfoModal: React.FC<QuickInfoModalProps> = ({ isOpen, onClose, ledgerName }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-800 shadow-2xl rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 transform transition-all"
          >
            {/* Header */}
            <div className="bg-emerald-50 dark:bg-emerald-950/30 px-6 py-4 flex items-center justify-between border-b border-emerald-100 dark:border-emerald-900/50">
              <div className="flex items-center gap-2">
                <div className="bg-emerald-100 dark:bg-emerald-900 p-1.5 rounded-lg">
                  <Lightbulb className="text-emerald-600 dark:text-emerald-400" size={20} />
                </div>
                <h2 className="font-bold text-emerald-900 dark:text-emerald-100 text-lg">Quick Info</h2>
              </div>
              <button 
                onClick={onClose}
                className="group p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full transition-colors"
              >
                <X className="text-slate-400 group-hover:text-red-500" size={20} />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* Last Invoice Section */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Last Invoice Details</h3>
                  <button className="inline-flex items-center text-blue-600 hover:underline text-xs font-bold gap-1">
                    <ExternalLink size={14} />
                    View Details
                  </button>
                </div>
                <div className="space-y-4">
                  <DetailRow label="Invoice Number" value="HO-0001/25-26" />
                  <DetailRow label="Created Date" value="Feb 18, 2026, 10:47 AM" />
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Amount</span>
                    <span className="font-black text-slate-900 dark:text-white text-base">₹ 8,17,50,000.00</span>
                  </div>
                </div>
              </section>

              {/* Important Note Section */}
              <section className="space-y-5">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="text-amber-500" size={18} />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Important Note</h3>
                </div>
                
                <div className="inline-flex items-center px-4 py-2 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 rounded-full">
                  <span className="flex h-2 w-2 rounded-full bg-red-500 mr-2 animate-pulse"></span>
                  <span className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest">Payment Pending For 20 Invoices</span>
                </div>

                <div className="grid grid-cols-1 gap-4 mt-2">
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Total Amount</p>
                    <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight">₹ 14,16,09,817.16</p>
                  </div>
                  <div className="p-4 bg-red-50/50 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900/30">
                    <p className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-widest mb-1">Pending Amount</p>
                    <p className="text-2xl font-black text-red-600 dark:text-red-400 tracking-tight">₹ 8,22,87,050.00</p>
                  </div>
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-700">
              <button 
                onClick={onClose}
                className="px-5 py-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                Dismiss
              </button>
              <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95 flex items-center gap-2">
                Take Action
                <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const DetailRow = ({ label, value }: { label: string, value: string }) => (
  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700/50">
    <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">{label}</span>
    <span className="font-bold text-slate-800 dark:text-white text-sm">{value}</span>
  </div>
);

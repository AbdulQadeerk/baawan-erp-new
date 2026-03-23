import React from 'react';
import { X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface StockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StockModal: React.FC<StockModalProps> = ({ isOpen, onClose }) => {
  const warehouses = [
    { name: 'Main Warehouse', current: 150, reserved: 20, available: 130, status: 'success' },
    { name: 'Service Center B', current: 45, reserved: 35, available: 10, status: 'warning' },
    { name: 'Regional Depot X', current: 12, reserved: 12, available: 0, status: 'danger' },
    { name: 'North Sub-Store', current: 88, reserved: 12, available: 76, status: 'success' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/20 backdrop-blur-[2px]"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700 relative z-10"
          >
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <PackageSearch className="text-blue-500" size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Stock Availability</h3>
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-brand-red hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selected Item</span>
                  <h4 className="text-base font-bold text-slate-800 dark:text-white mt-0.5">ITM003 Keyboard</h4>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Stock</span>
                  <p className="text-base font-bold text-emerald-500 mt-0.5">245 Units</p>
                </div>
              </div>

              <div className="mb-4 relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 outline-none dark:text-slate-200" placeholder="Search warehouse..." type="text"/>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-100 dark:border-slate-700">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/80 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
                      <th className="px-4 py-3">Warehouse Name</th>
                      <th className="px-4 py-3 text-right">Current</th>
                      <th className="px-4 py-3 text-right">Reserved</th>
                      <th className="px-4 py-3 text-right">Available</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {warehouses.map((w, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">{w.name}</td>
                        <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400">{w.current}</td>
                        <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400">{w.reserved}</td>
                        <td className={`px-4 py-3 text-right font-bold ${
                          w.status === 'success' ? 'text-emerald-500' : 
                          w.status === 'warning' ? 'text-orange-500' : 'text-brand-red'
                        }`}>{w.available}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
              <button className="px-4 py-2 bg-blue-500 text-white text-xs font-bold rounded-lg hover:shadow-lg transition-all flex items-center gap-1.5 shadow-sm">
                <ArrowLeftRight size={14} /> WAREHOUSE TRANSFER
              </button>
              <button 
                onClick={onClose}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-200 text-xs font-bold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
              >
                CLOSE
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Helper
const PackageSearch = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14" /><path d="m7.5 4.27 9 5.15" /><polyline points="3.29 7 12 12 20.71 7" /><line x1="12" x2="12" y1="22" y2="12" /><circle cx="18.5" cy="15.5" r="2.5" /><path d="M20.27 17.27 22 19" />
  </svg>
);

const ArrowLeftRight = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M8 3 4 7l4 4" /><path d="M4 7h16" /><path d="m16 21 4-4-4-4" /><path d="M20 17H4" />
  </svg>
);

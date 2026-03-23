import React from 'react';
import { 
  X, 
  Search, 
  Wand2, 
  Paintbrush, 
  CheckCircle2, 
  ChevronRight,
  Wallet
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BillWiseAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  partyName: string;
  receiptAmount: number;
}

export const BillWiseAdjustmentModal: React.FC<BillWiseAdjustmentModalProps> = ({ 
  isOpen, 
  onClose, 
  partyName, 
  receiptAmount 
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-6xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 h-[85vh]"
        >
          {/* Header */}
          <header className="px-10 py-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 sticky top-0 z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-3 text-blue-600 font-black text-[10px] tracking-[0.2em] uppercase">
                <CheckCircle2 size={16} />
                Bill-wise Adjustment
              </div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Adjust Bills for: <span className="text-blue-600">{partyName}</span>
              </h1>
            </div>
            <div className="flex items-center gap-8">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Receipt Amount</span>
                <div className="bg-blue-600/10 text-blue-600 px-6 py-2 rounded-2xl border border-blue-600/20 flex items-center gap-3">
                  <span className="text-2xl font-black uppercase tracking-tight">₹{receiptAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl transition-all active:scale-90"
              >
                <X size={28} />
              </button>
            </div>
          </header>

          {/* Sub-Header / Search */}
          <div className="px-10 py-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-6">
            <div className="relative w-full max-w-lg group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
              <input 
                className="block w-full pl-14 pr-5 py-3.5 border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none font-bold text-sm transition-all" 
                placeholder="Search by Bill No. or Date (e.g. INV/24/001)" 
                type="text"
              />
            </div>
            <div className="flex gap-4">
              <button className="flex items-center gap-3 px-8 py-3.5 bg-amber-400 hover:bg-amber-500 text-amber-950 text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-amber-400/20 active:scale-95">
                <Wand2 size={18} />
                Auto-Adjust
              </button>
              <button className="flex items-center gap-3 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-95">
                <Paintbrush size={18} />
                Clear All
              </button>
            </div>
          </div>

          {/* Main Data Area */}
          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800 z-10 shadow-sm">
                <tr className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                  <th className="px-10 py-5 w-16">
                    <input className="rounded-lg border-slate-300 text-blue-600 focus:ring-blue-600 h-5 w-5 cursor-pointer" type="checkbox"/>
                  </th>
                  <th className="px-5 py-5">Bill Date</th>
                  <th className="px-5 py-5">Bill No.</th>
                  <th className="px-5 py-5 text-right">Bill Amount</th>
                  <th className="px-5 py-5 text-right">Already Adjusted</th>
                  <th className="px-5 py-5 text-right">Balance Amount</th>
                  <th className="px-10 py-5 text-right w-72">Current Adjustment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {[
                  { date: '12-Oct-2023', no: 'INV/24/001', amount: 20000, adjusted: 5000, balance: 15000, current: 15000, checked: true },
                  { date: '15-Oct-2023', no: 'INV/24/042', amount: 15000, adjusted: 0, balance: 15000, current: 15000, checked: true },
                  { date: '01-Nov-2023', no: 'INV/24/089', amount: 30000, adjusted: 10000, balance: 20000, current: 20000, checked: true },
                  { date: '10-Nov-2023', no: 'INV/24/115', amount: 12000, adjusted: 0, balance: 12000, current: 0, checked: false },
                  { date: '15-Nov-2023', no: 'INV/24/134', amount: 8500, adjusted: 0, balance: 8500, current: 0, checked: false },
                ].map((row, idx) => (
                  <tr key={idx} className={`hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors group ${!row.checked ? 'opacity-60' : ''}`}>
                    <td className="px-10 py-5">
                      <input checked={row.checked} className="rounded-lg border-slate-300 text-blue-600 focus:ring-blue-600 h-5 w-5 cursor-pointer" type="checkbox"/>
                    </td>
                    <td className="px-5 py-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{row.date}</td>
                    <td className="px-5 py-5 text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{row.no}</td>
                    <td className="px-5 py-5 text-sm text-right font-bold text-slate-600 dark:text-slate-300">₹{row.amount.toLocaleString()}</td>
                    <td className="px-5 py-5 text-sm text-right font-bold text-slate-400">₹{row.adjusted.toLocaleString()}</td>
                    <td className={`px-5 py-5 text-sm text-right font-black ${row.balance > 15000 ? 'text-orange-600' : 'text-slate-900 dark:text-white'}`}>₹{row.balance.toLocaleString()}</td>
                    <td className="px-10 py-5">
                      <div className="relative group/input">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-[10px]">₹</span>
                        <input 
                          disabled={!row.checked}
                          className={`w-full text-right pl-10 pr-4 py-2.5 border rounded-xl font-black text-sm outline-none transition-all ${
                            row.checked 
                              ? 'border-blue-600 bg-blue-50/50 text-blue-600 focus:ring-4 focus:ring-blue-600/10' 
                              : 'border-slate-200 dark:border-slate-700 bg-transparent text-slate-300'
                          }`} 
                          type="number" 
                          value={row.current.toFixed(2)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <footer className="px-10 py-8 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.1)]">
            <div className="flex gap-16">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Adjusted</span>
                <span className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">₹50,000.00</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Remaining to Adjust</span>
                <span className="text-3xl font-black text-blue-600 uppercase tracking-tight leading-none">₹0.00</span>
              </div>
            </div>
            <div className="flex gap-6">
              <button 
                onClick={onClose}
                className="px-10 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-black text-xs uppercase tracking-widest rounded-2xl transition-all active:scale-95"
              >
                Cancel
              </button>
              <button className="px-10 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-2xl shadow-emerald-600/20 flex items-center gap-3 active:scale-95">
                <CheckCircle2 size={20} />
                Confirm Adjustment
              </button>
            </div>
          </footer>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

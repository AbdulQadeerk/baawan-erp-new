import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Save, 
  RefreshCw, 
  Calendar, 
  Search, 
  List, 
  Paperclip, 
  ChevronDown, 
  Wallet, 
  AlertTriangle, 
  ExternalLink,
  CheckCircle2,
  Trash2,
  Plus,
  Info,
  LogIn
} from 'lucide-react';
import { motion } from 'motion/react';
import { BillWiseAdjustmentModal } from './BillWiseAdjustmentModal';

interface ReceiptVoucherCreateProps {
  onBack?: () => void;
}

export const ReceiptVoucherCreate: React.FC<ReceiptVoucherCreateProps> = ({ onBack }) => {
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[1600px] mx-auto p-4 md:p-8 lg:px-20 space-y-8"
    >
      <BillWiseAdjustmentModal 
        isOpen={isAdjustmentModalOpen}
        onClose={() => setIsAdjustmentModalOpen(false)}
        partyName="Acme Global Solutions"
        receiptAmount={50000}
      />
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Create New Receipt Voucher</h1>
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all shadow-lg shadow-blue-600/20 text-xs font-black uppercase tracking-widest active:scale-95"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start">
        {/* Main Form Area */}
        <div className="xl:col-span-3 space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-8 space-y-10">
              {/* Header Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Doc No</label>
                  <input 
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all outline-none font-bold text-sm" 
                    placeholder="Enter Doc No" 
                    type="text"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Bill Date</label>
                  <div className="relative group">
                    <input 
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all outline-none font-bold text-sm pr-12" 
                      type="date" 
                      defaultValue="2026-02-18"
                    />
                    <Calendar className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                  </div>
                </div>
                <div className="space-y-2 col-span-1 md:col-span-1 lg:col-span-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Stock Place</label>
                  <div className="flex gap-3">
                    <select className="flex-1 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all outline-none font-bold text-sm appearance-none cursor-pointer">
                      <option>HO</option>
                      <option>Warehouse A</option>
                      <option>Retail Store 1</option>
                    </select>
                    <button className="bg-amber-500 hover:bg-amber-600 text-white p-3.5 rounded-2xl transition-all shadow-lg shadow-amber-500/20 active:scale-95">
                      <List size={20} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Entry Row */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end bg-slate-50/50 dark:bg-slate-800/30 p-6 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Cr/Dr</label>
                  <select className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all outline-none font-bold text-sm appearance-none cursor-pointer">
                    <option>Cr</option>
                    <option>Dr</option>
                  </select>
                </div>
                <div className="md:col-span-5 space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Ledger <span className="text-rose-600">*</span></label>
                  <div className="flex gap-3">
                    <div className="relative flex-1 group">
                      <input 
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all outline-none font-bold text-sm pr-12" 
                        placeholder="Search Ledger..." 
                        type="text"
                      />
                      <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white p-3.5 rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-95">
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
                <div className="md:col-span-3 space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Amount</label>
                  <input 
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all outline-none font-bold text-sm text-right" 
                    placeholder="0.00" 
                    type="number"
                  />
                </div>
                <div className="md:col-span-2 flex flex-col gap-2">
                  <button 
                    onClick={() => setIsAdjustmentModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-2xl transition-all shadow-lg shadow-amber-500/20 active:scale-95 font-black uppercase tracking-widest text-[9px]"
                  >
                    <CheckCircle2 size={14} />
                    Bill Adjustment
                  </button>
                  <button className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-2xl transition-all shadow-lg shadow-emerald-600/20 active:scale-95 font-black uppercase tracking-widest text-[10px]">
                    <Plus size={16} />
                    Add Entry
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="border-t border-slate-100 dark:border-slate-800">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                      <th className="px-8 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Cr/Dr</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Ledger Name</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] text-right">Debit (₹)</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] text-right">Credit (₹)</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] text-center w-32">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-8 py-24 text-center" colSpan={5}>
                        <div className="flex flex-col items-center opacity-20">
                          <List size={64} className="mb-4" />
                          <p className="text-xl font-black uppercase tracking-widest">No rows to show</p>
                          <p className="text-xs font-bold uppercase tracking-widest mt-2">Start by adding ledger entries above</p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 bg-blue-50 dark:bg-blue-900/10 border-t border-blue-100 dark:border-blue-800/50">
                <div className="px-8 py-6 flex items-center justify-center md:justify-end gap-4 md:border-r border-blue-100 dark:border-blue-800/50">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Debit Value:</span>
                  <span className="text-2xl font-black text-blue-600 uppercase tracking-tight">₹ 0.00</span>
                </div>
                <div className="px-8 py-6 flex items-center justify-center md:justify-start gap-4">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Credit Value:</span>
                  <span className="text-2xl font-black text-blue-600 uppercase tracking-tight">₹ 0.00</span>
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="p-8 space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Note / Remarks</label>
                <textarea 
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-3xl px-6 py-5 focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all outline-none font-bold text-sm resize-none" 
                  placeholder="Enter additional notes here..." 
                  rows={3}
                ></textarea>
              </div>
              <div className="border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden">
                <button className="w-full flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group">
                  <div className="flex items-center gap-4">
                    <Paperclip size={20} className="text-blue-600" />
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Attach Documents</span>
                  </div>
                  <ChevronDown size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Widget */}
        <aside className="space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 sticky top-32 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wallet className="text-blue-600" size={24} />
                <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Quick Balance</h3>
              </div>
              <span className="px-3 py-1 bg-blue-600/10 text-blue-600 text-[9px] font-black rounded-full uppercase tracking-widest">Selected</span>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Balance</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-blue-600 uppercase tracking-tight">₹45,200.00</span>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Cr</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-slate-400">Credit Limit</span>
                  <span className="text-slate-800 dark:text-slate-200">₹ 50,000.00</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '90.4%' }}
                    className="h-full bg-rose-600 rounded-full"
                  ></motion.div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Remaining Limit</span>
                  <span className="text-xs font-black text-rose-600 uppercase tracking-tight">₹ 4,800.00</span>
                </div>
              </div>
            </div>

            <div className="bg-rose-600/5 dark:bg-rose-600/10 border border-rose-600/20 rounded-2xl p-4 flex items-start gap-3">
              <AlertTriangle className="text-rose-600 shrink-0" size={18} />
              <p className="text-[10px] text-rose-700 dark:text-rose-400 font-bold leading-relaxed uppercase tracking-tight">
                90% of credit limit used. Approval might be required for new entries.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">30 Day Trend</p>
                <span className="text-[9px] text-blue-600 font-black uppercase tracking-widest">+12% vs last month</span>
              </div>
              <div className="flex items-end gap-1 h-10">
                {[40, 30, 45, 60, 55, 75, 70, 90, 85, 100, 95, 92, 88, 80, 75].map((h, i) => (
                  <div 
                    key={i} 
                    className={`flex-1 rounded-t-sm transition-all duration-500 ${i === 9 ? 'bg-rose-600' : 'bg-blue-600/40'}`} 
                    style={{ height: `${h}%` }}
                  ></div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button className="text-[10px] font-black text-blue-600 flex items-center gap-2 hover:underline uppercase tracking-widest transition-all">
                VIEW STATEMENT <ExternalLink size={12} />
              </button>
              <span className="text-[9px] font-bold text-slate-400 italic uppercase tracking-tight">Last updated 2m ago</span>
            </div>
          </div>
        </aside>
      </div>

      {/* Final Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10 pb-20">
        <button className="w-full sm:w-auto min-w-[240px] px-12 py-5 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-3">
          <Save size={20} />
          INSERT VOUCHER
        </button>
        <button className="w-full sm:w-auto min-w-[240px] px-12 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-3">
          <RefreshCw size={20} />
          CLEAR FORM
        </button>
      </div>

      {/* Footer */}
      <footer className="py-10 text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] opacity-40 border-t border-slate-100 dark:border-slate-800">
        © 2025 Baawan ERP Solutions • Financial Accounting Suite
      </footer>
    </motion.div>
  );
};

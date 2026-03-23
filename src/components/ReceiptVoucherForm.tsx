import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Save, 
  RefreshCw, 
  Search, 
  Calendar, 
  List, 
  Plus, 
  Trash2, 
  FileText, 
  ChevronDown, 
  Paperclip, 
  Wallet, 
  AlertTriangle, 
  TrendingUp, 
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ReceiptVoucherForm: React.FC = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [isAttachedOpen, setIsAttachedOpen] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 md:p-8 max-w-[1400px] mx-auto space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Create New Receipt Voucher</h1>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-wider opacity-60">Record incoming payments and adjust against outstanding invoices</p>
        </div>
        <button className="flex items-center gap-3 px-8 py-3.5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:scale-105 transition-all active:scale-95">
          <ArrowLeft size={18} />
          Back
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start">
        {/* Main Form Area */}
        <div className="xl:col-span-3 space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-8 space-y-8">
              {/* Top Row: Doc Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                <FormInput label="Doc No" placeholder="Enter Doc No" />
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bill Date</label>
                  <div className="relative">
                    <input 
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3.5 px-5 focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none text-sm font-bold transition-all" 
                      type="date" 
                      defaultValue="2026-02-18"
                    />
                    <Calendar className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                  </div>
                </div>
                <div className="space-y-2 col-span-1 md:col-span-1 lg:col-span-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Stock Place</label>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3.5 px-5 focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none text-sm font-bold appearance-none cursor-pointer transition-all">
                        <option>HO</option>
                        <option>Warehouse A</option>
                        <option>Retail Store 1</option>
                      </select>
                      <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                    </div>
                    <button className="bg-amber-500 hover:bg-amber-600 text-white p-3.5 rounded-2xl transition-all shadow-lg shadow-amber-500/20 active:scale-90">
                      <List size={20} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Entry Row */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end bg-slate-50/50 dark:bg-slate-800/30 p-6 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cr/Dr</label>
                  <div className="relative">
                    <select className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl py-3.5 px-5 focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none text-sm font-bold appearance-none cursor-pointer transition-all">
                      <option>Cr</option>
                      <option>Dr</option>
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                  </div>
                </div>
                <div className="md:col-span-5 space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ledger <span className="text-rose-600">*</span></label>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <input 
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl py-3.5 px-5 focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none text-sm font-bold transition-all" 
                        placeholder="Search Ledger..." 
                        type="text" 
                        defaultValue="Acme Global Solutions"
                      />
                      <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white p-3.5 rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-90">
                      <List size={20} />
                    </button>
                  </div>
                </div>
                <div className="md:col-span-3 space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Amount</label>
                  <input 
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl py-3.5 px-5 focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none text-sm font-black text-right transition-all" 
                    placeholder="0.00" 
                    type="number" 
                  />
                </div>
                <div className="md:col-span-2">
                  <button className="w-full flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-emerald-500/20 active:scale-95">
                    <Plus size={20} />
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Table Area */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-y border-slate-200 dark:border-slate-800">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Cr/Dr</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Ledger Name</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Debit (₹)</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Credit (₹)</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center w-24">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td className="px-8 py-24 text-center" colSpan={5}>
                        <div className="flex flex-col items-center opacity-30">
                          <FileText size={64} className="mb-4 text-slate-400" />
                          <p className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">No rows to show</p>
                          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Start by adding ledger entries above</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    rows.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        {/* Table row content would go here */}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 bg-blue-600/5 dark:bg-blue-600/10 border-t border-blue-600/10">
              <div className="px-8 py-6 flex items-center justify-center md:justify-end gap-4 md:border-r border-blue-600/10">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Debit Value:</span>
                <span className="text-2xl font-black text-blue-600">₹ 0.00</span>
              </div>
              <div className="px-8 py-6 flex items-center justify-center md:justify-start gap-4">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Credit Value:</span>
                <span className="text-2xl font-black text-blue-600">₹ 0.00</span>
              </div>
            </div>

            {/* Remarks & Attachments */}
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Note / Remarks</label>
                <textarea 
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none text-sm font-medium transition-all resize-none" 
                  placeholder="Enter additional notes here..." 
                  rows={3}
                ></textarea>
              </div>
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                <button 
                  onClick={() => setIsAttachedOpen(!isAttachedOpen)}
                  className="w-full flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <Paperclip className="text-blue-600" size={20} />
                    <span className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Attach Documents</span>
                  </div>
                  <ChevronDown className={`text-slate-400 transition-transform duration-300 ${isAttachedOpen ? 'rotate-180' : ''}`} size={20} />
                </button>
                <AnimatePresence>
                  {isAttachedOpen && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800"
                    >
                      <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-10 text-center">
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Drag and drop files here or click to browse</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Quick Balance Widget */}
        <aside className="space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-200 dark:border-slate-800 p-8 sticky top-32 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600/10 rounded-xl text-blue-600">
                  <Wallet size={20} />
                </div>
                <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Quick Balance</h3>
              </div>
              <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg shadow-blue-600/20">Selected</span>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Current Balance</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-blue-600 tracking-tighter">₹45,200.00</span>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Cr</span>
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-2.5">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-slate-400">Credit Limit</span>
                  <span className="text-slate-900 dark:text-white">₹ 50,000.00</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '90.4%' }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-rose-600 rounded-full"
                  ></motion.div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Remaining Limit</span>
                  <span className="text-xs font-black text-rose-600">₹ 4,800.00</span>
                </div>
              </div>

              <div className="bg-rose-600/5 border border-rose-600/20 rounded-2xl p-4 flex items-start gap-3">
                <AlertTriangle className="text-rose-600 shrink-0" size={18} />
                <p className="text-[11px] text-rose-600 leading-relaxed font-bold uppercase tracking-tight">90% of credit limit used. Approval might be required for new entries.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">30 Day Trend</p>
                <div className="flex items-center gap-1 text-[10px] text-blue-600 font-black uppercase tracking-widest">
                  <TrendingUp size={12} />
                  +12% vs last month
                </div>
              </div>
              <div className="flex items-end gap-1.5 h-12 px-1">
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
              <button className="text-[10px] font-black text-blue-600 flex items-center gap-2 hover:underline uppercase tracking-widest">
                View Statement 
                <ExternalLink size={14} />
              </button>
              <span className="text-[9px] text-slate-400 font-bold italic uppercase tracking-widest">Last updated 2m ago</span>
            </div>
          </div>
        </aside>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-6 pt-10">
        <button className="flex items-center gap-4 px-12 py-5 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/30 hover:scale-105 transition-all active:scale-95">
          <Save size={20} />
          Insert Voucher
        </button>
        <button className="flex items-center gap-4 px-12 py-5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95">
          <RefreshCw size={20} />
          Clear Form
        </button>
      </div>
    </motion.div>
  );
};

const FormInput = ({ label, placeholder }: { label: string, placeholder: string }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</label>
    <input 
      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3.5 px-5 focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none text-sm font-bold transition-all" 
      placeholder={placeholder} 
      type="text" 
    />
  </div>
);

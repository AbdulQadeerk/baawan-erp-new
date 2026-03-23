import React from 'react';
import { 
  Search, 
  Plus, 
  RefreshCw, 
  Download, 
  FileText, 
  Eye, 
  Edit3, 
  Printer,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Tag,
  Building2
} from 'lucide-react';
import { motion } from 'motion/react';

const mockVouchers = [
  { id: '1', no: 'RV-2024-042', date: '12 Oct 2024', party: 'Reliance Industries Ltd.', mode: 'Bank Transfer', amount: 145000.00, status: 'Bank Transfer' },
  { id: '2', no: 'RV-2024-041', date: '12 Oct 2024', party: 'Office Supplies Corp', mode: 'Petty Cash', amount: 12500.00, status: 'Petty Cash' },
  { id: '3', no: 'RV-2024-040', date: '11 Oct 2024', party: 'Acme International', mode: 'HDFC Bank', amount: 230000.00, status: 'HDFC Bank' },
  { id: '4', no: 'RV-2024-039', date: '10 Oct 2024', party: 'Global Tech Solutions', mode: 'ICICI Bank', amount: 62500.00, status: 'ICICI Bank' },
];

interface ReceiptVoucherListProps {
  onCreateNew?: () => void;
}

export const ReceiptVoucherList: React.FC<ReceiptVoucherListProps> = ({ onCreateNew }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 md:p-8 lg:px-20 space-y-8"
    >
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-400">
        <span className="hover:text-primary cursor-pointer">Dashboard</span>
        <ChevronRight size={14} />
        <span className="hover:text-primary cursor-pointer">Accounts</span>
        <ChevronRight size={14} />
        <span className="text-slate-900 dark:text-white">Receipt Vouchers</span>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Receipt Vouchers</h1>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-widest opacity-60 mt-1">Manage and track all customer payments and cash inflows</p>
        </div>
        <button 
          onClick={onCreateNew}
          className="flex items-center justify-center gap-3 px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-rose-600/20 transition-all active:scale-95"
        >
          <Plus size={20} /> Create Receipt
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-end gap-6">
        <div className="flex-1 min-w-[240px] space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Document No</label>
          <div className="relative group">
            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-600 transition-colors" size={18} />
            <input 
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-rose-600/10 focus:border-rose-600 outline-none transition-all" 
              placeholder="e.g. RV-2024-001" 
              type="text"
            />
          </div>
        </div>
        <div className="flex-1 min-w-[240px] space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Search Party</label>
          <div className="relative group">
            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-600 transition-colors" size={18} />
            <input 
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-rose-600/10 focus:border-rose-600 outline-none transition-all" 
              placeholder="Type ledger name..." 
              type="text"
            />
          </div>
        </div>
        <div className="flex-1 min-w-[240px] space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date Range</label>
          <div className="relative group">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-600 transition-colors" size={18} />
            <input 
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-rose-600/10 focus:border-rose-600 outline-none transition-all" 
              placeholder="Jan 01, 2024 - Jan 31, 2024" 
              type="text"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-8 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-widest text-xs rounded-2xl hover:opacity-90 transition-all active:scale-95 shadow-lg">
            Apply Filters
          </button>
          <button className="p-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-600 rounded-2xl transition-all active:scale-95 shadow-sm">
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <th className="px-8 py-5 font-black text-[10px] uppercase tracking-[0.2em]">Sr No.</th>
                <th className="px-8 py-5 font-black text-[10px] uppercase tracking-[0.2em]">Voucher No.</th>
                <th className="px-8 py-5 font-black text-[10px] uppercase tracking-[0.2em]">Date</th>
                <th className="px-8 py-5 font-black text-[10px] uppercase tracking-[0.2em]">Ledger/Account Name</th>
                <th className="px-8 py-5 font-black text-[10px] uppercase tracking-[0.2em]">Payment Mode</th>
                <th className="px-8 py-5 font-black text-[10px] uppercase tracking-[0.2em] text-right">Amount</th>
                <th className="px-8 py-5 font-black text-[10px] uppercase tracking-[0.2em] text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {mockVouchers.map((v, i) => (
                <tr key={v.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-8 py-5 text-xs font-bold text-slate-400">{String(i + 1).padStart(2, '0')}</td>
                  <td className="px-8 py-5 text-sm font-black text-rose-600 uppercase tracking-tight">{v.no}</td>
                  <td className="px-8 py-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{v.date}</td>
                  <td className="px-8 py-5 text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">{v.party}</td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      v.mode === 'Petty Cash' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800' 
                        : 'bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${v.mode === 'Petty Cash' ? 'bg-emerald-500' : 'bg-blue-500'}`}></span>
                      {v.mode}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right font-black text-slate-900 dark:text-white">₹ {v.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-slate-400 hover:text-blue-600 transition-all rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20"><Eye size={18} /></button>
                      <button className="p-2 text-slate-400 hover:text-emerald-600 transition-all rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20"><Edit3 size={18} /></button>
                      <button className="p-2 text-slate-400 hover:text-rose-600 transition-all rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20"><Printer size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-8 py-5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Showing <span className="text-slate-900 dark:text-white">1</span> to <span className="text-slate-900 dark:text-white">10</span> of <span className="text-slate-900 dark:text-white">150</span> records
          </div>
          <div className="flex items-center gap-3">
            <PaginationButton icon={<ChevronLeft size={20} />} disabled />
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 rounded-xl bg-rose-600 text-white font-black text-xs shadow-lg shadow-rose-600/20">1</button>
              <button className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-black text-xs hover:bg-slate-50 transition-all">2</button>
              <button className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-black text-xs hover:bg-slate-50 transition-all">3</button>
            </div>
            <PaginationButton icon={<ChevronRight size={20} />} />
          </div>
        </div>
      </div>

      {/* Summary Footer */}
      <footer className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-12">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Total Vouchers</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">150 Records</span>
          </div>
          <div className="h-12 w-px bg-slate-200 dark:bg-slate-800"></div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Total Collection</span>
            <span className="text-2xl font-black text-rose-600 uppercase tracking-tight">₹ 4,50,000.00</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button className="flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-rose-600 uppercase tracking-widest transition-colors">
            <Download size={16} /> Export Excel
          </button>
          <button className="flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-rose-600 uppercase tracking-widest transition-colors">
            <FileText size={16} /> Export PDF
          </button>
        </div>
      </footer>
    </motion.div>
  );
};

const PaginationButton = ({ icon, disabled = false }: { icon: React.ReactNode, disabled?: boolean }) => (
  <button 
    disabled={disabled}
    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-400 hover:text-rose-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-90 shadow-sm"
  >
    {icon}
  </button>
);

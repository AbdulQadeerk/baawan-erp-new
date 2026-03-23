import React from 'react';
import { 
  ChevronRight, 
  Receipt, 
  CheckCircle, 
  Clock, 
  Search, 
  History, 
  ChevronLeft, 
  Send, 
  Download, 
  FileText, 
  Printer,
  Wallet
} from 'lucide-react';
import { motion } from 'motion/react';
import { BillWiseDrilldown } from '../types';

const mockData: BillWiseDrilldown[] = [
  { id: '1', billDate: '15 Aug 2023', billNo: 'INV/23/00102', dueDate: '30 Aug 2023', overdueDays: 72, billAmount: 250000, adjusted: 0, balance: 250000 },
  { id: '2', billDate: '05 Sep 2023', billNo: 'INV/23/00145', dueDate: '20 Sep 2023', overdueDays: 51, billAmount: 112000, adjusted: 30000, balance: 82000 },
  { id: '3', billDate: '10 Oct 2023', billNo: 'INV/23/00210', dueDate: '25 Oct 2023', overdueDays: 16, billAmount: 85000, adjusted: 0, balance: 85000 },
  { id: '4', billDate: '25 Oct 2023', billNo: 'INV/23/00234', dueDate: '09 Nov 2023', overdueDays: 'Not Due', billAmount: 65410, adjusted: 0, balance: 65410 },
];

export const BillWiseDrilldownScreen: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6 max-w-[1600px] mx-auto"
    >
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2 uppercase tracking-widest font-bold">
            <span className="hover:text-emerald-500 cursor-pointer">Reports</span>
            <ChevronRight size={14} />
            <span className="hover:text-emerald-500 cursor-pointer">Ledger Outstanding</span>
            <ChevronRight size={14} />
            <span className="text-slate-900 dark:text-white font-bold">Bill-wise Drill-down</span>
          </nav>
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Global Tech Solutions Ltd.</h2>
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-bold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 uppercase tracking-widest">GSTIN: 27AABCG1234Z1Z5</span>
          </div>
          <p className="text-slate-500 text-sm mt-1 font-medium">Detailed breakdown of pending and partially paid invoices.</p>
        </div>
        <div className="bg-emerald-500/10 border-2 border-emerald-500/20 p-5 rounded-2xl flex flex-col items-end min-w-[280px] shadow-sm">
          <p className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-[0.2em]">Total Net Outstanding</p>
          <p className="text-4xl font-black text-slate-900 dark:text-white leading-tight mt-1">₹ 4,82,410.00</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard 
          icon={<Receipt className="text-blue-600" size={24} />} 
          label="Total Invoiced" 
          value="₹ 12,50,000.00" 
          color="bg-blue-50 dark:bg-blue-900/20"
        />
        <SummaryCard 
          icon={<CheckCircle className="text-emerald-600" size={24} />} 
          label="Total Paid" 
          value="₹ 7,67,590.00" 
          color="bg-emerald-50 dark:bg-emerald-900/20"
        />
        <SummaryCard 
          icon={<Clock className="text-orange-600" size={24} />} 
          label="Net Outstanding" 
          value="₹ 4,82,410.00" 
          color="bg-orange-50 dark:bg-orange-900/20"
        />
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <h3 className="font-black text-slate-800 dark:text-slate-200 flex items-center gap-2 text-xs uppercase tracking-[0.2em]">
            <Receipt className="text-emerald-500" size={18} />
            Bill-wise Aging Details
          </h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Search size={14} />
              </span>
              <input 
                className="pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none w-64 font-bold transition-all" 
                placeholder="Search Bill No..." 
                type="text"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] min-w-[120px]">Bill Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] min-w-[150px]">Bill No.</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] min-w-[120px]">Due Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">Overdue Days</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Bill Amount</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Adjusted</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Balance</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {mockData.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">{row.billDate}</td>
                  <td className="px-6 py-4">
                    <button className="text-sm font-black text-blue-600 hover:underline uppercase tracking-tight">{row.billNo}</button>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500 dark:text-slate-400">{row.dueDate}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      row.overdueDays === 'Not Due' 
                        ? 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700' 
                        : row.overdueDays > 60 
                          ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                          : row.overdueDays > 30
                            ? 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800'
                            : 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800'
                    }`}>
                      {row.overdueDays === 'Not Due' ? 'Not Due' : `${row.overdueDays} Days`}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-right text-slate-900 dark:text-white">₹ {row.billAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="px-6 py-4 text-sm font-medium text-right text-slate-500 dark:text-slate-400">₹ {row.adjusted.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className={`px-6 py-4 text-sm font-black text-right ${row.balance > 0 ? 'text-red-600' : 'text-slate-900 dark:text-white'}`}>
                    ₹ {row.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all text-slate-400 hover:text-emerald-500 active:scale-90">
                      <History size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/30 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scroll for more transactions</p>
          <div className="flex gap-2">
            <PaginationButton icon={<ChevronLeft size={18} />} disabled />
            <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-500/20">1</button>
            <button className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-black hover:bg-slate-50 transition-all">2</button>
            <PaginationButton icon={<ChevronRight size={18} />} />
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <footer className="bg-yellow-50 dark:bg-slate-800/95 border border-yellow-200 dark:border-slate-700 p-6 rounded-3xl shadow-xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-400/20 rounded-2xl text-yellow-700 dark:text-yellow-400">
              <Wallet size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Balance Outstanding</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">₹ 4,82,410.00</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 active:scale-95">
              <Send size={16} />
              Send Reminder
            </button>
            <div className="w-px h-8 bg-yellow-200 dark:bg-slate-700 mx-2"></div>
            <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-700 dark:text-slate-300 active:scale-95">
              <Download size={16} className="text-emerald-600" />
              Excel
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-700 dark:text-slate-300 active:scale-95">
              <FileText size={16} className="text-rose-600" />
              PDF
            </button>
            <button className="flex items-center gap-2 px-8 py-3 bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg active:scale-95">
              <Printer size={16} />
              Print Report
            </button>
          </div>
        </div>
      </footer>
    </motion.div>
  );
};

const SummaryCard = ({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) => (
  <div className={`p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-5 transition-all hover:shadow-md ${color}`}>
    <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
      <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{value}</p>
    </div>
  </div>
);

const PaginationButton = ({ icon, disabled = false }: { icon: React.ReactNode, disabled?: boolean }) => (
  <button 
    disabled={disabled}
    className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-90"
  >
    {icon}
  </button>
);

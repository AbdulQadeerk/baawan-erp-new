import React from 'react';
import { 
  Search, 
  Plus, 
  RefreshCw, 
  Table as TableIcon, 
  FileText, 
  Edit3, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Coins
} from 'lucide-react';
import { motion } from 'motion/react';
import { Currency } from '../../types';

const mockCurrencies: Currency[] = [
  { id: '1', name: 'Indian Rupee', code: 'INR', symbol: '₹' },
  { id: '2', name: 'US Dollar', code: 'USD', symbol: '$' },
  { id: '3', name: 'Euro', code: 'EUR', symbol: '€' },
  { id: '4', name: 'British Pound', code: 'GBP', symbol: '£' },
];

interface CurrencyListProps {
  onCreateNew?: () => void;
}

export const CurrencyList: React.FC<CurrencyListProps> = ({ onCreateNew }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-6 space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2 uppercase tracking-tighter">
            <Coins size={24} className="text-amber-500" /> Currency Listings
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-black uppercase tracking-[0.2em] opacity-60">Master Management / International Trade</p>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-4 shadow-sm">
        <div className="relative flex-grow max-w-md">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={18} />
          </span>
          <input 
            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-900/20 focus:border-red-900 outline-none transition-all" 
            placeholder="Search Currency Name..." 
            type="text"
          />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all" title="Refresh">
            <RefreshCw size={18} />
          </button>
          <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1"></div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-xl transition-all text-xs font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-800">
            <TableIcon size={16} /> Excel
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-xl transition-all text-xs font-black uppercase tracking-widest border border-rose-100 dark:border-rose-800">
            <FileText size={16} /> PDF
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
                <th className="px-8 py-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] w-32">Actions</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-red-900 transition-colors">Name</div>
                </th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-red-900 transition-colors">Code</div>
                </th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-red-900 transition-colors">Symbol</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {mockCurrencies.map((currency) => (
                <tr key={currency.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-8 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                      <button className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"><Edit3 size={18} /></button>
                      <button className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"><Trash2 size={18} /></button>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">{currency.name}</td>
                  <td className="px-8 py-4 text-sm font-bold text-slate-500 dark:text-slate-400 font-mono">{currency.code}</td>
                  <td className="px-8 py-4 text-lg font-black text-slate-900 dark:text-white">{currency.symbol}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-100 dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Rows:</span>
            <span className="text-sm font-black text-slate-900 dark:text-white">{mockCurrencies.length}</span>
          </div>
          <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700"></div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filtered Rows:</span>
            <span className="text-sm font-black text-blue-600">{mockCurrencies.length}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PaginationButton icon={<ChevronLeft size={20} />} disabled />
          <div className="flex items-center px-4 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
            <span className="text-xs font-black">1</span>
          </div>
          <PaginationButton icon={<ChevronRight size={20} />} />
        </div>
      </div>
    </motion.div>
  );
};

const PaginationButton = ({ icon, disabled = false }: { icon: React.ReactNode, disabled?: boolean }) => (
  <button 
    disabled={disabled}
    className="p-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-red-900 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-90 shadow-sm"
  >
    {icon}
  </button>
);

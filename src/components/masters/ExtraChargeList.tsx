import React from 'react';
import { 
  Search, 
  Plus, 
  RefreshCw, 
  Table as TableIcon, 
  FileText, 
  Edit3, 
  Trash2, 
  Eye,
  Layers,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { ExtraCharge } from '../../types';

const mockCharges: ExtraCharge[] = [
  { id: '1', name: 'Input SGST @ 2.5%', taxType: 'GST', taxPercent: 2.5, ledger: 'Input SGST @ 2.5%' },
  { id: '2', name: 'Output CGST @ 2.5%', taxType: 'GST', taxPercent: 2.5, ledger: 'Output CGST @ 2.5%' },
  { id: '3', name: 'Input @ IGST 12%', taxType: 'IGST', taxPercent: 12, ledger: 'Input @ IGST 12%' },
  { id: '4', name: 'TCS @ 0.75%OLD', taxType: 'None', taxPercent: 0, ledger: 'Firm TCS Paid' },
  { id: '5', name: 'Extra Discount', taxType: 'None', taxPercent: 0, ledger: 'Discount Allowed' },
  { id: '6', name: 'mouse', taxType: 'VAT', taxPercent: 5, ledger: 'CGST' },
];

interface ExtraChargeListProps {
  onCreateNew?: () => void;
}

export const ExtraChargeList: React.FC<ExtraChargeListProps> = ({ onCreateNew }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-6 space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3 uppercase tracking-tighter">
          <div className="bg-rose-600 p-2 rounded-xl shadow-lg shadow-rose-600/20">
            <Layers size={20} className="text-white" />
          </div>
          Extra Charge Listings
          <span className="text-[10px] font-black bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-3 py-1 rounded-full uppercase tracking-widest ml-2">Management</span>
        </h1>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 group-focus-within:text-rose-600 transition-colors">
              <Search size={16} />
            </span>
            <input 
              className="pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-rose-600/20 focus:border-rose-600 outline-none transition-all w-full md:w-64 shadow-sm" 
              placeholder="Search Name..." 
              type="text"
            />
          </div>
          <button className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md active:scale-95">
            <Search size={20} />
          </button>
          <button className="p-2.5 bg-slate-400 text-white rounded-xl hover:bg-slate-500 transition-all shadow-md active:scale-95">
            <RefreshCw size={20} />
          </button>
          <div className="w-[1px] h-8 bg-slate-200 dark:bg-slate-700 mx-1"></div>
          <button className="p-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-md active:scale-95">
            <TableIcon size={20} />
          </button>
          <button className="p-2.5 bg-lime-600 text-white rounded-xl hover:bg-lime-700 transition-all shadow-md active:scale-95">
            <FileText size={20} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 w-32">Actions</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Name</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Tax Type</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 text-right">Tax %</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Ledger</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {mockCharges.map((charge) => (
                <tr key={charge.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group">
                  <td className="px-8 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <button className="text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-1.5 rounded-lg transition-all"><Eye size={18} /></button>
                      <button className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 p-1.5 rounded-lg transition-all"><Edit3 size={18} /></button>
                      <button className="text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 rounded-lg transition-all"><Trash2 size={18} /></button>
                    </div>
                  </td>
                  <td className="px-8 py-4 font-bold text-slate-900 dark:text-slate-100">{charge.name}</td>
                  <td className="px-8 py-4 text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{charge.taxType}</td>
                  <td className="px-8 py-4 text-right font-mono font-black text-slate-700 dark:text-slate-300">₹{charge.taxPercent.toFixed(2)}</td>
                  <td className="px-8 py-4 text-sm text-slate-600 dark:text-slate-400 italic font-medium">{charge.ledger}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <SummaryStat label="Total Rows" value="27" />
            <SummaryStat label="Filtered Rows" value="27" />
          </div>
          <div className="flex items-center gap-2">
            <PaginationButton icon={<ChevronsLeft size={18} />} disabled />
            <PaginationButton icon={<ChevronLeft size={18} />} disabled />
            <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 px-4 uppercase tracking-widest">Page 1 of 1</span>
            <PaginationButton icon={<ChevronRight size={18} />} disabled />
            <PaginationButton icon={<ChevronsRight size={18} />} disabled />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const SummaryStat = ({ label, value }: { label: string, value: string }) => (
  <div className="flex items-center gap-3">
    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">{label}:</span>
    <span className="text-sm font-black text-slate-800 dark:text-white bg-white dark:bg-slate-700 px-4 py-1 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">{value}</span>
  </div>
);

const PaginationButton = ({ icon, disabled = false }: { icon: React.ReactNode, disabled?: boolean }) => (
  <button 
    disabled={disabled}
    className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed active:scale-90"
  >
    {icon}
  </button>
);

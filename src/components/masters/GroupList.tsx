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
  ChevronLeft, 
  ChevronRight,
  Filter,
  FolderTree,
  Network,
  ChevronDown
} from 'lucide-react';
import { motion } from 'motion/react';
import { Group } from '../../types';

const mockGroups: Group[] = [
  { id: '1', name: 'Current Assets', parent: '-', nature: 'Assets', type: 'Dr', modifiedDate: '02/02/2026' },
  { id: '2', name: 'Sundry Debtors', parent: 'Current Assets', nature: 'Assets', type: 'Dr', modifiedDate: '02/02/2026' },
  { id: '3', name: 'Current Liabilities', parent: '-', nature: 'Liabilities', type: 'Cr', modifiedDate: '12/02/2026' },
  { id: '4', name: 'Cash In Hand', parent: 'Current Assets', nature: 'Assets', type: 'Dr', modifiedDate: '02/02/2026' },
  { id: '5', name: 'Direct Expenses', parent: '-', nature: 'Expenses', type: 'Dr', modifiedDate: '14/02/2026' },
  { id: '6', name: 'Sales Incomes', parent: '-', nature: 'Incomes', type: 'Cr', modifiedDate: '10/02/2026' },
];

interface GroupListProps {
  onCreateNew?: () => void;
}

export const GroupList: React.FC<GroupListProps> = ({ onCreateNew }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-3">
            <FolderTree className="text-blue-600" size={28} />
            Group Listings
          </h1>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-widest opacity-60 mt-1">Manage your account group hierarchy and natures.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative min-w-[300px] group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
              <Search size={20} />
            </span>
            <input 
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all shadow-sm" 
              placeholder="Search Group Name..." 
              type="text"
            />
          </div>
          <div className="relative min-w-[180px]">
            <select defaultValue="Assets" className="w-full pl-5 pr-10 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-black uppercase tracking-widest appearance-none focus:ring-4 focus:ring-blue-600/10 outline-none cursor-pointer shadow-sm">
              <option value="All Natures">All Natures</option>
              <option value="Assets">Assets</option>
              <option value="Liabilities">Liabilities</option>
              <option value="Expenses">Expenses</option>
              <option value="Incomes">Incomes</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
          </div>
          <div className="flex items-center gap-3">
            <button className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-all shadow-sm active:scale-95">
              <Filter size={20} />
            </button>
            <button className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-all shadow-sm active:scale-95">
              <RefreshCw size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 w-32 text-center">Actions</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Group Name</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Parent</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Nature</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 w-32">Type</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Modified Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {mockGroups.map((group) => (
                <tr key={group.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-8 py-5 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-4 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded-xl transition-all active:scale-90"><Eye size={18} /></button>
                      <button className="text-slate-400 hover:text-rose-600 p-2 rounded-xl transition-all active:scale-90"><Edit3 size={18} /></button>
                    </div>
                  </td>
                  <td className="px-8 py-5 font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight text-sm">{group.name}</td>
                  <td className="px-8 py-5 text-xs font-bold text-slate-400 italic uppercase tracking-widest">{group.parent}</td>
                  <td className="px-8 py-5">
                    <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getNatureStyles(group.nature)}`}>
                      {group.nature}
                    </span>
                  </td>
                  <td className="px-8 py-5 font-black text-sm text-slate-600 dark:text-slate-400">{group.type}</td>
                  <td className="px-8 py-5 text-xs font-bold text-slate-500 dark:text-slate-400">{group.modifiedDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-10">
            <SummaryStat label="Total Rows" value="14" />
            <SummaryStat label="Filtered Rows" value="14" color="text-blue-600" />
          </div>
          <div className="flex items-center gap-4">
            <PaginationButton icon={<ChevronLeft size={20} />} disabled />
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-xs shadow-lg shadow-blue-600/20">1</button>
              <button className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-black text-xs hover:bg-slate-50 transition-all">2</button>
            </div>
            <PaginationButton icon={<ChevronRight size={20} />} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const getNatureStyles = (nature: string) => {
  switch (nature) {
    case 'Assets': return 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
    case 'Liabilities': return 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800';
    case 'Expenses': return 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800';
    case 'Incomes': return 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800';
    default: return 'bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
  }
};

const SummaryStat = ({ label, value, color = "text-slate-800 dark:text-white" }: { label: string, value: string, color?: string }) => (
  <div className="flex items-center gap-3">
    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">{label}:</span>
    <span className={`px-5 py-1.5 bg-white dark:bg-slate-700 rounded-xl text-xs font-black shadow-sm border border-slate-100 dark:border-slate-800 ${color}`}>{value}</span>
  </div>
);

const PaginationButton = ({ icon, disabled = false }: { icon: React.ReactNode, disabled?: boolean }) => (
  <button 
    disabled={disabled}
    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90 shadow-sm"
  >
    {icon}
  </button>
);

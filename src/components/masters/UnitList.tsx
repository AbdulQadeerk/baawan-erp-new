import React from 'react';
import { 
  Search, 
  Plus, 
  Download, 
  Edit3, 
  Trash2, 
  Eye,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  Layers,
  ChevronDown
} from 'lucide-react';
import { motion } from 'motion/react';
import { Unit } from '../../types';

const mockUnits: Unit[] = [
  { id: '1', name: 'Numbers', category: 'Others', shortName: 'Nos' },
  { id: '2', name: 'Kilogram', category: 'Weight', shortName: 'Kg' },
  { id: '3', name: 'Metere', category: 'Length', shortName: 'Mtrs' },
  { id: '4', name: 'Boxes', category: 'Others', shortName: 'Boxes' },
  { id: '5', name: 'Bag', category: 'Others', shortName: 'Bag' },
  { id: '6', name: 'test', category: 'Weight', shortName: 'kg' },
];

interface UnitListProps {
  onCreateNew?: () => void;
}

export const UnitList: React.FC<UnitListProps> = ({ onCreateNew }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-6 space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <nav className="flex mb-1">
            <ol className="inline-flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <li>Master</li>
              <li className="flex items-center gap-2"><ChevronRight size={12} /> Units</li>
            </ol>
          </nav>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Unit Listings</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white font-black uppercase tracking-widest text-xs rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
            <Download size={18} /> Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
        <div className="md:col-span-5 space-y-2">
          <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest px-1">Search Unit</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={18} />
            </span>
            <input 
              className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all dark:text-white outline-none" 
              placeholder="Search Unit Name..." 
              type="text"
            />
          </div>
        </div>
        <div className="md:col-span-4 space-y-2">
          <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest px-1">Category</label>
          <div className="relative">
            <select className="w-full appearance-none pl-5 pr-12 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all dark:text-white outline-none cursor-pointer">
              <option>-- Select Category --</option>
              <option>Length</option>
              <option>Area</option>
              <option>Volume</option>
              <option>Weight</option>
              <option>Others</option>
            </select>
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <ChevronDown size={18} />
            </span>
          </div>
        </div>
        <div className="md:col-span-3 flex gap-3">
          <button className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center active:scale-95">
            <Filter size={18} className="mr-2" /> Apply
          </button>
          <button className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-2xl hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-all active:scale-95 border border-rose-100 dark:border-rose-900/30" title="Clear Filters">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] w-32">Actions</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Name</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Category</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Short Name</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {mockUnits.map((unit) => (
                <tr key={unit.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group ${unit.name === 'test' ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-slate-400 hover:text-blue-600 transition-all rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20"><Eye size={18} /></button>
                      <button className="p-2 text-slate-400 hover:text-amber-600 transition-all rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/20"><Edit3 size={18} /></button>
                      <button className="p-2 text-slate-400 hover:text-rose-600 transition-all rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20"><Trash2 size={18} /></button>
                    </div>
                  </td>
                  <td className="px-8 py-5 font-black text-slate-800 dark:text-slate-200 text-sm flex items-center gap-3 uppercase tracking-tight">
                    {unit.name}
                    {unit.name === 'test' && <span className="px-2 py-0.5 text-[8px] bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 rounded font-black uppercase tracking-widest">Modified</span>}
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${unit.category === 'Weight' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600' : unit.category === 'Length' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'}`}>
                      {unit.category}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-slate-500 dark:text-slate-400 font-mono text-xs font-black uppercase tracking-widest">{unit.shortName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PaginationButton icon={<ChevronLeft size={20} />} disabled />
            <button className="px-4 py-2 bg-blue-600 text-white text-xs font-black rounded-xl shadow-lg shadow-blue-600/20">1</button>
            <PaginationButton icon={<ChevronRight size={20} />} />
          </div>
          <div className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            Showing 1-8 of 8 entries
          </div>
        </div>
      </div>

      {/* Stats Footer */}
      <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-8 py-4 rounded-3xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-10">
          <SummaryStat label="Total Rows" value="8" />
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>
          <SummaryStat label="Filtered Rows" value="8" color="text-blue-600" />
        </div>
        <div className="flex items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <button className="hover:text-blue-600 transition-colors">Terms of Service</button>
          <span className="opacity-20">•</span>
          <button className="hover:text-blue-600 transition-colors">Privacy Policy</button>
          <span className="opacity-20">•</span>
          <span>© 2025 baawan ERP</span>
        </div>
      </div>
    </motion.div>
  );
};

const SummaryStat = ({ label, value, color = "text-slate-700 dark:text-white" }: { label: string, value: string, color?: string }) => (
  <div className="flex items-center gap-3">
    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
    <span className={`text-lg font-black ${color}`}>{value}</span>
  </div>
);

const PaginationButton = ({ icon, disabled = false }: { icon: React.ReactNode, disabled?: boolean }) => (
  <button 
    disabled={disabled}
    className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-90 shadow-sm"
  >
    {icon}
  </button>
);

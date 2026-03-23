import React from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  Download, 
  Printer, 
  Edit3, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Link as LinkIcon,
  Package
} from 'lucide-react';
import { motion } from 'motion/react';
import { BOM } from '../../types';

const mockBOMs: BOM[] = [
  { id: '1', name: 'BOM', itemCode: 'BOM', itemName: 'Door Buffer', category: 'Wall Mounted', size: '22mm dia', type: 'SS', brand: 'AEKOH', taxPercent: 18, sellRate: 0, unit: 'Nos' },
  { id: '2', name: 'LS MDS (YUC) WK LH', itemCode: 'BOM', itemName: 'Lock Set', category: 'Key', size: '-', type: 'Main Door', brand: 'Dorset', taxPercent: 18, sellRate: 0, unit: 'Set' },
  { id: '3', name: 'No BOM Assigned', itemCode: 'HG5152HSS', itemName: 'Hinges SS', category: 'Welded Type', size: '125*65*2.5mm', type: 'SS', brand: 'Dorset', taxPercent: 18, sellRate: 0, unit: 'NOS' },
  { id: '4', name: 'LS BADS (YUC) WK', itemCode: 'BOM', itemName: 'Lock Set', category: 'Key', size: '-', type: 'Bathroom', brand: '-', taxPercent: 18, sellRate: 0, unit: 'Set' },
];

interface BOMListProps {
  onCreateNew?: () => void;
}

export const BOMList: React.FC<BOMListProps> = ({ onCreateNew }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2 uppercase tracking-tighter">
            <Package size={24} className="text-blue-600" /> Bill Of Materials Master
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-bold uppercase tracking-wider opacity-60">Manage and track high-density multi-level assembly components</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all">
            <LinkIcon size={16} /> Quick Links
          </button>
        </div>
      </div>

      {/* Filters */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <FilterInput label="Search Item / BOM" placeholder="Code or Name..." icon={<Search size={14} />} />
          <FilterSelect label="Category" options={['All Categories', 'Wall Mounted', 'Main Door Set', 'Key']} />
          <FilterSelect label="Size" options={['All Sizes', '22mm dia', '125*65*2.5mm', '12"']} />
          <FilterSelect label="Type" options={['Select Type', 'SS', 'Brass']} />
          <FilterSelect label="Brand" options={['All Brands', 'AEKOH', 'Dorset']} />
          <div className="flex items-end gap-2">
            <button className="flex-1 h-10 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center justify-center transition-all shadow-md active:scale-95">
              <Filter size={18} />
            </button>
            <button className="h-10 w-12 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 flex items-center justify-center transition-all shadow-md active:scale-95">
              <Download size={18} />
            </button>
            <button className="h-10 w-12 bg-amber-500 text-white rounded-xl hover:bg-amber-600 flex items-center justify-center transition-all shadow-md active:scale-95">
              <Printer size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <th className="px-4 py-4 w-10"></th>
                <th className="px-4 py-4 font-black text-[10px] uppercase tracking-[0.2em]">BOM Name</th>
                <th className="px-4 py-4 font-black text-[10px] uppercase tracking-[0.2em]">Item Code</th>
                <th className="px-4 py-4 font-black text-[10px] uppercase tracking-[0.2em]">Item Name</th>
                <th className="px-4 py-4 font-black text-[10px] uppercase tracking-[0.2em]">Category</th>
                <th className="px-4 py-4 font-black text-[10px] uppercase tracking-[0.2em]">Sizes</th>
                <th className="px-4 py-4 font-black text-[10px] uppercase tracking-[0.2em]">Type</th>
                <th className="px-4 py-4 font-black text-[10px] uppercase tracking-[0.2em]">Brand</th>
                <th className="px-4 py-4 font-black text-[10px] uppercase tracking-[0.2em]">Tax%</th>
                <th className="px-4 py-4 font-black text-[10px] uppercase tracking-[0.2em]">Sell Rate</th>
                <th className="px-4 py-4 font-black text-[10px] uppercase tracking-[0.2em]">Std Unit</th>
                <th className="px-4 py-4 font-black text-[10px] uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {mockBOMs.map((bom) => (
                <tr key={bom.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-4 py-3.5 text-center">
                    <button className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-blue-600 transition-colors flex items-center justify-center">
                      <Plus size={14} />
                    </button>
                  </td>
                  <td className="px-4 py-3.5">
                    {bom.name === 'No BOM Assigned' ? (
                      <span className="text-slate-400 italic font-bold text-xs uppercase tracking-wider">No BOM Assigned</span>
                    ) : (
                      <button className="text-blue-600 font-black hover:underline text-xs uppercase tracking-wider">{bom.name}</button>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 font-mono text-xs font-bold">{bom.itemCode}</td>
                  <td className="px-4 py-3.5 font-bold text-slate-800 dark:text-slate-200 text-sm">{bom.itemName}</td>
                  <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{bom.category}</td>
                  <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400 text-xs font-bold">{bom.size}</td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">{bom.type}</span>
                  </td>
                  <td className="px-4 py-3.5 font-bold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider">{bom.brand}</td>
                  <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400 font-bold">{bom.taxPercent.toFixed(2)}</td>
                  <td className="px-4 py-3.5 font-black text-slate-900 dark:text-white">₹{bom.sellRate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400 uppercase text-[10px] font-black tracking-widest">{bom.unit}</td>
                  <td className="px-4 py-3.5 text-right space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"><Edit3 size={16} /></button>
                    <button className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <SummaryItem label="Total BOMs" value="1,248" />
            <div className="h-8 w-px bg-slate-300 dark:bg-slate-700"></div>
            <SummaryItem label="Active Assemblies" value="842" color="text-emerald-500" />
            <div className="h-8 w-px bg-slate-300 dark:bg-slate-700"></div>
            <SummaryItem label="Draft / Pending" value="56" color="text-amber-500" />
          </div>
          <div className="flex items-center gap-2">
            <PaginationButton icon={<ChevronLeft size={18} />} disabled />
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 rounded-lg bg-blue-600 text-white text-xs font-black">1</button>
              <button className="w-8 h-8 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition-colors">2</button>
              <button className="w-8 h-8 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition-colors">3</button>
              <span className="px-1 opacity-40">...</span>
              <button className="w-8 h-8 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition-colors">42</button>
            </div>
            <PaginationButton icon={<ChevronRight size={18} />} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const FilterInput = ({ label, placeholder, icon }: { label: string, placeholder: string, icon: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">{label}</label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
      <input 
        className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" 
        placeholder={placeholder} 
        type="text"
      />
    </div>
  </div>
);

const FilterSelect = ({ label, options }: { label: string, options: string[] }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">{label}</label>
    <select className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer">
      {options.map(opt => <option key={opt}>{opt}</option>)}
    </select>
  </div>
);

const SummaryItem = ({ label, value, color = "text-slate-800 dark:text-white" }: { label: string, value: string, color?: string }) => (
  <div className="flex flex-col">
    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">{label}</span>
    <span className={`text-lg font-black ${color}`}>{value}</span>
  </div>
);

const PaginationButton = ({ icon, disabled = false }: { icon: React.ReactNode, disabled?: boolean }) => (
  <button 
    disabled={disabled}
    className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90"
  >
    {icon}
  </button>
);

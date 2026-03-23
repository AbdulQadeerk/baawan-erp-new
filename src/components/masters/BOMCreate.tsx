import React from 'react';
import { 
  ArrowLeft, 
  Save, 
  RefreshCw, 
  Package, 
  Search, 
  ChevronDown, 
  Info, 
  Layers,
  Plus,
  Trash2,
  Table as TableIcon
} from 'lucide-react';
import { motion } from 'motion/react';

interface BOMCreateProps {
  onBack?: () => void;
}

export const BOMCreate: React.FC<BOMCreateProps> = ({ onBack }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[1400px] mx-auto px-6 py-10 space-y-8"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-600/20">
            <Layers size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Create New BOM</h1>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-wider opacity-60 mt-1">Define assembly components and manufacturing recipes.</p>
          </div>
        </div>
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-xs font-black uppercase tracking-widest shadow-sm active:scale-95"
        >
          <ArrowLeft size={16} />
          Back to BOM List
        </button>
      </div>

      {/* Main Form Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-10 lg:p-14 space-y-12">
          {/* Section 1: BOM Identity */}
          <div className="space-y-8">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-[0.2em]">BOM Identity & Parent Item</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-4 space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">BOM Name <span className="text-rose-500">*</span></label>
                <input 
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all outline-none font-bold text-sm" 
                  placeholder="e.g. Main Door Lock Assembly" 
                  required 
                  type="text"
                />
              </div>
              <div className="md:col-span-5 space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Parent Item <span className="text-rose-500">*</span></label>
                <div className="relative group">
                  <input 
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all outline-none font-bold text-sm pr-12" 
                    placeholder="Search item code or name..." 
                    required 
                    type="text"
                  />
                  <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                </div>
              </div>
              <div className="md:col-span-3 space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Output Quantity <span className="text-rose-500">*</span></label>
                <div className="flex gap-3">
                  <input 
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all outline-none font-bold text-sm" 
                    defaultValue="1" 
                    type="number"
                  />
                  <div className="px-6 py-4 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center">
                    Nos
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Components Table */}
          <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-[0.2em]">Component Items / Raw Materials</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-600/20">
                <Plus size={14} /> Add Component
              </button>
            </div>
            
            <div className="border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                    <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest w-16 text-center">Sr.</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Component Item</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest w-48">Quantity</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest w-48">Unit</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest w-48">Wastage %</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest w-24 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr className="group">
                    <td className="px-8 py-4 text-xs font-bold text-slate-400 text-center">01</td>
                    <td className="px-8 py-4">
                      <div className="relative group/input">
                        <input className="w-full bg-transparent border-none focus:ring-0 font-bold text-sm p-0" placeholder="Select item..." type="text" />
                        <Search className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/input:text-blue-600" size={16} />
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <input className="w-full bg-transparent border-none focus:ring-0 font-bold text-sm p-0" defaultValue="1.00" type="number" />
                    </td>
                    <td className="px-8 py-4">
                      <span className="text-xs font-black uppercase tracking-widest text-slate-400">Nos</span>
                    </td>
                    <td className="px-8 py-4">
                      <input className="w-full bg-transparent border-none focus:ring-0 font-bold text-sm p-0" defaultValue="0.00" type="number" />
                    </td>
                    <td className="px-8 py-4 text-right">
                      <button className="p-2 text-slate-300 hover:text-rose-600 transition-colors"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-10 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-center gap-6">
            <button className="w-full sm:w-64 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-5 px-8 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:opacity-90 transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95" type="submit">
              <Save size={20} />
              Insert BOM
            </button>
            <button className="w-full sm:w-64 bg-blue-600 text-white py-5 px-8 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-blue-600/20 active:scale-95" type="reset">
              <RefreshCw size={20} />
              Clear Form
            </button>
          </div>
        </div>
      </div>

      {/* Footer Credit */}
      <footer className="py-10 text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
        © 2025 baawan.com ERP Systems • Production & Assembly Master
      </footer>
    </motion.div>
  );
};

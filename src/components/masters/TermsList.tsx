import React from 'react';
import { 
  Search, 
  Plus, 
  Download, 
  Edit3, 
  Trash2, 
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  FileText
} from 'lucide-react';
import { motion } from 'motion/react';
import { TermCondition } from '../../types';

const mockTerms: TermCondition[] = [
  { id: '01', title: 'User Access & Responsibility', text: 'Users must log in using valid credentials and are responsible for maintaining the confidentiality of their username and password. Authorized Use Only: The ERP application must be used only for official business purposes. Unauthorized access, data misuse, or sharing of credentials is strictly prohibited.', status: 'Active' },
  { id: '02', title: 'Data Accuracy', text: 'Users are responsible for ensuring that the data entered into the ERP system is accurate, complete, and up to date. The company is not liable for errors caused by incorrect data entry.', status: 'Active' },
  { id: '03', title: 'Data Security & Privacy', text: 'All business data stored in the ERP system is confidential. Users must not download, copy, or share data without proper authorization. System activity is logged for audit purposes.', status: 'Pending' },
];

export const TermsList: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[1400px] mx-auto p-6 space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Terms & Conditions</h1>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-widest opacity-60 mt-1">Manage legal and operational policy texts for your ERP system.</p>
        </div>
        <button className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-3 rounded-xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs shadow-lg shadow-rose-600/20 transition-all active:scale-95">
          <Plus size={20} /> Create New Term
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-4">
        <div className="relative flex-grow max-w-2xl">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={20} />
          </span>
          <input 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-rose-600/10 focus:border-rose-600 outline-none transition-all dark:text-white" 
            placeholder="Search by title or content..." 
            type="text"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="p-3 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all border border-slate-200 dark:border-slate-700 active:scale-95">
            <Filter size={20} />
          </button>
          <button className="p-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all border border-slate-200 dark:border-slate-700 active:scale-95">
            <Download size={20} />
          </button>
          <button className="p-3 text-slate-500 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-all border border-slate-200 dark:border-slate-700 active:scale-95">
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-6">
        <div className="hidden md:grid grid-cols-12 px-8 py-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
          <div className="col-span-1">ID</div>
          <div className="col-span-9">Terms Conditions Text</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {mockTerms.map((term) => (
          <motion.div 
            key={term.id}
            whileHover={{ scale: 1.005 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden hover:border-rose-600/30 dark:hover:border-rose-600/50 transition-all shadow-sm group"
          >
            <div className="p-8 md:grid md:grid-cols-12 items-start gap-6">
              <div className="md:col-span-1 text-xs font-black text-slate-400 mb-4 md:mb-0 uppercase tracking-widest">#{term.id}</div>
              <div className="md:col-span-9 space-y-3">
                <h3 className="text-base font-black text-slate-800 dark:text-slate-200 flex items-center gap-3 uppercase tracking-tight">
                  {term.title}
                  <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${term.status === 'Active' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'}`}>
                    {term.status}
                  </span>
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  {term.text}
                </p>
              </div>
              <div className="md:col-span-2 flex justify-end gap-3 mt-6 md:mt-0">
                <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-blue-600 hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all active:scale-90" title="Edit">
                  <Edit3 size={18} />
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-600 hover:border-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all active:scale-90" title="Delete">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Showing 1 to 3 of 12 entries</p>
        <div className="flex items-center gap-2">
          <PaginationButton icon={<ChevronLeft size={20} />} disabled />
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-rose-600 text-white font-black text-xs shadow-lg shadow-rose-600/20">1</button>
            <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-black text-xs transition-all">2</button>
            <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-black text-xs transition-all">3</button>
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
    className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90 shadow-sm"
  >
    {icon}
  </button>
);

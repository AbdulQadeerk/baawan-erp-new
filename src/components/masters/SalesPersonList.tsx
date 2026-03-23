import React from 'react';
import { 
  Search, 
  PlusCircle, 
  FileText, 
  Table as TableIcon, 
  Edit3, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  RefreshCw,
  Calendar,
  Fullscreen,
  Link as LinkIcon
} from 'lucide-react';
import { motion } from 'motion/react';
import { SalesPerson } from '../../types';

const mockSalesPersons: SalesPerson[] = [
  { id: '1', firstName: 'Akash Pawar', lastName: 'pawar', email: 'snehal.pawar2@propixtech.com', mobile: '+91 3453 454 543' },
  { id: '2', firstName: 'Snehalp', lastName: 'pawar', email: 'snehal.pawar5@propixtech.com', mobile: '+91 657 557 7757' },
  { id: '3', firstName: 'jaydeep patil', lastName: 'patil', email: 'snehal.pawar9@propixtech.com', mobile: '+91 3454 554 544' },
  { id: '4', firstName: 'Snehal', lastName: 'pawar', email: 'snehal.pawar10@propixtech.com', mobile: '+91 3453 453 453' },
];

interface SalesPersonListProps {
  onCreateNew?: () => void;
}

export const SalesPersonList: React.FC<SalesPersonListProps> = ({ onCreateNew }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Sales Person Listings</h1>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-widest opacity-60 mt-1">Manage and monitor your sales team efficiency.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-emerald-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all active:scale-95" title="Export Excel">
            <TableIcon size={18} />
          </button>
          <button className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-rose-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all active:scale-95" title="Export PDF">
            <FileText size={18} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <div className="col-span-1 md:col-span-1 lg:col-span-2 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Search size={18} />
          </span>
          <input 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-rose-600/10 focus:border-rose-600 outline-none transition-all" 
            placeholder="Search Sales Person..." 
            type="text"
          />
        </div>
        <FilterInput placeholder="First Name" />
        <FilterInput placeholder="Last Name" />
        <div className="flex gap-2">
          <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl py-3 shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 active:scale-95">
            <Search size={14} /> Search
          </button>
          <button className="px-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-2xl transition-all active:scale-95" title="Reset Filters">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] w-32">Actions</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">First Name</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Last Name</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Email Address</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Mobile Number</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {mockSalesPersons.map((person) => (
                <tr key={person.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <button className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded-xl transition-all" title="Edit">
                        <Edit3 size={18} />
                      </button>
                      <button className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 p-2 rounded-xl transition-all" title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                  <td className="px-8 py-5 font-black text-slate-900 dark:text-white text-sm uppercase tracking-tight">{person.firstName}</td>
                  <td className="px-8 py-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{person.lastName}</td>
                  <td className="px-8 py-5">
                    <button className="text-blue-600 hover:underline font-bold text-xs lowercase tracking-tight">{person.email}</button>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-4 bg-slate-100 dark:bg-slate-800 rounded-sm flex items-center justify-center text-[8px] font-black">IN</span>
                      <span className="text-slate-700 dark:text-slate-300 font-black text-xs">{person.mobile}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-slate-800/50 px-8 py-5 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-10">
            <SummaryStat label="Total Rows" value={mockSalesPersons.length.toString()} />
            <SummaryStat label="Filtered Rows" value={mockSalesPersons.length.toString()} color="text-rose-600" />
          </div>
          <div className="flex items-center gap-2">
            <PaginationButton icon={<ChevronLeft size={20} />} disabled />
            <span className="text-[10px] font-black text-slate-500 px-4 uppercase tracking-widest">Page 1 of 1</span>
            <PaginationButton icon={<ChevronRight size={20} />} disabled />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const FilterInput = ({ placeholder }: { placeholder: string }) => (
  <input 
    className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-rose-600/10 focus:border-rose-600 outline-none transition-all" 
    placeholder={placeholder} 
    type="text"
  />
);

const SummaryStat = ({ label, value, color = "text-slate-800 dark:text-white" }: { label: string, value: string, color?: string }) => (
  <div className="flex items-center gap-3">
    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">{label}:</span>
    <span className={`px-3 py-1 bg-slate-200 dark:bg-slate-700 rounded-lg text-xs font-black ${color}`}>{value}</span>
  </div>
);

const PaginationButton = ({ icon, disabled = false }: { icon: React.ReactNode, disabled?: boolean }) => (
  <button 
    disabled={disabled}
    className="p-1.5 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90"
  >
    {icon}
  </button>
);

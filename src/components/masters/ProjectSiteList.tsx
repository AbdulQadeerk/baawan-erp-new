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
  MapPin,
  Phone,
  User,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';
import { ProjectSite } from '../../types';

const mockSites: ProjectSite[] = [
  { id: '1', name: 'pune warehouse', address: 'testhghgjds', area: 'test', city: 'BARPETA', state: 'Assam', phone1: '+91 343 45...', phone2: '+91 91334 34444', gstNo: '—', contactPerson: 'snehal p' },
  { id: '2', name: 'Project pune', address: 'test', area: 'nashikphata', city: 'PUNE', state: 'Maharashtra', phone1: '+91 4564 6...', phone2: '+91 565 656 5656', gstNo: '—', contactPerson: 'sandeep patil' },
  { id: '3', name: 'Snehal pawar', address: 'test', area: 'test', city: 'CHANDIGA...', state: 'Chandigarh', phone1: '+91 4545 4...', phone2: '+91 5464 564 565', gstNo: '—', contactPerson: 'Snehal pawar' },
];

interface ProjectSiteListProps {
  onCreateNew?: () => void;
}

export const ProjectSiteList: React.FC<ProjectSiteListProps> = ({ onCreateNew }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex-1">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Project Site Listings</h1>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-widest opacity-60 mt-1">Manage construction sites and delivery locations.</p>
          
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="relative w-full md:max-w-md group">
              <input 
                className="w-full pl-6 pr-12 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all text-sm font-bold outline-none shadow-sm" 
                placeholder="Search Project Site Name..." 
                type="text"
              />
              <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
            </div>
            <div className="flex items-center gap-3">
              <button className="p-3.5 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95">
                <Search size={20} />
              </button>
              <button className="p-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl shadow-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 active:scale-95">
                <RefreshCw size={20} />
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="h-10 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
          <button className="p-3.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl hover:bg-emerald-100 transition-all border border-emerald-100 dark:border-emerald-800 active:scale-90" title="Export to Excel">
            <TableIcon size={20} />
          </button>
          <button className="p-3.5 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-2xl hover:bg-rose-100 transition-all border border-rose-100 dark:border-rose-900 active:scale-90" title="Export to PDF">
            <FileText size={20} />
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1400px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 w-32">Actions</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Name</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Address</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Area</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">City</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">State</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Phone 1</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Phone 2</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">GST No</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Contact Person</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {mockSites.map((site) => (
                <tr key={site.id} className="hover:bg-blue-50/20 dark:hover:bg-blue-900/10 transition-colors group">
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-4 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded-xl transition-all active:scale-90"><Edit3 size={18} /></button>
                      <button className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 p-2 rounded-xl transition-all active:scale-90"><Trash2 size={18} /></button>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{site.name}</td>
                  <td className="px-8 py-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{site.address}</td>
                  <td className="px-8 py-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{site.area}</td>
                  <td className="px-8 py-5 text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{site.city}</td>
                  <td className="px-8 py-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{site.state}</td>
                  <td className="px-8 py-5 text-xs font-black text-slate-600 dark:text-slate-400 font-mono">{site.phone1}</td>
                  <td className="px-8 py-5 text-xs font-black text-slate-600 dark:text-slate-400 font-mono">{site.phone2}</td>
                  <td className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">{site.gstNo}</td>
                  <td className="px-8 py-5 text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">{site.contactPerson}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-10">
            <SummaryStat label="Total Rows" value="3" />
            <SummaryStat label="Filtered Rows" value="3" color="text-rose-600" />
          </div>
          <div className="flex items-center gap-4">
            <PaginationButton icon={<ChevronLeft size={20} />} disabled />
            <span className="text-[10px] font-black text-slate-500 px-6 uppercase tracking-widest">Page 1 of 1</span>
            <PaginationButton icon={<ChevronRight size={20} />} disabled />
          </div>
        </div>
      </div>

      {/* System Status Footer */}
      <footer className="bg-slate-800 text-white px-8 py-2 rounded-2xl flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2"><span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span> Server Connected</span>
          <span className="text-slate-500">|</span>
          <span className="flex items-center gap-2">Last sync: 2 mins ago</span>
        </div>
        <div className="flex items-center gap-6">
          <span>Powered by baawan Platform</span>
          <span className="text-slate-500">v2.4.1</span>
        </div>
      </footer>
    </motion.div>
  );
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

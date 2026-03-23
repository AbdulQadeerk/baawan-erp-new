import React from 'react';
import { 
  Search, 
  Plus, 
  Table as TableIcon, 
  FileText, 
  Edit3, 
  Trash2, 
  Eye,
  ChevronLeft,
  ChevronRight,
  Filter,
  HelpCircle,
  Mail,
  Phone,
  User as UserIcon,
  Shield
} from 'lucide-react';
import { motion } from 'motion/react';
import { User } from '../../types';

const mockUsers: User[] = [
  { id: '1', firstName: 'Snehal', lastName: 'Pawar', designation: 'User_sw', mobile: '-', email: 'snehal.pawar2@propixtech.com', loginName: 'snehalpawar' },
  { id: '2', firstName: 'Pankaj', lastName: 'Patil', designation: 'User_sw', mobile: '-', email: 'pankaj.patil@propixtech.com', loginName: 'pankajpatil' },
  { id: '3', firstName: 'Prathamesh', lastName: 'Patil', designation: 'User_sw', mobile: '-', email: '-', loginName: 'prathameshpatil' },
  { id: '4', firstName: 'testwq', lastName: 'chabuk', designation: 'Administration', mobile: '+91 91195 03337', email: 'shivanichabuk@gmail.com', loginName: 'sqtest' },
];

interface UserListProps {
  onCreateUser?: () => void;
}

export const UserList: React.FC<UserListProps> = ({ onCreateUser }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">User Listings</h1>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-widest opacity-60 mt-1">Manage internal staff accounts and access levels.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all active:scale-95 shadow-sm" title="Export to Excel">
            <TableIcon size={20} />
          </button>
          <button className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all active:scale-95 shadow-sm" title="Export to PDF">
            <FileText size={20} />
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-6">
        <div className="relative flex-grow max-w-md">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={20} />
          </span>
          <input 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-rose-600/10 focus:border-rose-600 dark:text-white outline-none transition-all" 
            placeholder="Search by name, email or login..." 
            type="text"
          />
        </div>
        <div className="flex items-center gap-4">
          <select className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 px-6 py-3 focus:ring-4 focus:ring-rose-600/10 outline-none transition-all cursor-pointer appearance-none">
            <option>All Designations</option>
            <option>User_sw</option>
            <option>Administration</option>
          </select>
          <button className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">First Name</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Last Name</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Designation</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Mobile</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Email</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Login Name</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {mockUsers.map((user) => (
                <tr key={user.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group ${user.designation === 'Administration' ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-4 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button className="text-blue-600 hover:text-blue-700 transition-all active:scale-90" title="View"><Eye size={18} /></button>
                      <button className="text-amber-600 hover:text-amber-700 transition-all active:scale-90" title="Edit"><Edit3 size={18} /></button>
                      <button className="text-rose-600 hover:text-rose-700 transition-all active:scale-90" title="Delete"><Trash2 size={18} /></button>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">{user.firstName}</td>
                  <td className="px-8 py-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{user.lastName}</td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${user.designation === 'Administration' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'}`}>
                      {user.designation}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-xs font-black text-slate-600 dark:text-slate-400">{user.mobile}</td>
                  <td className="px-8 py-5">
                    <button className="text-blue-600 hover:underline font-bold text-xs lowercase tracking-tight">{user.email}</button>
                  </td>
                  <td className="px-8 py-5 text-sm font-black text-slate-700 dark:text-slate-300">{user.loginName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-10">
            <SummaryStat label="Total Rows" value="10" />
            <SummaryStat label="Filtered Rows" value="10" color="text-rose-600" />
          </div>
          <div className="flex items-center gap-4">
            <PaginationButton icon={<ChevronLeft size={20} />} disabled />
            <span className="text-[10px] font-black text-slate-500 px-4 uppercase tracking-widest">Page 1 of 1</span>
            <PaginationButton icon={<ChevronRight size={20} />} disabled />
          </div>
        </div>
      </div>

      {/* Floating Help Button */}
      <button className="fixed bottom-8 right-8 w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-50">
        <HelpCircle size={32} />
      </button>
    </motion.div>
  );
};

const SummaryStat = ({ label, value, color = "text-slate-800 dark:text-white" }: { label: string, value: string, color?: string }) => (
  <div className="flex items-center gap-3">
    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">{label}:</span>
    <span className={`px-4 py-1 bg-white dark:bg-slate-700 rounded-xl text-xs font-black shadow-sm border border-slate-100 dark:border-slate-800 ${color}`}>{value}</span>
  </div>
);

const PaginationButton = ({ icon, disabled = false }: { icon: React.ReactNode, disabled?: boolean }) => (
  <button 
    disabled={disabled}
    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90"
  >
    {icon}
  </button>
);

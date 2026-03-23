import React from 'react';
import { 
  Search, 
  PlusCircle, 
  Filter, 
  FileText, 
  Edit3, 
  Trash2, 
  Key,
  Users,
  ChevronLeft,
  ChevronRight,
  Rocket,
  Bell,
  HelpCircle,
  ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { motion } from 'motion/react';
import { UserRole } from '../../types';

const mockRoles: UserRole[] = [
  { id: '1', name: 'System Administrator', description: 'Full administrative privileges across all modules and system settings.', memberCount: 5 },
  { id: '2', name: 'Project Manager', description: 'Oversee project workflows, tasks, and team member assignments.', memberCount: 12 },
  { id: '3', name: 'Finance Officer', description: 'Dedicated access to payroll, invoices, and accounting reports.', memberCount: 3 },
  { id: '4', name: 'Human Resources', description: 'Manage employee onboarding, sensitive records, and leave requests.', memberCount: 4 },
];

export const UserRoleList: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-[1200px] mx-auto p-6 space-y-10"
    >
      {/* Breadcrumbs & Title Section */}
      <div className="flex flex-col gap-2">
        <nav className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">
          <button className="hover:text-rose-600 transition-colors">Admin</button>
          <ChevronRightIcon size={12} />
          <span className="text-slate-900 dark:text-slate-100">User Roles</span>
        </nav>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-5xl font-black leading-tight tracking-tighter text-slate-900 dark:text-white uppercase">User Role Listing</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider opacity-60">Manage organizational roles, access levels, and member distribution across your workspace.</p>
          </div>
          <button className="flex items-center justify-center gap-3 rounded-full h-14 px-10 bg-rose-600 text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-rose-600/20 hover:scale-105 transition-all active:scale-95">
            <PlusCircle size={20} />
            <span>Create Role</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-6 items-center shadow-sm">
        <div className="relative w-full flex-1">
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={20} />
          </span>
          <input 
            className="w-full pl-14 pr-6 py-4 rounded-full bg-slate-100 dark:bg-slate-800 border-none focus:ring-4 focus:ring-rose-600/10 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 transition-all outline-none" 
            placeholder="Search Role Name..." 
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-3 rounded-full px-8 py-4 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95">
            <Filter size={18} />
            <span>Filters</span>
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-3 rounded-full px-8 py-4 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95">
            <FileText size={18} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Role Table Container */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Role Name</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Description</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Member Count</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {mockRoles.map((role) => (
                <tr key={role.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-8 py-6 align-middle">
                    <div className="flex flex-col gap-1">
                      <span className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{role.name}</span>
                      <span className="text-[9px] text-rose-600 font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Global Access</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 align-middle text-slate-600 dark:text-slate-400 text-sm font-medium max-w-xs truncate">
                    {role.description}
                  </td>
                  <td className="px-8 py-6 align-middle">
                    <button className="relative group/pill flex items-center gap-3 bg-slate-100 dark:bg-slate-800 hover:bg-rose-600/10 hover:text-rose-600 transition-all rounded-full px-5 py-2.5 border border-transparent hover:border-rose-600/20 active:scale-95">
                      <Users size={16} />
                      <span className="text-xs font-black uppercase tracking-widest">{role.memberCount} Members</span>
                    </button>
                  </td>
                  <td className="px-8 py-6 align-middle">
                    <div className="flex justify-end gap-3">
                      <ActionButton icon={<Key size={18} />} color="text-blue-500 bg-blue-50 hover:bg-blue-500" title="Edit Permissions" />
                      <ActionButton icon={<Edit3 size={18} />} color="text-slate-500 bg-slate-100 hover:bg-slate-600" title="Edit Role" />
                      <ActionButton icon={<Trash2 size={18} />} color="text-rose-600 bg-rose-50 hover:bg-rose-600" title="Delete Role" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        <div className="px-8 py-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Showing 4 of 24 roles</span>
          <div className="flex gap-3">
            <PaginationButton icon={<ChevronLeft size={20} />} disabled />
            <button className="size-11 rounded-full bg-rose-600 text-white flex items-center justify-center font-black text-xs shadow-lg shadow-rose-600/20">1</button>
            <button className="size-11 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center bg-white dark:bg-slate-800 hover:bg-slate-100 font-black text-xs transition-all">2</button>
            <button className="size-11 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center bg-white dark:bg-slate-800 hover:bg-slate-100 font-black text-xs transition-all">3</button>
            <PaginationButton icon={<ChevronRight size={20} />} />
          </div>
        </div>
      </div>

      {/* Footer Decorative */}
      <footer className="py-10 text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
        © 2024 baawan.com ERP Systems. All Rights Reserved.
      </footer>
    </motion.div>
  );
};

const ActionButton = ({ icon, color, title }: { icon: React.ReactNode, color: string, title: string }) => (
  <button className={`size-10 rounded-full flex items-center justify-center transition-all shadow-sm hover:text-white active:scale-90 ${color}`} title={title}>
    {icon}
  </button>
);

const PaginationButton = ({ icon, disabled = false }: { icon: React.ReactNode, disabled?: boolean }) => (
  <button 
    disabled={disabled}
    className="size-11 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center bg-white dark:bg-slate-800 text-slate-400 hover:bg-slate-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-90 shadow-sm"
  >
    {icon}
  </button>
);

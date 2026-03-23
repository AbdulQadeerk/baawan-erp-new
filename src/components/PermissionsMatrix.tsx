import React, { useState } from 'react';
import { 
  Users, 
  Shield, 
  Search, 
  Plus, 
  History, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronRight,
  Save,
  RotateCcw,
  FileText,
  CreditCard,
  Package,
  Eye,
  Edit3,
  Trash2,
  CheckCircle2,
  Download,
  Printer,
  MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PermissionAction {
  id: string;
  label: string;
  color: string;
}

const ACTIONS: PermissionAction[] = [
  { id: 'view', label: 'VIEW', color: 'bg-blue-50 text-blue-600 border-blue-100' },
  { id: 'create', label: 'CREATE', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  { id: 'edit', label: 'EDIT', color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
  { id: 'delete', label: 'DELETE', color: 'bg-rose-50 text-rose-600 border-rose-100' },
  { id: 'approve', label: 'APPROVE', color: 'bg-teal-50 text-teal-600 border-teal-100' },
  { id: 'export', label: 'EXPORT', color: 'bg-slate-100 text-slate-600 border-slate-200' },
  { id: 'print', label: 'PRINT', color: 'bg-slate-100 text-slate-600 border-slate-200' },
];

interface Module {
  id: string;
  name: string;
  subModules: SubModule[];
  isOpen: boolean;
}

interface SubModule {
  id: string;
  name: string;
  icon: React.ReactNode;
  permissions: Record<string, boolean>;
}

interface Role {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const ROLES: Role[] = [
  { id: 'super-admin', name: 'Super Admin', description: 'Full system access', icon: <Shield size={18} className="text-brand-red" /> },
  { id: 'accountant', name: 'Accountant', description: 'Finance & Ledgers', icon: <CreditCard size={18} className="text-blue-500" /> },
  { id: 'sales-manager', name: 'Sales Manager', description: 'Quotations & Invoices', icon: <FileText size={18} className="text-emerald-500" /> },
  { id: 'hr-executive', name: 'HR Executive', description: 'Staff & Payroll', icon: <Users size={18} className="text-indigo-500" /> },
  { id: 'warehouse-op', name: 'Warehouse Op', description: 'Inventory & Stock', icon: <Package size={18} className="text-orange-500" /> },
];

const INITIAL_MODULES: Module[] = [
  {
    id: 'sales',
    name: 'SALES MODULE',
    isOpen: true,
    subModules: [
      { id: 'sales-invoices', name: 'Sales Invoices', icon: <FileText size={16} />, permissions: { view: true, create: true, edit: true, approve: true, export: true, print: true } },
      { id: 'quotations', name: 'Quotations', icon: <FileText size={16} />, permissions: { view: true, create: true, print: true } },
    ]
  },
  {
    id: 'finance',
    name: 'FINANCE MODULE',
    isOpen: true,
    subModules: [
      { id: 'general-ledgers', name: 'General Ledgers', icon: <CreditCard size={16} />, permissions: { view: true, export: true, print: true } },
      { id: 'payments-collections', name: 'Payments & Collections', icon: <CreditCard size={16} />, permissions: { view: true, create: true, edit: true, approve: true } },
    ]
  },
  {
    id: 'inventory',
    name: 'INVENTORY MODULE',
    isOpen: true,
    subModules: [
      { id: 'stock-entry', name: 'Stock Entry', icon: <Package size={16} />, permissions: { view: true } },
      { id: 'warehouses', name: 'Warehouses', icon: <Package size={16} />, permissions: { view: true, create: true, edit: true, delete: true, approve: true, export: true, print: true } },
    ]
  }
];

export const PermissionsMatrix: React.FC = () => {
  const [activeRoleId, setActiveRoleId] = useState('super-admin');
  const [modules, setModules] = useState<Module[]>(INITIAL_MODULES);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleModule = (moduleId: string) => {
    setModules(modules.map(m => m.id === moduleId ? { ...m, isOpen: !m.isOpen } : m));
  };

  const togglePermission = (moduleId: string, subModuleId: string, actionId: string) => {
    setModules(modules.map(m => {
      if (m.id === moduleId) {
        return {
          ...m,
          subModules: m.subModules.map(sm => {
            if (sm.id === subModuleId) {
              return {
                ...sm,
                permissions: {
                  ...sm.permissions,
                  [actionId]: !sm.permissions[actionId]
                }
              };
            }
            return sm;
          })
        };
      }
      return m;
    }));
  };

  const selectAllRow = (moduleId: string, subModuleId: string) => {
    setModules(modules.map(m => {
      if (m.id === moduleId) {
        return {
          ...m,
          subModules: m.subModules.map(sm => {
            if (sm.id === subModuleId) {
              const allSelected = ACTIONS.every(a => sm.permissions[a.id]);
              const newPermissions: Record<string, boolean> = {};
              ACTIONS.forEach(a => newPermissions[a.id] = !allSelected);
              return { ...sm, permissions: newPermissions };
            }
            return sm;
          })
        };
      }
      return m;
    }));
  };

  const activeRole = ROLES.find(r => r.id === activeRoleId) || ROLES[0];

  return (
    <div className="flex h-[calc(100vh-112px)] overflow-hidden bg-white dark:bg-slate-900 transition-colors">
      {/* Sidebar - User Roles */}
      <div className="w-72 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/30 dark:bg-slate-900/50">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Users size={20} className="text-brand-red" />
              User Roles
            </h2>
            <button className="text-brand-red text-xs font-bold flex items-center gap-1 hover:underline">
              <Plus size={14} /> New Role
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Filter roles..."
              className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-red/50 transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
          {ROLES.map(role => (
            <button
              key={role.id}
              onClick={() => setActiveRoleId(role.id)}
              className={`w-full text-left p-3 rounded-xl transition-all group relative overflow-hidden ${
                activeRoleId === role.id 
                  ? 'bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700' 
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              {activeRoleId === role.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-red" />
              )}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  activeRoleId === role.id ? 'bg-brand-red/10' : 'bg-slate-100 dark:bg-slate-800'
                }`}>
                  {role.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`text-sm font-bold truncate ${
                    activeRoleId === role.id ? 'text-brand-red' : 'text-slate-900 dark:text-white'
                  }`}>
                    {role.name}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-medium truncate">{role.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
        
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Recent Changes</div>
          <div className="flex items-center gap-2 text-[10px] text-slate-500">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Sales updated (2m ago)
          </div>
        </div>
      </div>

      {/* Main Content - Permissions Matrix */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-900">
        {/* Header */}
        <div className="p-8 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium">
            <span>Settings</span>
            <ChevronRight size={14} />
            <span className="text-brand-red font-bold">Permissions Matrix</span>
          </div>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-1">
                <span className="text-brand-red">{activeRole.name}</span> Permissions
              </h1>
              <p className="text-sm text-slate-500 font-medium">Configure granular module-level access and action rights.</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                <History size={16} className="text-slate-400" />
                Audit Logs
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                <Copy size={16} className="text-slate-400" />
                Clone
              </button>
            </div>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10 bg-white dark:bg-slate-900 shadow-sm">
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="p-6 text-left w-1/3">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-brand-red focus:ring-brand-red" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">MODULES & SUB-MODULES</span>
                  </div>
                </th>
                {ACTIONS.map(action => (
                  <th key={action.id} className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-md text-[10px] font-black tracking-widest ${action.color}`}>
                      {action.label}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {modules.map(module => (
                <React.Fragment key={module.id}>
                  {/* Module Header Row */}
                  <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                    <td colSpan={ACTIONS.length + 1} className="px-6 py-3">
                      <div className="flex items-center justify-between">
                        <button 
                          onClick={() => toggleModule(module.id)}
                          className="flex items-center gap-2 text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest hover:text-brand-red transition-colors"
                        >
                          {module.isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          {module.name}
                        </button>
                        <button className="text-[10px] font-bold text-brand-red hover:underline">Select All Row</button>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Sub-Modules Rows */}
                  <AnimatePresence>
                    {module.isOpen && module.subModules.map(subModule => (
                      <motion.tr 
                        key={subModule.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                      >
                        <td className="px-10 py-4">
                          <div className="flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                            <span className="text-slate-400">{subModule.icon}</span>
                            {subModule.name}
                          </div>
                        </td>
                        {ACTIONS.map(action => {
                          let activeColor = 'bg-blue-600 border-blue-600';
                          if (action.id === 'create' || action.id === 'approve') activeColor = 'bg-emerald-500 border-emerald-500';
                          if (action.id === 'delete') activeColor = 'bg-rose-500 border-rose-500';
                          
                          return (
                            <td key={action.id} className="p-4 text-center">
                              <button
                                onClick={() => togglePermission(module.id, subModule.id, action.id)}
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                  subModule.permissions[action.id]
                                    ? `${activeColor} text-white`
                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'
                                }`}
                              >
                                {subModule.permissions[action.id] && <Check size={12} strokeWidth={4} />}
                              </button>
                            </td>
                          );
                        })}
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">View/Edit Access</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Administrative Access</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Destructive Access</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all">
              <RotateCcw size={18} />
              Reset Changes
            </button>
            <button className="flex items-center gap-2 px-8 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all">
              <CheckCircle2 size={18} />
              Save Permissions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

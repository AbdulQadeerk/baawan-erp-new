import React from 'react';
import { 
  ArrowLeft, 
  Upload, 
  RefreshCw, 
  HelpCircle, 
  Lightbulb, 
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { motion } from 'motion/react';

export const GroupCreate: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto px-6 py-10"
    >
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Create New Group</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-bold uppercase tracking-wider opacity-60">Add a new financial or organizational group to your master list.</p>
        </div>
        <button className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-5 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95">
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
        <div className="p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]" htmlFor="group-name">
                Group Name <span className="text-red-500">*</span>
              </label>
              <input 
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-slate-900 dark:text-white font-bold focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all outline-none" 
                id="group-name" 
                placeholder="Enter group name" 
                required 
                type="text"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]" htmlFor="parent-select">
                Parent Group <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select defaultValue="" className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-slate-900 dark:text-white font-bold focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all appearance-none outline-none cursor-pointer" id="parent-select">
                  <option disabled value="">--Select Parent--</option>
                  <option value="bank">Bank Accounts</option>
                  <option value="bank_od">Bank OD A/c</option>
                  <option value="branch">Branch / Divisions</option>
                  <option value="capital">Capital Account</option>
                  <option value="cash">Cash In Hand</option>
                  <option value="assets">Current Assets</option>
                  <option value="liabilities">Current Liabilities</option>
                  <option value="deposit">Deposit (Asset)</option>
                  <option value="expenses">Direct Expenses</option>
                  <option value="incomes">Direct Incomes</option>
                  <option value="taxes">Duties & Taxes</option>
                  <option value="fixed">Fixed Assets</option>
                </select>
                <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-slate-400">
                  <ChevronDown size={20} />
                </div>
              </div>
            </div>
          </div>

          <div className="my-12 border-t border-slate-100 dark:border-slate-700/50"></div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button className="w-full sm:w-52 flex items-center justify-center gap-3 bg-slate-800 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-900 active:scale-95 transition-all shadow-xl shadow-slate-800/20">
              <Upload size={20} /> Insert Group
            </button>
            <button className="w-full sm:w-52 flex items-center justify-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 active:scale-95 transition-all shadow-xl shadow-blue-600/20">
              <RefreshCw size={20} /> Clear Form
            </button>
          </div>
        </div>
        
        <div className="bg-slate-50 dark:bg-slate-900/50 px-10 py-5 border-t border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 gap-4">
          <div className="flex items-center gap-2">
            <HelpCircle size={14} className="text-blue-500" />
            Fields marked with <span className="text-red-500">*</span> are mandatory.
          </div>
          <div className="flex items-center gap-6 opacity-60">
            <span>Last modified: 02/02/2026</span>
            <span>Version 2.4.1</span>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        <InfoCard 
          icon={<HelpCircle className="text-blue-600 dark:text-blue-400" />} 
          title="What is a Parent Group?" 
          desc="Hierarchical organization for better reporting and balance sheet management."
          color="bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800"
        />
        <InfoCard 
          icon={<Lightbulb className="text-amber-600 dark:text-amber-400" />} 
          title="Pro Tip" 
          desc="Use logical naming conventions to make searching faster for your accounting team."
          color="bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800"
        />
        <InfoCard 
          icon={<ShieldCheck className="text-emerald-600 dark:text-emerald-400" />} 
          title="Audit Trail" 
          desc="Every creation is logged with timestamps for compliance and security."
          color="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800"
        />
      </div>
    </motion.div>
  );
};

const InfoCard = ({ icon, title, desc, color }: { icon: React.ReactNode, title: string, desc: string, color: string }) => (
  <div className={`${color} p-6 rounded-2xl border flex gap-4 shadow-sm`}>
    <div className="shrink-0">{icon}</div>
    <div>
      <h4 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">{title}</h4>
      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{desc}</p>
    </div>
  </div>
);

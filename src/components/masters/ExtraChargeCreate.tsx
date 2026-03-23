import React from 'react';
import { 
  ArrowLeft, 
  Save, 
  RefreshCw, 
  Layers, 
  Search, 
  ChevronDown, 
  Info, 
  FileText,
  Percent,
  DollarSign
} from 'lucide-react';
import { motion } from 'motion/react';

interface ExtraChargeCreateProps {
  onBack?: () => void;
}

export const ExtraChargeCreate: React.FC<ExtraChargeCreateProps> = ({ onBack }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto px-6 py-10 space-y-8"
    >
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Create New Extra Charge</h1>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-wider opacity-60 mt-1">Configure additional taxes, fees, or discounts for your invoices.</p>
        </div>
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-xs font-black uppercase tracking-widest shadow-sm active:scale-95"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden">
        <div className="p-10 space-y-12">
          {/* Section 1: Identity */}
          <div className="space-y-8">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
                <Layers size={20} />
              </div>
              <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-[0.2em]">Identity & Classification</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-4 space-y-3">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Name <span className="text-rose-500">*</span></label>
                <input 
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all outline-none text-sm font-bold" 
                  placeholder="e.g. Service Tax 5%" 
                  type="text"
                />
              </div>
              <div className="md:col-span-5 space-y-3">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Ledger <span className="text-rose-500">*</span></label>
                <div className="relative group">
                  <input 
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all outline-none text-sm font-bold pr-12" 
                    placeholder="Search ledger..." 
                    type="text"
                  />
                  <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={20} />
                </div>
              </div>
              <div className="md:col-span-3 space-y-3">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Tax Type <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <select className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all outline-none text-sm font-bold appearance-none cursor-pointer">
                    <option>None</option>
                    <option>GST</option>
                    <option>IGST</option>
                    <option>VAT</option>
                  </select>
                  <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Calculation Logic */}
          <div className="space-y-8">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="p-2 bg-blue-600/10 rounded-xl text-blue-600">
                <RefreshCw size={20} />
              </div>
              <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-[0.2em]">Calculation Logic</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 rounded-3xl border-2 border-slate-100 dark:border-slate-800 space-y-6 bg-slate-50/30 dark:bg-slate-800/20">
                <div className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded-full border-2 border-blue-600 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                  </div>
                  <span className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest">Is Percent Based?</span>
                </div>
                <div className="space-y-3">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Fixed Percent (%)</label>
                  <div className="relative group">
                    <input 
                      className="w-full px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all outline-none text-sm font-black" 
                      defaultValue="0" 
                      type="number"
                    />
                    <Percent className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                  </div>
                </div>
              </div>

              <div className="p-8 rounded-3xl border-2 border-slate-100 dark:border-slate-800 space-y-6 bg-slate-50/30 dark:bg-slate-800/20 opacity-50 grayscale">
                <div className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded-full border-2 border-slate-300 dark:border-slate-600"></div>
                  <span className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest">Is Amount Based?</span>
                </div>
                <div className="space-y-3">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Fixed Amount ($)</label>
                  <div className="relative group">
                    <input 
                      className="w-full px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all outline-none text-sm font-black" 
                      defaultValue="0.00" 
                      type="number"
                      disabled
                    />
                    <DollarSign className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="bg-emerald-500/5 border-2 border-emerald-500/10 px-8 py-4 rounded-full flex items-center gap-6">
                <span className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">Positive Effect?</span>
                <div className="w-14 h-7 bg-emerald-500 rounded-full relative cursor-pointer shadow-lg shadow-emerald-500/20">
                  <div className="absolute right-1 top-1 w-5 h-5 bg-white rounded-full shadow-sm"></div>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight max-w-[200px] leading-tight">
                  (Charge will be added to total instead of subtracted)
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Additional Notes */}
          <div className="space-y-8">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="p-2 bg-slate-900/10 dark:bg-white/10 rounded-xl text-slate-900 dark:text-white">
                <FileText size={20} />
              </div>
              <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-[0.2em]">Additional Notes</h3>
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Description</label>
              <textarea 
                className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-3xl focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all outline-none text-sm font-medium resize-none" 
                placeholder="Enter any internal notes or details about this charge..." 
                rows={4}
              ></textarea>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-10 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-center gap-6">
            <button className="w-full sm:w-auto px-12 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-sm uppercase tracking-[0.2em] rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-95" type="submit">
              <Save size={20} />
              Insert Charge
            </button>
            <button className="w-full sm:w-auto px-12 py-5 bg-blue-600 text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-4 shadow-2xl shadow-blue-600/20 active:scale-95" type="reset">
              <RefreshCw size={20} />
              Clear Form
            </button>
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/80 px-10 py-5 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <Info size={16} className="text-blue-500" />
            All fields marked with an asterisk (*) are required for submission.
          </div>
        </div>
      </div>
    </motion.div>
  );
};

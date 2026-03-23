import React from 'react';
import { 
  ArrowLeft, 
  Save, 
  RefreshCw, 
  CreditCard, 
  Code, 
  Euro, 
  Info, 
  Globe, 
  Eye, 
  Clock
} from 'lucide-react';
import { motion } from 'motion/react';

interface CurrencyCreateProps {
  onBack?: () => void;
}

export const CurrencyCreate: React.FC<CurrencyCreateProps> = ({ onBack }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto px-6 py-10 space-y-8"
    >
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Create New Currency</h1>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-wider opacity-60 mt-1">Add a new currency for global transactions and reporting.</p>
        </div>
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-xs font-black uppercase tracking-widest shadow-sm active:scale-95"
        >
          <ArrowLeft size={16} />
          Back to Listings
        </button>
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden">
        <div className="p-10">
          <form className="space-y-8">
            <div className="space-y-3">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]" htmlFor="currency-name">
                Currency Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative group">
                <input 
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all outline-none text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600" 
                  id="currency-name" 
                  placeholder="e.g. United States Dollar" 
                  type="text"
                />
                <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none text-slate-400 group-focus-within:text-amber-500 transition-colors">
                  <CreditCard size={20} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]" htmlFor="currency-code">
                  ISO Code <span className="text-rose-500">*</span>
                </label>
                <div className="relative group">
                  <input 
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all outline-none text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 uppercase" 
                    id="currency-code" 
                    placeholder="e.g. USD" 
                    type="text"
                  />
                  <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none text-slate-400 group-focus-within:text-amber-500 transition-colors">
                    <Code size={20} />
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]" htmlFor="currency-symbol">
                  Symbol <span className="text-rose-500">*</span>
                </label>
                <div className="relative group">
                  <input 
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all outline-none text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600" 
                    id="currency-symbol" 
                    placeholder="e.g. $" 
                    type="text"
                  />
                  <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none text-slate-400 group-focus-within:text-amber-500 transition-colors">
                    <Euro size={20} />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="w-full sm:w-auto px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95" type="submit">
                <Save size={18} />
                Insert Currency
              </button>
              <button className="w-full sm:w-auto px-10 py-4 bg-blue-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20 active:scale-95" type="reset">
                <RefreshCw size={18} />
                Clear Form
              </button>
            </div>
          </form>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/80 px-10 py-5 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <Info size={16} className="text-blue-500" />
            All fields marked with an asterisk (*) are required to proceed.
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <InfoCard 
          icon={<Globe size={20} />} 
          title="ISO Standard" 
          desc="Please use standard ISO 4217 codes for better integration with payment gateways." 
          color="blue"
        />
        <InfoCard 
          icon={<Eye size={20} />} 
          title="Display" 
          desc="Symbols are used across invoices and customer-facing reports." 
          color="amber"
        />
        <InfoCard 
          icon={<Clock size={20} />} 
          title="Rates" 
          desc="Currency rates can be updated via the 'Exchange Rates' tool after creation." 
          color="emerald"
        />
      </div>
    </motion.div>
  );
};

const InfoCard = ({ icon, title, desc, color }: { icon: React.ReactNode, title: string, desc: string, color: string }) => (
  <div className={`p-6 rounded-3xl bg-${color}-50 dark:bg-${color}-900/10 border border-${color}-100 dark:border-${color}-800/50 space-y-4 transition-all hover:shadow-md`}>
    <div className={`w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center text-${color}-600 shadow-sm border border-${color}-100/50 dark:border-slate-800`}>
      {icon}
    </div>
    <div>
      <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">{title}</h3>
      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-bold leading-relaxed uppercase tracking-tight opacity-80">{desc}</p>
    </div>
  </div>
);

import React from 'react';
import { 
  ArrowLeft, 
  Save, 
  RefreshCw, 
  Warehouse, 
  MapPin, 
  Phone, 
  Info, 
  ShieldCheck, 
  History,
  ChevronDown
} from 'lucide-react';
import { motion } from 'motion/react';

interface StockPlaceCreateProps {
  onBack?: () => void;
}

export const StockPlaceCreate: React.FC<StockPlaceCreateProps> = ({ onBack }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto px-6 py-10 space-y-8"
    >
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-4 uppercase tracking-tight">
            <div className="bg-blue-600/10 p-3 rounded-2xl text-blue-600">
              <Warehouse size={28} />
            </div>
            Create New Stock Place
          </h1>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-wider opacity-60 mt-1">Fill in the details below to add a new warehouse or storage location.</p>
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
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <form className="p-10 lg:p-14 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]" htmlFor="name">Name <span className="text-red-500">*</span></label>
              <input 
                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all outline-none font-bold text-sm" 
                id="name" 
                placeholder="Warehouse name" 
                required 
                type="text"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]" htmlFor="code">Code <span className="text-red-500">*</span></label>
              <input 
                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all outline-none font-bold text-sm uppercase" 
                id="code" 
                placeholder="Unique location code" 
                required 
                type="text"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]" htmlFor="address1">Address Line 1</label>
              <textarea 
                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all outline-none font-bold text-sm resize-none" 
                id="address1" 
                placeholder="Street, building, etc." 
                rows={3}
              ></textarea>
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]" htmlFor="address2">Address Line 2</label>
              <textarea 
                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all outline-none font-bold text-sm resize-none" 
                id="address2" 
                placeholder="Landmark, apartment, suite" 
                rows={3}
              ></textarea>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]" htmlFor="state">State <span className="text-red-500">*</span></label>
              <div className="relative">
                <select className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all outline-none font-bold text-sm appearance-none cursor-pointer" id="state" required>
                  <option value="">Select State</option>
                  <option value="MH">Maharashtra</option>
                  <option value="DL">Delhi</option>
                  <option value="KA">Karnataka</option>
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]" htmlFor="city">City <span className="text-red-500">*</span></label>
              <input className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all outline-none font-bold text-sm" id="city" placeholder="City name" required type="text" />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]" htmlFor="area">Area <span className="text-red-500">*</span></label>
              <input className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all outline-none font-bold text-sm" id="area" placeholder="Locality" required type="text" />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]" htmlFor="pin">Pin Code</label>
              <input className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all outline-none font-bold text-sm" id="pin" placeholder="123456" type="text" />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]" htmlFor="mobile">Mobile</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                  <span className="text-xs font-black text-slate-400">+91</span>
                </div>
                <input className="w-full pl-16 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all outline-none font-bold text-sm" id="mobile" placeholder="Phone" type="tel" />
                <Phone className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 pt-6 border-t border-slate-100 dark:border-slate-800">
            <button className="w-full sm:w-auto px-12 py-5 bg-slate-800 dark:bg-white text-white dark:text-slate-900 font-black text-sm uppercase tracking-[0.2em] rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-95" type="submit">
              <Save size={20} />
              Insert Place
            </button>
            <button className="w-full sm:w-auto px-12 py-5 bg-blue-600 text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-4 shadow-2xl shadow-blue-600/20 active:scale-95" type="reset">
              <RefreshCw size={20} />
              Clear Form
            </button>
          </div>
        </form>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 opacity-60">
        <InfoCard 
          icon={<Info size={20} />} 
          title="Stock Validation" 
          desc="All addresses are validated against the regional postal database for accuracy." 
          color="blue"
        />
        <InfoCard 
          icon={<ShieldCheck size={20} />} 
          title="Permissions" 
          desc="New stock places will be visible to warehouse managers in your organizational hierarchy." 
          color="emerald"
        />
        <InfoCard 
          icon={<History size={20} />} 
          title="Audit Trail" 
          desc="Changes to stock locations are logged for compliance and security auditing." 
          color="purple"
        />
      </div>

      {/* Footer Credit */}
      <footer className="py-10 text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
        © 2025 baawan.com ERP Systems • Warehouse Management Suite
      </footer>
    </motion.div>
  );
};

const InfoCard = ({ icon, title, desc, color }: { icon: React.ReactNode, title: string, desc: string, color: string }) => (
  <div className={`p-6 rounded-3xl bg-${color}-50 dark:bg-${color}-900/10 border border-${color}-100 dark:border-${color}-800/50 flex items-start gap-4 transition-all hover:shadow-md`}>
    <div className={`p-2 bg-white dark:bg-slate-900 rounded-xl text-${color}-600 shadow-sm border border-${color}-100/50 dark:border-slate-800`}>
      {icon}
    </div>
    <div>
      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 mb-1">{title}</h4>
      <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed uppercase tracking-tight">{desc}</p>
    </div>
  </div>
);

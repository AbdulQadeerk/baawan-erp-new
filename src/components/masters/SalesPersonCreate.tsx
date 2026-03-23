import React from 'react';
import { 
  ArrowLeft, 
  Save, 
  RefreshCw, 
  UserPlus, 
  Mail, 
  Phone, 
  Info,
  ExternalLink
} from 'lucide-react';
import { motion } from 'motion/react';

interface SalesPersonCreateProps {
  onBack?: () => void;
}

export const SalesPersonCreate: React.FC<SalesPersonCreateProps> = ({ onBack }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto px-6 py-10 space-y-8"
    >
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-4 uppercase tracking-tight">
          <div className="bg-blue-600/10 p-3 rounded-2xl text-blue-600">
            <UserPlus size={28} />
          </div>
          Create New Sales Person
        </h1>
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-xs font-black uppercase tracking-widest shadow-sm active:scale-95"
        >
          <ArrowLeft size={16} />
          Back to List
        </button>
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-10 lg:p-14">
          <form className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]" htmlFor="first_name">First Name <span className="text-red-500">*</span></label>
                  <input 
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all outline-none font-bold text-sm" 
                    id="first_name" 
                    placeholder="Enter first name" 
                    required 
                    type="text"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]" htmlFor="last_name">Last Name <span className="text-red-500">*</span></label>
                  <input 
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all outline-none font-bold text-sm" 
                    id="last_name" 
                    placeholder="Enter last name" 
                    required 
                    type="text"
                  />
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]" htmlFor="email">Email Address <span className="text-red-500">*</span></label>
                  <div className="relative group">
                    <input 
                      className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all outline-none font-bold text-sm" 
                      id="email" 
                      placeholder="example@company.com" 
                      required 
                      type="email"
                    />
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]" htmlFor="mobile">Mobile Number</label>
                  <div className="flex gap-3">
                    <div className="flex items-center px-4 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-600 dark:text-slate-300 space-x-2">
                      <span className="text-sm font-bold">🇮🇳 +91</span>
                    </div>
                    <div className="relative flex-1 group">
                      <input 
                        className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all outline-none font-bold text-sm" 
                        id="mobile" 
                        placeholder="9876543210" 
                        type="tel"
                      />
                      <Phone className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-600/5 dark:bg-blue-600/10 border border-blue-600/20 rounded-3xl p-6 flex items-start gap-4">
              <Info className="text-blue-600 shrink-0 mt-0.5" size={20} />
              <p className="text-xs text-blue-700 dark:text-blue-300 font-bold leading-relaxed uppercase tracking-tight">
                Creating a new sales person will automatically generate credentials and send an invitation email to the address provided above.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6 border-t border-slate-100 dark:border-slate-800">
              <button className="w-full sm:w-auto px-12 py-5 bg-slate-800 dark:bg-white text-white dark:text-slate-900 font-black text-sm uppercase tracking-[0.2em] rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95" type="submit">
                <Save size={20} />
                Insert Record
              </button>
              <button className="w-full sm:w-auto px-12 py-5 bg-blue-600 text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-blue-600/20 active:scale-95" type="reset">
                <RefreshCw size={20} />
                Clear Form
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer Credit */}
      <footer className="py-10 text-center space-y-4">
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] opacity-40">© 2025 baawan.com ERP Solution • Sales Force Management</p>
        <div className="flex items-center justify-center gap-6">
          <FooterLink label="User Guide" />
          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
          <FooterLink label="Support" />
          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
          <FooterLink label="Policy" />
        </div>
      </footer>
    </motion.div>
  );
};

const FooterLink = ({ label }: { label: string }) => (
  <button className="text-[10px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors flex items-center gap-1">
    {label}
    <ExternalLink size={10} />
  </button>
);

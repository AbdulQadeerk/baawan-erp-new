import React from 'react';
import { 
  ArrowLeft, 
  Save, 
  RefreshCw, 
  MapPin, 
  User, 
  Phone, 
  Info, 
  ShieldCheck, 
  History,
  ChevronDown,
  CheckCircle2,
  Globe
} from 'lucide-react';
import { motion } from 'motion/react';

interface ProjectSiteCreateProps {
  onBack?: () => void;
}

export const ProjectSiteCreate: React.FC<ProjectSiteCreateProps> = ({ onBack }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto px-6 py-10 space-y-8"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <nav className="flex text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
            <span>Master</span>
            <span className="mx-2">/</span>
            <span className="text-blue-600">Project Site</span>
          </nav>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Create New Project Site</h1>
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
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <form className="space-y-0">
          {/* Section 1: General Info */}
          <div className="p-10 lg:p-14 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-10">
              <div className="p-2 bg-blue-600/10 rounded-xl text-blue-600">
                <Info size={20} />
              </div>
              <h2 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-[0.2em]">General Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Name <span className="text-rose-500">*</span></label>
                <input 
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all outline-none font-bold text-sm" 
                  placeholder="Enter site name" 
                  required 
                  type="text"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Contact Person</label>
                <div className="relative group">
                  <input 
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all outline-none font-bold text-sm pr-12" 
                    placeholder="Enter full name" 
                    type="text"
                  />
                  <User className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Location Details */}
          <div className="p-10 lg:p-14 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-10">
              <div className="p-2 bg-emerald-600/10 rounded-xl text-emerald-600">
                <MapPin size={20} />
              </div>
              <h2 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-[0.2em]">Location Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              <div className="md:col-span-2 lg:col-span-3 space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Address</label>
                <textarea 
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-3xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all outline-none font-bold text-sm resize-none" 
                  placeholder="Street address, building name..." 
                  rows={2}
                ></textarea>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Area</label>
                <input className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all outline-none font-bold text-sm" placeholder="Locality / Area" type="text" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">City <span className="text-rose-500">*</span></label>
                <input className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all outline-none font-bold text-sm" placeholder="City name" required type="text" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">State <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <select defaultValue="" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all outline-none font-bold text-sm appearance-none cursor-pointer" required>
                    <option disabled value="">Select State</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Assam">Assam</option>
                    <option value="Chandigarh">Chandigarh</option>
                    <option value="Delhi">Delhi</option>
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Pin Code</label>
                <input className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all outline-none font-bold text-sm" placeholder="6-digit code" type="text" />
              </div>
            </div>
          </div>

          {/* Section 3: Contact & Statutory */}
          <div className="p-10 lg:p-14 bg-slate-50/30 dark:bg-slate-800/20">
            <div className="flex items-center gap-3 mb-10">
              <div className="p-2 bg-purple-600/10 rounded-xl text-purple-600">
                <ShieldCheck size={20} />
              </div>
              <h2 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-[0.2em]">Contact & Statutory</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Phone 1 <span className="text-rose-500">*</span></label>
                <div className="relative group">
                  <input className="w-full px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all outline-none font-bold text-sm pr-12" placeholder="+91 XXXXX XXXXX" required type="tel" />
                  <Phone className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Phone 2</label>
                <div className="relative group">
                  <input className="w-full px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all outline-none font-bold text-sm pr-12" placeholder="+91 XXXXX XXXXX" type="tel" />
                  <Phone className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">GST No.</label>
                <div className="relative group">
                  <input className="w-full px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all outline-none font-bold text-sm pr-12 uppercase" placeholder="22AAAAA0000A1Z5" type="text" />
                  <Globe className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-10 lg:p-14 bg-slate-100 dark:bg-slate-800/50 flex flex-col sm:flex-row items-center justify-center gap-6">
            <button className="w-full sm:w-64 bg-slate-800 dark:bg-white text-white dark:text-slate-900 py-5 px-8 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:opacity-90 transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95" type="submit">
              <CheckCircle2 size={20} />
              Insert Site
            </button>
            <button className="w-full sm:w-64 bg-blue-600 text-white py-5 px-8 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-blue-600/20 active:scale-95" type="reset">
              <RefreshCw size={20} />
              Clear Form
            </button>
          </div>
        </form>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2"><History size={14} /> Last updated: 14:23 PM</span>
          <span className="flex items-center gap-2">IP: 192.168.1.104</span>
        </div>
        <div>
          System Version v4.2.1
        </div>
      </div>
    </motion.div>
  );
};

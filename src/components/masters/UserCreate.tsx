import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Save, 
  RefreshCw, 
  UserPlus, 
  Eye, 
  EyeOff, 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  Info,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';

interface UserCreateProps {
  onBack?: () => void;
}

export const UserCreate: React.FC<UserCreateProps> = ({ onBack }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showEmailPassword, setShowEmailPassword] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[1400px] mx-auto px-6 py-8 space-y-8"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <nav className="flex text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
            <span className="hover:text-primary cursor-pointer">User Management</span>
            <span className="mx-2">/</span>
            <span className="text-slate-900 dark:text-white">Create New User</span>
          </nav>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3 uppercase tracking-tight">
            <UserPlus className="text-primary" size={28} />
            Create New User
          </h1>
        </div>
        <button 
          onClick={onBack}
          className="inline-flex items-center gap-2 px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95"
        >
          <ArrowLeft size={16} /> Back to List
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: User Details */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-sm font-black mb-8 pb-3 border-b border-slate-100 dark:border-slate-800 uppercase tracking-widest text-slate-800 dark:text-slate-200">User Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormInput label="First Name" placeholder="Enter first name" required />
              <FormInput label="Last Name" placeholder="Enter last name" required />
              
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Designation <span className="text-red-500">*</span></label>
                <select className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none appearance-none font-bold text-sm">
                  <option>Select Designation</option>
                  <option>User_sw</option>
                  <option>Administration</option>
                </select>
              </div>

              <FormInput label="Login Name" placeholder="Choose login name" required />

              <PasswordInput 
                label="Password" 
                show={showPassword} 
                toggle={() => setShowPassword(!showPassword)} 
              />
              
              <PasswordInput 
                label="Confirm Password" 
                show={showConfirmPassword} 
                toggle={() => setShowConfirmPassword(!showConfirmPassword)} 
              />

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Email Id</label>
                <div className="relative group">
                  <input 
                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-bold text-sm pr-12" 
                    placeholder="example@baawan.com" 
                    type="email"
                  />
                  <Mail className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                </div>
              </div>

              <PasswordInput 
                label="Email Password" 
                show={showEmailPassword} 
                toggle={() => setShowEmailPassword(!showEmailPassword)} 
              />

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Mobile</label>
                <div className="flex gap-3">
                  <span className="inline-flex items-center px-4 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold">
                    🇮🇳
                  </span>
                  <div className="relative flex-1 group">
                    <input 
                      className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-bold text-sm pr-12" 
                      placeholder="+91 00000 00000" 
                      type="text"
                    />
                    <Phone className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                  </div>
                </div>
              </div>

              <FormInput label="Ledger" placeholder="Search ledger..." icon={<Search size={18} />} />

              <div className="md:col-span-2 space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Address</label>
                <div className="relative group">
                  <textarea 
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-3xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none resize-none font-bold text-sm pr-12" 
                    placeholder="Full residential or office address" 
                    rows={3}
                  ></textarea>
                  <MapPin className="absolute right-5 top-5 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                </div>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-6 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800/50">
              <Checkbox label="Is Ledger" />
              <Checkbox label="Is Employee" />
              <Checkbox label="Block" color="text-red-500" />
              <Checkbox label="Delete" color="text-red-500" />
            </div>
          </div>
        </div>

        {/* Right Column: User Roles */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm h-full flex flex-col">
            <h2 className="text-sm font-black mb-8 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between uppercase tracking-widest text-slate-800 dark:text-slate-200">
              User Roles
              <span className="text-[9px] font-black text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full uppercase tracking-widest">Assign Roles</span>
            </h2>
            <div className="space-y-2 flex-1 overflow-y-auto max-h-[500px] custom-scrollbar pr-2">
              <RoleItem label="Snehalpa" desc="Standard user access" />
              <RoleItem label="sq" desc="Security query access" />
              <RoleItem label="Super Admin" desc="Full system permissions" checked />
              <RoleItem label="user" desc="Basic limited access" />
              <RoleItem label="Accountant" desc="Financial reporting access" />
              <RoleItem label="Sales Rep" desc="Order entry and CRM access" />
            </div>
          </div>
        </div>

        {/* Bottom Section: Remarks */}
        <div className="lg:col-span-12">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Description / Remarks</label>
            <textarea 
              className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-3xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none resize-none font-bold text-sm" 
              placeholder="Add additional user notes or professional details..." 
              rows={4}
            ></textarea>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
        <button className="w-full sm:w-auto min-w-[200px] px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 shadow-2xl hover:opacity-90 transition-all active:scale-95">
          <Save size={20} />
          Insert User
        </button>
        <button className="w-full sm:w-auto min-w-[200px] px-10 py-4 bg-primary text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 shadow-2xl shadow-primary/20 hover:bg-blue-700 transition-all active:scale-95">
          <RefreshCw size={20} />
          Clear Form
        </button>
      </div>

      {/* Footer Credit */}
      <footer className="py-10 text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
        © 2024 baawan.com ERP v4.2.0 • User Management Suite
      </footer>
    </motion.div>
  );
};

const FormInput = ({ label, placeholder, required = false, icon }: any) => (
  <div className="space-y-2">
    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative group">
      <input 
        className={`w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-bold text-sm ${icon ? 'pr-12' : ''}`} 
        placeholder={placeholder} 
        type="text"
      />
      {icon && <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">{icon}</div>}
    </div>
  </div>
);

const PasswordInput = ({ label, show, toggle }: any) => (
  <div className="space-y-2">
    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</label>
    <div className="relative group">
      <input 
        className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-bold text-sm pr-12" 
        placeholder="********" 
        type={show ? "text" : "password"}
      />
      <button 
        type="button"
        onClick={toggle}
        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  </div>
);

const Checkbox = ({ label, color = "text-slate-600 dark:text-slate-400" }: any) => (
  <label className="flex items-center gap-3 cursor-pointer group">
    <div className="relative flex items-center justify-center">
      <input 
        className="peer w-6 h-6 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary focus:ring-4 focus:ring-primary/10 transition-all appearance-none checked:bg-primary checked:border-primary" 
        type="checkbox"
      />
      <CheckCircle2 className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" size={14} />
    </div>
    <span className={`text-xs font-black uppercase tracking-widest ${color} group-hover:text-primary transition-colors`}>{label}</span>
  </label>
);

const RoleItem = ({ label, desc, checked = false }: any) => (
  <label className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl cursor-pointer transition-all group border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
    <div className="relative flex items-center justify-center">
      <input 
        className="peer w-6 h-6 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary focus:ring-4 focus:ring-primary/10 transition-all appearance-none checked:bg-primary checked:border-primary" 
        type="checkbox"
        defaultChecked={checked}
      />
      <Shield className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" size={14} />
    </div>
    <div className="flex flex-col">
      <span className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">{label}</span>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-60">{desc}</span>
    </div>
  </label>
);

const Search = ({ size, className }: any) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

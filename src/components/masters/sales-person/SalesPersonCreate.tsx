import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, RefreshCw, UserCircle2, Info, UserCheck, Smartphone, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import { salesPersonApi, type SalesPersonRecord } from '../../../services/sales-person.service';
import { toast } from '../../../lib/toast';

interface SalesPersonCreateProps {
  onBack?: () => void;
  editId?: number | null;
  onSaved?: (record: SalesPersonRecord, isUpdate: boolean) => void;
}

export const SalesPersonCreate: React.FC<SalesPersonCreateProps> = ({ onBack, editId, onSaved }) => {
  const [formData, setFormData] = useState<Partial<SalesPersonRecord>>({
    first_Name: '',
    lastname: '',
    email_ID: '',
    mobileNo: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (editId) {
      loadData(editId);
    }
  }, [editId]);

  async function loadData(id: number) {
    setIsLoading(true);
    try {
      const data = await salesPersonApi.getById(id);
      setFormData(data);
    } catch (err: any) {
      if (!err?._processedByInterceptor) {
        toast.error(err?.message || 'Failed to load details.');
      }
      onBack?.();
    } finally {
      setIsLoading(false);
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const nameRegex = /^[a-zA-Z\s.-]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.first_Name?.trim()) {
      newErrors.first_Name = 'This value is required.';
    } else if (!nameRegex.test(formData.first_Name)) {
      newErrors.first_Name = 'First Name can only contain letters, spaces, dots, and hyphens.';
    }

    if (!formData.lastname?.trim()) {
      newErrors.lastname = 'This value is required.';
    } else if (!nameRegex.test(formData.lastname)) {
      newErrors.lastname = 'Last Name can only contain letters, spaces, dots, and hyphens.';
    }

    if (!formData.email_ID?.trim()) {
      newErrors.email_ID = 'This value is required.';
    } else if (!emailRegex.test(formData.email_ID)) {
      newErrors.email_ID = 'Please enter a valid email address.';
    }

    if (!formData.mobileNo?.trim()) {
      newErrors.mobileNo = 'This value is required.';
    } else if (formData.mobileNo.replace(/\D/g, '').length < 10) {
      newErrors.mobileNo = 'Invalid phone number format.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    try {
      const payload: Partial<SalesPersonRecord> = {
        first_Name: formData.first_Name?.trim() || '',
        lastname: formData.lastname?.trim() || '',
        email_ID: formData.email_ID?.trim() || '',
        mobileNo: formData.mobileNo?.trim() || ''
      };

      let newId = editId;
      if (editId) {
        await salesPersonApi.update({ ...payload, id: editId });
        toast.success('Record updated successfully.', 'Success');
      } else {
        newId = await salesPersonApi.create(payload as Omit<SalesPersonRecord, 'id' | 'user_ID'>);
        toast.success('Record created successfully.', 'Success');
      }

      const savedRecord: SalesPersonRecord = {
        user_ID: editId ? editId : newId!,
        id: editId ? editId : newId!,
        ...payload as Required<Pick<SalesPersonRecord, keyof typeof payload>>
      };

      onSaved?.(savedRecord, !!editId);
      onBack?.();
    } catch (err: any) {
      if (!err?._processedByInterceptor) {
        toast.info(err?.message || 'Save failed.', 'Info');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear the form?')) {
      if (editId) {
        loadData(editId);
      } else {
        setFormData({ first_Name: '', lastname: '', email_ID: '', mobileNo: '' });
        setErrors({});
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto px-6 py-10 space-y-8"
    >
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-violet-500 rounded-2xl text-white shadow-lg shadow-violet-500/20">
            <UserCircle2 size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
              {editId ? 'Edit Sales Person' : 'Create Sales Person'}
            </h1>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-wider opacity-60 mt-1">
              {editId ? 'Update executive profile details.' : 'Register a new sales executive to your team.'}
            </p>
          </div>
        </div>
        <button
          onClick={onBack}
          disabled={isSaving || isLoading}
          className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-xs font-black uppercase tracking-widest shadow-sm active:scale-95 disabled:opacity-50"
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-10 lg:p-16">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* First Name */}
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]" htmlFor="first-name">
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="first-name"
                    disabled={isLoading}
                    className={`w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border ${
                      errors.first_Name ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/10' : 'border-slate-200 dark:border-slate-700 focus:border-violet-500 focus:ring-violet-500/10'
                    } rounded-2xl focus:ring-4 transition-all outline-none font-bold text-sm`}
                    placeholder="Enter first name"
                    type="text"
                    value={formData.first_Name || ''}
                    onChange={(e) => {
                      setFormData({ ...formData, first_Name: e.target.value });
                      if (errors.first_Name) setErrors({ ...errors, first_Name: '' });
                    }}
                  />
                  {errors.first_Name && (
                    <span className="text-xs font-bold text-rose-500 mt-1 block px-2">
                      {errors.first_Name}
                    </span>
                  )}
                </div>

                {/* Last Name */}
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]" htmlFor="last-name">
                    Last Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="last-name"
                    disabled={isLoading}
                    className={`w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border ${
                      errors.lastname ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/10' : 'border-slate-200 dark:border-slate-700 focus:border-violet-500 focus:ring-violet-500/10'
                    } rounded-2xl focus:ring-4 transition-all outline-none font-bold text-sm`}
                    placeholder="Enter last name"
                    type="text"
                    value={formData.lastname || ''}
                    onChange={(e) => {
                      setFormData({ ...formData, lastname: e.target.value });
                      if (errors.lastname) setErrors({ ...errors, lastname: '' });
                    }}
                  />
                  {errors.lastname && (
                    <span className="text-xs font-bold text-rose-500 mt-1 block px-2">
                      {errors.lastname}
                    </span>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]" htmlFor="email">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative group">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-violet-500 transition-colors">
                      <Mail size={16} />
                    </span>
                    <input
                      id="email"
                      disabled={isLoading}
                      className={`w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 border ${
                        errors.email_ID ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/10' : 'border-slate-200 dark:border-slate-700 focus:border-violet-500 focus:ring-violet-500/10'
                      } rounded-2xl focus:ring-4 transition-all outline-none font-bold text-sm`}
                      placeholder="e.g. john.doe@example.com"
                      type="email"
                      value={formData.email_ID || ''}
                      onChange={(e) => {
                        setFormData({ ...formData, email_ID: e.target.value });
                        if (errors.email_ID) setErrors({ ...errors, email_ID: '' });
                      }}
                    />
                  </div>
                  {errors.email_ID && (
                    <span className="text-xs font-bold text-rose-500 mt-1 block px-2">
                      {errors.email_ID}
                    </span>
                  )}
                </div>

                {/* Mobile No */}
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]" htmlFor="mobile">
                    Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative group">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-violet-500 transition-colors">
                      <Smartphone size={16} />
                    </span>
                    <input
                      id="mobile"
                      disabled={isLoading}
                      className={`w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 border ${
                        errors.mobileNo ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/10' : 'border-slate-200 dark:border-slate-700 focus:border-violet-500 focus:ring-violet-500/10'
                      } rounded-2xl focus:ring-4 transition-all outline-none font-bold text-sm`}
                      placeholder="+1 (555) 000-0000"
                      type="tel"
                      value={formData.mobileNo || ''}
                      onChange={(e) => {
                        setFormData({ ...formData, mobileNo: e.target.value });
                        if (errors.mobileNo) setErrors({ ...errors, mobileNo: '' });
                      }}
                    />
                  </div>
                  {errors.mobileNo && (
                    <span className="text-xs font-bold text-rose-500 mt-1 block px-2">
                      {errors.mobileNo}
                    </span>
                  )}
                </div>

              </div>

              <div className="flex items-center justify-center gap-6 pt-6 -mx-10 px-10 border-t border-slate-100 dark:border-slate-800/60 mt-8 pt-8">
                <button
                  disabled={isSaving || isLoading}
                  type="submit"
                  className="w-full sm:flex-1 max-w-[200px] flex items-center justify-center gap-3 px-8 py-4 bg-slate-800 dark:bg-white text-white dark:text-slate-900 font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:opacity-90 transition-all shadow-xl active:scale-95 disabled:opacity-50"
                >
                  <Save size={18} />
                  {isSaving ? 'Saving...' : editId ? 'Update' : 'Insert'}
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={isSaving || isLoading}
                  className="w-full sm:flex-1 max-w-[200px] flex items-center justify-center gap-3 px-8 py-4 bg-violet-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-violet-700 transition-all shadow-xl shadow-violet-600/20 active:scale-95 disabled:opacity-50"
                >
                  <RefreshCw size={18} />
                  Clear
                </button>
              </div>
            </form>
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/50 px-10 py-5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <Info size={16} className="text-violet-500" />
            All fields marked with an asterisk (*) are mandatory.
          </div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Sales Force Core Module
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <InfoCard icon={<UserCheck size={20} />} title="Identity Verified" desc="Ensure executive names strictly match their official KYC and banking documentation." color="violet" />
        <InfoCard icon={<Mail size={20} />} title="Cloud Login" desc="Email serves as the core authentication mechanism for CRM field-access portals." color="blue" />
        <InfoCard icon={<Smartphone size={20} />} title="Instant Reach" desc="Mobile number allows seamless routing of SMS alerts and WhatsApp dispatch requests." color="emerald" />
      </div>
    </motion.div>
  );
};

const InfoCard = ({ icon, title, desc, color }: { icon: React.ReactNode, title: string, desc: string, color: string }) => (
  <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 transition-all hover:shadow-md">
    <div className={`text-${color}-500`}>
      {icon}
    </div>
    <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">{title}</h3>
    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed uppercase tracking-tight opacity-80">{desc}</p>
  </div>
);

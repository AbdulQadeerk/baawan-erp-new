import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, RefreshCw, Box, ChevronDown, Info, Zap, Package, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { unitApi, UNIT_CATEGORIES, type UnitRecord } from '../../../services/unit.service';
import { toast } from '../../../lib/toast';

interface UnitCreateProps {
  onBack?: () => void;
  editId?: number | null;
  onSaved?: (record: UnitRecord, isUpdate: boolean) => void;
}

export const UnitCreate: React.FC<UnitCreateProps> = ({ onBack, editId, onSaved }) => {
  const [formData, setFormData] = useState<Partial<UnitRecord>>({
    name: '',
    category: undefined,
    shortName: ''
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
      const data = await unitApi.getById(id);
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

    if (!formData.name?.trim()) {
      newErrors.name = 'This value is required.';
    } else if (!nameRegex.test(formData.name)) {
      newErrors.name = 'Name can only contain letters, spaces, dots, and hyphens.';
    }

    if (!formData.category) {
      newErrors.category = 'This value is required.';
    }

    if (!formData.shortName?.trim()) {
      newErrors.shortName = 'This value is required.';
    } else if (!nameRegex.test(formData.shortName)) {
      newErrors.shortName = 'Short Name can only contain letters, spaces, dots, and hyphens.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    try {
      const payload = {
        name: formData.name!,
        category: Number(formData.category!),
        shortName: formData.shortName!
      };

      let newId = editId;
      if (editId) {
        await unitApi.update({ ...payload, id: editId });
        toast.success('Record updated successfully.', 'Info');
      } else {
        newId = await unitApi.create(payload);
        toast.success('Record created successfully.', 'Info');
      }

      const savedRecord: UnitRecord = {
        id: editId ? editId : newId!,
        ...payload
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
        setFormData({ name: '', category: undefined, shortName: '' });
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
          <div className="p-3 bg-amber-500 rounded-2xl text-white shadow-lg shadow-amber-500/20">
            <Box size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
              {editId ? 'Edit Unit info' : 'Create New Unit'}
            </h1>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-wider opacity-60 mt-1">
              {editId ? 'Update existing unit details.' : 'Define measurement units for your inventory items.'}
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
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Name */}
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]" htmlFor="unit-name">
                    Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="unit-name"
                    disabled={isLoading}
                    className={`w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border ${
                      errors.name ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/10' : 'border-slate-200 dark:border-slate-700 focus:border-amber-500 focus:ring-amber-500/10'
                    } rounded-2xl focus:ring-4 transition-all outline-none font-bold text-sm`}
                    placeholder="Enter unit name (e.g. Kilogram)"
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (errors.name) setErrors({ ...errors, name: '' });
                    }}
                  />
                  {errors.name && (
                    <span className="text-xs font-bold text-rose-500 mt-1 block px-2">
                      {errors.name}
                    </span>
                  )}
                </div>

                {/* Category */}
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]" htmlFor="category">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="category"
                      disabled={isLoading}
                      value={formData.category || ''}
                      onChange={(e) => {
                        setFormData({ ...formData, category: e.target.value ? Number(e.target.value) : undefined });
                        if (errors.category) setErrors({ ...errors, category: '' });
                      }}
                      className={`w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border ${
                        errors.category ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/10' : 'border-slate-200 dark:border-slate-700 focus:border-amber-500 focus:ring-amber-500/10'
                      } rounded-2xl focus:ring-4 transition-all outline-none font-bold text-sm appearance-none cursor-pointer`}
                    >
                      <option disabled value="">-- Select Category --</option>
                      {UNIT_CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.text}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                  </div>
                  {errors.category && (
                    <span className="text-xs font-bold text-rose-500 mt-1 block px-2">
                      {errors.category}
                    </span>
                  )}
                </div>

                {/* Short Name */}
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]" htmlFor="short-name">
                    Short Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="short-name"
                    disabled={isLoading}
                    className={`w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border ${
                      errors.shortName ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/10' : 'border-slate-200 dark:border-slate-700 focus:border-amber-500 focus:ring-amber-500/10'
                    } rounded-2xl focus:ring-4 transition-all outline-none font-bold text-sm`}
                    placeholder="Abbreviation (e.g. Kg)"
                    type="text"
                    value={formData.shortName || ''}
                    onChange={(e) => {
                      setFormData({ ...formData, shortName: e.target.value });
                      if (errors.shortName) setErrors({ ...errors, shortName: '' });
                    }}
                  />
                  {errors.shortName && (
                    <span className="text-xs font-bold text-rose-500 mt-1 block px-2">
                      {errors.shortName}
                    </span>
                  )}
                </div>

              </div>

              <div className="flex items-center justify-center gap-6 pt-6">
                <button
                  disabled={isSaving || isLoading}
                  type="submit"
                  className="flex-1 max-w-[200px] flex items-center justify-center gap-3 px-8 py-4 bg-slate-800 dark:bg-white text-white dark:text-slate-900 font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:opacity-90 transition-all shadow-xl active:scale-95 disabled:opacity-50"
                >
                  <Save size={18} />
                  {isSaving ? 'Saving...' : editId ? 'Update' : 'Insert'}
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={isSaving || isLoading}
                  className="flex-1 max-w-[200px] flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-95 disabled:opacity-50"
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
            <Info size={16} className="text-blue-500" />
            All fields marked with an asterisk (*) are mandatory.
          </div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            System Version 4.2.0
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <InfoCard icon={<Zap size={20} />} title="Standardized Units" desc="Ensure unit names follow international standards for consistency across reporting." color="amber" />
        <InfoCard icon={<Package size={20} />} title="Stock Management" desc="Units defined here will be available for selection when creating new stock items." color="blue" />
        <InfoCard icon={<CheckCircle2 size={20} />} title="System Wide" desc="Changes are applied instantly to E-commerce, CMS, and CRM modules." color="emerald" />
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

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, RefreshCw, HandCoins, Info, LayoutList, Layers } from 'lucide-react';
import { motion } from 'motion/react';
import { itemCategoryApi, type ItemCategoryRecord } from '../../../services/item-category.service';
import { toast } from '../../../lib/toast';

interface ItemCategoryCreateProps {
  onBack?: () => void;
  editId?: number | null;
  onSaved?: (record: ItemCategoryRecord, isUpdate: boolean) => void;
}

export const ItemCategoryCreate: React.FC<ItemCategoryCreateProps> = ({ onBack, editId, onSaved }) => {
  const [formData, setFormData] = useState<Partial<ItemCategoryRecord>>({
    priceCategoryName: ''
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
      const data = await itemCategoryApi.getById(id);
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
    const nameRegex = /^[a-zA-Z0-9\s.-]+$/;

    if (!formData.priceCategoryName?.trim()) {
      newErrors.priceCategoryName = 'This value is required.';
    } else if (!nameRegex.test(formData.priceCategoryName)) {
      newErrors.priceCategoryName = 'Name can only contain letters, numbers, spaces, dots, and hyphens.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    try {
      const payload: Partial<ItemCategoryRecord> & { id?: number } = {
        priceCategoryName: formData.priceCategoryName?.trim() || ''
      };

      let newId = editId;
      if (editId) {
        payload.id = editId;
        payload.priceCategoryID = editId;
        await itemCategoryApi.update(payload as ItemCategoryRecord);
        toast.success('Record updated successfully.', 'Success');
      } else {
        newId = await itemCategoryApi.create(payload as Omit<ItemCategoryRecord, 'priceCategoryID'>);
        toast.success('Record created successfully.', 'Success');
      }

      const savedRecord: ItemCategoryRecord = {
        priceCategoryID: editId ? editId : newId!,
        ...payload as Pick<ItemCategoryRecord, keyof ItemCategoryRecord>
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
        setFormData({ priceCategoryName: '' });
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
          <div className="p-3 bg-pink-500 rounded-2xl text-white shadow-lg shadow-pink-500/20">
            <LayoutList size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
              {editId ? 'Edit Item Rate Category' : 'Create Item Rate Category'}
            </h1>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-wider opacity-60 mt-1">
              {editId ? 'Update item rate category.' : 'Define a new category to group related items.'}
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
          <div className="max-w-xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="grid grid-cols-1 gap-6">
                
                {/* Name */}
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]" htmlFor="name">
                    Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="name"
                    disabled={isLoading}
                    className={`w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border ${
                      errors.priceCategoryName ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/10' : 'border-slate-200 dark:border-slate-700 focus:border-pink-500 focus:ring-pink-500/10'
                    } rounded-2xl focus:ring-4 transition-all outline-none font-bold text-sm`}
                    placeholder="e.g. Retail, Wholesale, Taxable"
                    type="text"
                    value={formData.priceCategoryName || ''}
                    onChange={(e) => {
                      setFormData({ ...formData, priceCategoryName: e.target.value });
                      if (errors.priceCategoryName) setErrors({ ...errors, priceCategoryName: '' });
                    }}
                  />
                  {errors.priceCategoryName && (
                    <span className="text-xs font-bold text-rose-500 mt-1 block px-2">
                      {errors.priceCategoryName}
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
                  className="w-full sm:flex-1 max-w-[200px] flex items-center justify-center gap-3 px-8 py-4 bg-pink-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-pink-700 transition-all shadow-xl shadow-pink-600/20 active:scale-95 disabled:opacity-50"
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
            <Info size={16} className="text-pink-500" />
            All fields marked with an asterisk (*) are mandatory.
          </div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Inventory Core Module
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <InfoCard icon={<Layers size={20} />} title="Categorization Engine" desc="Segment inventory easily into rate classes tailored explicitly towards different distribution networks." color="pink" />
        <InfoCard icon={<HandCoins size={20} />} title="Pricing Rules Base" desc="Serves as the foundation to automatically scale bulk pricing tiers when integrating CRM sales quotes." color="blue" />
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

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, RefreshCw, ScrollText, Info, Scale } from 'lucide-react';
import { motion } from 'motion/react';
import { termsConditionApi, type TermsConditionRecord } from '../../../services/terms-condition.service';
import { toast } from '../../../lib/toast';

interface TermsCreateProps {
  onBack?: () => void;
  editId?: number | null;
  onSaved?: (record: TermsConditionRecord, isUpdate: boolean) => void;
}

export const TermsCreate: React.FC<TermsCreateProps> = ({ onBack, editId, onSaved }) => {
  const [formData, setFormData] = useState<Partial<TermsConditionRecord>>({
    tncText: ''
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
      const data = await termsConditionApi.getById(id);
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

    if (!formData.tncText?.trim()) {
      newErrors.tncText = 'This value is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    try {
      const payload: Partial<TermsConditionRecord> = {
        tncText: formData.tncText?.trim() || ''
      };

      let newId = editId;
      if (editId) {
        payload.id = editId;
        await termsConditionApi.update(payload as TermsConditionRecord);
        toast.success('Record updated successfully.', 'Success');
      } else {
        newId = await termsConditionApi.create(payload as Omit<TermsConditionRecord, 'id'>);
        toast.success('Record created successfully.', 'Success');
      }

      const savedRecord: TermsConditionRecord = {
        id: editId ? editId : newId!,
        ...payload as Pick<TermsConditionRecord, keyof TermsConditionRecord>
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
        setFormData({ tncText: '' });
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
          <div className="p-3 bg-indigo-500 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
            <ScrollText size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
              {editId ? 'Edit Terms & Conditions' : 'Create Terms & Conditions'}
            </h1>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-wider opacity-60 mt-1">
              {editId ? 'Update document clause.' : 'Define a new compliance or legal clause.'}
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
              <div className="grid grid-cols-1 gap-6">
                
                {/* Text Area */}
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]" htmlFor="tncText">
                    Text <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="tncText"
                    disabled={isLoading}
                    rows={6}
                    className={`w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border ${
                      errors.tncText ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/10' : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/10'
                    } rounded-2xl focus:ring-4 transition-all outline-none font-bold text-sm resize-y`}
                    placeholder="Enter the terms and conditions or clause details here..."
                    value={formData.tncText || ''}
                    onChange={(e) => {
                      setFormData({ ...formData, tncText: e.target.value });
                      if (errors.tncText) setErrors({ ...errors, tncText: '' });
                    }}
                  />
                  {errors.tncText && (
                    <span className="text-xs font-bold text-rose-500 mt-1 block px-2">
                      {errors.tncText}
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
                  className="w-full sm:flex-1 max-w-[200px] flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 disabled:opacity-50"
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
            <Info size={16} className="text-indigo-500" />
            All fields marked with an asterisk (*) are mandatory.
          </div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Compliance Core Module
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <InfoCard icon={<Scale size={20} />} title="Legal Governance" desc="Standard text clauses attached explicitly to dispatch and order invoices providing legal protections." color="indigo" />
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

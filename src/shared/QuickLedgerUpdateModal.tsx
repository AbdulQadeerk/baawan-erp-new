/**
 * QuickLedgerUpdateModal — React equivalent of Angular's QuickLedgerUpdateComponent
 * Angular: src/app/shared/quick-ledger-update/quick-ledger-update.component.ts
 */
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { X, Building2, MapPin, UserCheck, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { apiClient } from '../lib/api-client';
import { toast } from '../lib/toast';
import { useAuth } from '../lib/auth-context';

interface QuickLedgerUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordData: any;
  onSuccess?: (data: any) => void;
}

export const QuickLedgerUpdateModal: React.FC<QuickLedgerUpdateModalProps> = ({
  isOpen,
  onClose,
  recordData,
  onSuccess,
}) => {
  const { company } = useAuth();
  const [isBtnLoading, setIsBtnLoading] = useState(false);
  const [areaList, setAreaList] = useState<any[]>([]);
  const [cityList, setCityList] = useState<any[]>([]);

  const { register, handleSubmit, control, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      id: null,
      name: '',
      group_ID: 17,
      address: '',
      area: '',
      city: '',
      state: company?.state ? parseInt(company.state) : null,
      mobile: '',
      email: '',
      gstNo: '',
      pinCode: '',
      partyType: 1,
      isCr: 'false',
      opening_Bal: 0,
      creditDays: 0,
      credit_Limit: 0,
    }
  });

  useEffect(() => {
    if (isOpen) {
      apiClient.post('/api/Common/ItemCategoryList', { table: 3, column: 'Area' })
        .then(setAreaList)
        .catch(console.error);

      apiClient.post('/api/Common/ItemCategoryList', { table: 3, column: 'City' })
        .then(setCityList)
        .catch(console.error);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && recordData) {
      reset({
        id: recordData.id,
        name: recordData.name || '',
        group_ID: recordData.group_ID || 17,
        address: recordData.address || '',
        area: recordData.area || '',
        city: recordData.city || '',
        state: recordData.state || (company?.state ? parseInt(company.state) : null),
        mobile: recordData.mobile || '',
        email: recordData.email || '',
        gstNo: recordData.gstNo || '',
        pinCode: recordData.pinCode || '',
        partyType: 1,
        isCr: recordData.isCr ? 'true' : 'false',
        opening_Bal: recordData.opening_Bal || 0,
        creditDays: recordData.creditDays || 0,
        credit_Limit: recordData.credit_Limit || 0,
      });
    }
  }, [isOpen, recordData, reset, company]);

  const onSubmit = async (values: any) => {
    setIsBtnLoading(true);
    
    // Transform values mirroring Angular
    const payload = {
      ...values,
      isCr: values.isCr === 'true',
      gstType: values.state === (company?.state ? parseInt(company.state) : null) ? 1 : 2,
    };

    try {
      const data = await apiClient.post('/api/Ledger/Update', payload);
      toast.success('Record updated successfully.');
      onSuccess?.(data);
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update ledger');
    } finally {
      setIsBtnLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-700"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Building2 size={18} className="text-blue-600" /> Quick Ledger Update
            </h3>
            <button onClick={onClose} className="p-2 bg-rose-100 dark:bg-rose-900/30 hover:bg-rose-200 rounded-lg transition-colors text-rose-600 dark:text-rose-400">
              <X size={16} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Ledger Name <span className="text-rose-500">*</span></label>
                  <input
                    {...register('name', { required: 'Name is required' })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.name && <span className="text-xs text-rose-500">{errors.name.message as string}</span>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Mobile</label>
                  <input
                    {...register('mobile')}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Email</label>
                  <input
                    {...register('email')}
                    type="email"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Address</label>
                  <input
                    {...register('address')}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">City <span className="text-rose-500">*</span></label>
                  <input
                    {...register('city', { required: 'City is required' })}
                    list="city-list"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <datalist id="city-list">
                    {cityList.map(c => <option key={c.id} value={c.name} />)}
                  </datalist>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Area <span className="text-rose-500">*</span></label>
                  <input
                    {...register('area', { required: 'Area is required' })}
                    list="area-list"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <datalist id="area-list">
                    {areaList.map(a => <option key={a.id} value={a.name} />)}
                  </datalist>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Pincode</label>
                  <input
                    {...register('pinCode')}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">GST No.</label>
                  <input
                    {...register('gstNo')}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isBtnLoading}
                className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {isBtnLoading && <Loader2 size={16} className="animate-spin" />}
                {isBtnLoading ? 'Saving...' : 'Update Ledger'}
              </button>
            </div>
          </form>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Save, RefreshCw, HandCoins, AlertTriangle, User, Calendar, Tag, Trash2, LayoutList } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ledgerTargetApi, type LedgerTargetRecord } from '../../../services/ledger-target.service';
import { commonApi } from '../../../services/common.service';
import { ledgerService } from '../../../services/api';
import { toast } from '../../../lib/toast';

interface LedgerTargetCreateProps {
  onBack?: () => void;
  editId?: number | null; // This represents ledgerId
  onSaved?: (record: any, isUpdate: boolean) => void;
}

export const LedgerTargetCreate: React.FC<LedgerTargetCreateProps> = ({ onBack, editId, onSaved }) => {
  const [ledgers, setLedgers] = useState<any[]>([]);
  const [brandList, setBrandList] = useState<any[]>([]);
  const [categoryList, setCategoryList] = useState<any[]>([]);
  const [sizeList, setSizeList] = useState<any[]>([]);
  const [typeList, setTypeList] = useState<any[]>([]);

  const [formData, setFormData] = useState<{
    ledgerId: number | null;
    brand: string;
    category: string;
    sizes: string;
    type: string;
    fromDate: string;
    toDate: string;
    qty: number | '';
    amount: number | '';
  }>({
    ledgerId: editId || null,
    brand: '',
    category: '',
    sizes: '',
    type: '',
    fromDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    toDate: '',
    qty: '',
    amount: ''
  });

  const [recordList, setRecordList] = useState<LedgerTargetRecord[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, [editId]);

  async function loadInitialData() {
    setIsLoading(true);
    try {
      const [ledgersRes, brandsRes, categoriesRes, sizesRes, typesRes] = await Promise.all([
        ledgerService.list(),
        commonApi.getDistinctValues({ table: 0, column: 'Brand' }).catch(() => []),
        commonApi.getDistinctValues({ table: 0, column: 'Category' }).catch(() => []),
        commonApi.getDistinctValues({ table: 0, column: 'Sizes' }).catch(() => []),
        commonApi.getDistinctValues({ table: 0, column: 'Type' }).catch(() => [])
      ]);
      setLedgers(ledgersRes);
      setBrandList(brandsRes);
      setCategoryList(categoriesRes);
      setSizeList(sizesRes);
      setTypeList(typesRes);

      if (editId) {
        const targetData = await ledgerTargetApi.search({ isSync: false, ledgerId: editId, pageSize: 0, pageNumber: 0 });
        if (targetData.list && targetData.list.length > 0) {
          setRecordList(targetData.list.map((r, i) => ({ ...r, index: i + 1 })));
        }
      }
    } catch (err: any) {
      if (!err?._processedByInterceptor) {
        toast.error('Failed to load required data.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  const validateItem = () => {
    if (!formData.ledgerId) return 'Please select a Party (Ledger).';
    if (!formData.brand) return 'Brand is required.';
    if (!formData.category) return 'Category is required.';
    if (!formData.sizes) return 'Sub Category is required.';
    if (!formData.type) return 'Type is required.';
    if (!formData.fromDate) return 'From Date is required.';
    if (!formData.toDate) return 'To Date is required.';
    
    if (new Date(formData.fromDate) > new Date(formData.toDate)) {
      return 'From Date cannot be later than To Date.';
    }

    if (formData.qty === '' && formData.amount === '') {
      return 'Please enter either Qty or Amount.';
    }

    if (formData.qty !== '' && Number(formData.qty) < 0) return 'Quantity cannot be negative.';
    if (formData.amount !== '' && Number(formData.amount) < 0) return 'Amount cannot be negative.';

    return null;
  };

  const handleAddToList = () => {
    const errorMsg = validateItem();
    if (errorMsg) {
      toast.info(errorMsg, 'Validation Error');
      return;
    }

    const ledgeName = ledgers.find(l => String(l.id) === String(formData.ledgerId))?.name || '';

    const newRecord: LedgerTargetRecord = {
      ledgerId: formData.ledgerId,
      ledgeName,
      brand: formData.brand,
      category: formData.category,
      sizes: formData.sizes,
      type: formData.type,
      fromDate: formData.fromDate,
      toDate: formData.toDate,
      qty: formData.qty === '' ? null : Number(formData.qty),
      amount: formData.amount === '' ? null : Number(formData.amount),
      isDeleted: false,
      itemGroup: null
    };

    setRecordList(prev => {
      const updated = [...prev, newRecord];
      return updated.map((r, i) => ({ ...r, index: i + 1 }));
    });

    // Clear item state but keep ledger and dates
    setFormData(prev => ({
      ...prev,
      brand: '',
      category: '',
      sizes: '',
      type: '',
      qty: '',
      amount: ''
    }));
  };

  const handleDeleteListItem = (indexToRemove: number) => {
    setRecordList(prev => prev.map(r => r.index === indexToRemove ? { ...r, isDeleted: !r.isDeleted } : r));
  };

  const handleSubmit = async () => {
    if (recordList.length === 0) {
      toast.info('Please add at least one condition to the list before saving.', 'Empty List');
      return;
    }

    setIsSaving(true);
    try {
      await ledgerTargetApi.create({ list: recordList });
      toast.success(editId ? 'Ledger Target updated successfully.' : 'Ledger Target created successfully.', 'Success');
      
      if (recordList[0]?.ledgerId) {
        onSaved?.({
          ledger_ID: recordList[0].ledgerId,
          name: recordList[0].ledgeName
        }, !!editId);
      }
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
        loadInitialData();
      } else {
        setRecordList([]);
        setFormData({
          ledgerId: null,
          brand: '',
          category: '',
          sizes: '',
          type: '',
          fromDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
          toDate: '',
          qty: '',
          amount: ''
        });
      }
    }
  };

  const activeRecords = recordList.filter(r => !r.isDeleted);
  const selectedLedgerName = ledgers.find(l => String(l.id) === String(formData.ledgerId))?.name || '';

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-6 py-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500 rounded-2xl text-white shadow-lg shadow-blue-500/20">
            <HandCoins size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {editId ? 'Edit Ledger Targets' : 'Create Ledger Targets'}
            </h1>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider opacity-60">
              {editId ? `Managing targets for ${selectedLedgerName}` : 'Assign sales targets to ledgers.'}
            </p>
          </div>
        </div>
        <button
          onClick={onBack}
          disabled={isSaving || isLoading}
          className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-xs font-black uppercase tracking-widest active:scale-95 disabled:opacity-50"
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Input Form Column */}
        <div className="xl:col-span-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm p-6 lg:p-8">
          <div className="flex flex-wrap items-end gap-4">
            
            {/* Row 1 */}
            <div className="w-full flex flex-col lg:flex-row gap-4 mb-4">
              {editId && selectedLedgerName ? (
                <div className="w-full lg:w-1/3">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Party (Ledger)</label>
                  <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-black rounded-xl border border-blue-100 dark:border-blue-800/50 flex items-center gap-2 text-sm">
                    <User size={16} />
                    {selectedLedgerName}
                  </div>
                </div>
              ) : (
                <div className="w-full lg:w-1/3">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Party (Ledger) <span className="text-rose-500">*</span></label>
                  <select
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                    value={formData.ledgerId || ''}
                    onChange={(e) => setFormData({ ...formData, ledgerId: e.target.value ? Number(e.target.value) : null })}
                  >
                    <option value="">Select Ledger...</option>
                    {ledgers.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
              )}

              <div className="w-full lg:w-1/6">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Brand <span className="text-rose-500">*</span></label>
                <input list="brand-options" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm focus:border-blue-500 outline-none" value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} placeholder="Brand" />
                <datalist id="brand-options">{brandList.map((b, i) => <option key={i} value={b.name} />)}</datalist>
              </div>

              <div className="w-full lg:w-1/6">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Category <span className="text-rose-500">*</span></label>
                <input list="category-options" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm focus:border-blue-500 outline-none" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} placeholder="Category" />
                <datalist id="category-options">{categoryList.map((c, i) => <option key={i} value={c.name} />)}</datalist>
              </div>

              <div className="w-full lg:w-1/6">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Sub Category <span className="text-rose-500">*</span></label>
                <input list="size-options" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm focus:border-blue-500 outline-none" value={formData.sizes} onChange={e => setFormData({ ...formData, sizes: e.target.value })} placeholder="Sub Category" />
                <datalist id="size-options">{sizeList.map((s, i) => <option key={i} value={s.name} />)}</datalist>
              </div>

              <div className="w-full lg:w-1/6">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Type <span className="text-rose-500">*</span></label>
                <input list="type-options" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm focus:border-blue-500 outline-none" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} placeholder="Type" />
                <datalist id="type-options">{typeList.map((t, i) => <option key={i} value={t.name} />)}</datalist>
              </div>
            </div>

            {/* Row 2 */}
            <div className="w-full flex flex-col lg:flex-row gap-4 items-end">
              <div className="w-full lg:w-1/5">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">From Date <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="date" className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm focus:border-blue-500 outline-none" value={formData.fromDate} onChange={e => setFormData({ ...formData, fromDate: e.target.value })} max="2099-12-31" />
                </div>
              </div>

              <div className="w-full lg:w-1/5">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">To Date <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="date" className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm focus:border-blue-500 outline-none" value={formData.toDate} onChange={e => setFormData({ ...formData, toDate: e.target.value })} max="2099-12-31" />
                </div>
              </div>

              <div className="w-full lg:w-1/5">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Qty</label>
                <input type="number" min="0" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm focus:border-blue-500 outline-none" value={formData.qty} onChange={e => setFormData({ ...formData, qty: e.target.value ? Number(e.target.value) : '' })} placeholder="0" />
              </div>

              <div className="w-full lg:w-1/5">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Amount</label>
                <input type="number" min="0" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm focus:border-blue-500 outline-none" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value ? Number(e.target.value) : '' })} placeholder="0.00" />
              </div>

              <div className="w-full lg:w-1/5 flex gap-2">
                <button
                  type="button"
                  onClick={handleAddToList}
                  className="flex-1 px-4 py-3 bg-slate-800 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95 shadow-lg"
                >
                  <PlusSymbol /> Add Target
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Listing Grid */}
        <div className="xl:col-span-12">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                <LayoutList size={18} />
                <span className="text-xs font-black uppercase tracking-widest">Added Targets ({activeRecords.length})</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleClear}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-300 dark:hover:bg-slate-700 transition"
                  title="Reset Everything"
                >
                  <RefreshCw size={14} className="inline mr-1 -mt-0.5" /> Clear All
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSaving || recordList.length === 0}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50"
                  title="Save Targets"
                >
                  {isSaving ? 'Saving...' : 'Save All Targets'}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full text-left">
                <thead className="bg-white dark:bg-slate-900 sticky top-0 z-10">
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 w-12 text-center text-nowrap">#</th>
                    <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 w-12 text-center text-nowrap">Action</th>
                    <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-nowrap">Ledger</th>
                    <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-nowrap">From - To Date</th>
                    <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-nowrap">Match Criteria</th>
                    <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right text-nowrap">Qty</th>
                    <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right text-nowrap">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
                  {recordList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-20 px-4">
                        <div className="flex flex-col items-center justify-center opacity-30">
                          <LayoutList size={48} className="mb-4" />
                          <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">No Targets Built Yet</h3>
                          <p className="text-xs font-bold text-slate-500 mt-2">Fill the form above and click add to list.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    recordList.map((row, idx) => (
                      <tr key={idx} className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${row.isDeleted ? 'bg-rose-50/50 dark:bg-rose-900/10 opacity-50' : ''}`}>
                        <td className="px-5 py-4 text-center text-xs font-bold text-slate-400">{row.index}</td>
                        <td className="px-5 py-4 text-center">
                          <button
                            onClick={() => handleDeleteListItem(row.index!)}
                            className={`p-1.5 rounded-lg transition-all ${row.isDeleted ? 'bg-slate-200 dark:bg-slate-700 text-slate-500' : 'bg-rose-100 hover:bg-rose-200 text-rose-600 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 dark:text-rose-400'}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                        <td className="px-5 py-4 text-xs font-black text-slate-800 dark:text-slate-200">{row.ledgeName || 'Unknown Ledger'}</td>
                        <td className="px-5 py-4 text-[11px] font-bold text-slate-500 whitespace-nowrap">
                          {row.fromDate ? new Date(row.fromDate).toLocaleDateString() : 'N/A'} - {row.toDate ? new Date(row.toDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md text-[10px] font-black border border-blue-100 dark:border-blue-800/50">{row.brand}</span>
                            <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-md text-[10px] font-black border border-emerald-100 dark:border-emerald-800/50">{row.category}</span>
                            <span className="px-2 py-0.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-md text-[10px] font-black border border-purple-100 dark:border-purple-800/50">{row.sizes}</span>
                            <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-md text-[10px] font-black border border-amber-100 dark:border-amber-800/50">{row.type}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right text-xs font-black text-slate-800 dark:text-slate-200">{row.qty !== null ? row.qty : '-'}</td>
                        <td className="px-5 py-4 text-right text-xs font-black text-slate-800 dark:text-slate-200">{row.amount !== null ? row.amount.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

const PlusSymbol = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Upload,
  RefreshCw,
  HelpCircle,
  Layers,
  ChevronDown,
  Loader2,
  Save,
  Percent,
  DollarSign,
  FileText,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  extraChargeApi,
  TAX_TYPE_OPTIONS,
  isTaxType as checkIsTax,
  type ExtraChargeCreatePayload,
  type ExtraChargeRecord,
} from '../../../services/extra-charge.service';
import { commonApi } from '../../../lib/api-client';
import { toast } from '../../../lib/toast';

interface ExtraChargeCreateProps {
  editId?: number | null;
  onBack?: () => void;
  onSaved?: (record: ExtraChargeRecord, isUpdate: boolean) => void;
}

const NAME_PATTERN = /^[a-zA-Z0-9\s.\-]+$/;

interface FormErrors {
  name?: string;
  ledger_ID?: string;
  tax_Type?: string;
  taxPercent?: string;
  fixedPercent?: string;
  fixedAmount?: string;
  salesLedger?: string;
  purchaseLedger?: string;
}

interface LedgerItem {
  id: number;
  name: string;
  particular?: string;
  group_ID?: number;
  [key: string]: any;
}

export const ExtraChargeCreate: React.FC<ExtraChargeCreateProps> = ({ editId, onBack, onSaved }) => {
  // ─── State ──────────────────────────────────────────────────────────────────
  const [name, setName] = useState('');
  const [taxType, setTaxType] = useState<number>(0);
  const [taxPercent, setTaxPercent] = useState<string>('');
  const [isPositiveEffect, setIsPositiveEffect] = useState(true);
  const [percentBased, setPercentBased] = useState(false);
  const [fixedPercent, setFixedPercent] = useState<string>('0');
  const [fixedAmount, setFixedAmount] = useState<string>('0');
  const [description, setDescription] = useState('');

  // Ledger selections
  const [ledgerId, setLedgerId] = useState<string>('');
  const [salesLedgerId, setSalesLedgerId] = useState<string>('');
  const [purchaseLedgerId, setPurchaseLedgerId] = useState<string>('');

  // Dropdown data
  const [generalLedgers, setGeneralLedgers] = useState<LedgerItem[]>([]);
  const [salesLedgers, setSalesLedgers] = useState<LedgerItem[]>([]);
  const [purchaseLedgers, setPurchaseLedgers] = useState<LedgerItem[]>([]);

  const [isBtnLoading, setIsBtnLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [originalData, setOriginalData] = useState<any>(null);

  const nameRef = useRef<HTMLInputElement>(null);
  const isEditMode = !!editId;
  const isTaxTypeSelected = checkIsTax(taxType);

  // ─── Load dropdown & edit data on mount ─────────────────────────────────────
  useEffect(() => {
    loadLedgers();
    if (editId) {
      loadEditData(editId);
    }
  }, [editId]);

  useEffect(() => {
    if (!isEditMode && nameRef.current) {
      nameRef.current.focus();
    }
  }, [isEditMode]);

  // ─── API Calls ──────────────────────────────────────────────────────────────
  async function loadLedgers() {
    try {
      // General ledger groups: 25, 5, 6, 11, 12
      const generalData = await commonApi.dropdown({ table: 5, groups: [25, 5, 6, 11, 12] });
      setGeneralLedgers(generalData ?? []);

      // Sales ledger group: 9
      const salesData = await commonApi.dropdown({ table: 5, groups: [9] });
      setSalesLedgers(salesData ?? []);

      // Purchase ledger group: 10
      const purchaseData = await commonApi.dropdown({ table: 5, groups: [10] });
      setPurchaseLedgers(purchaseData ?? []);
    } catch {
      // Silently handled
    }
  }

  async function loadEditData(id: number) {
    setIsDataLoading(true);
    try {
      const data = await extraChargeApi.getById(id);
      if (data) {
        setName(data.name || '');
        setTaxType(data.tax_Type ?? 0);
        setTaxPercent(data.taxPercent != null ? String(data.taxPercent) : '');
        setIsPositiveEffect(data.isPositiveEffect ?? true);
        setPercentBased(data.percentBased ?? false);
        setFixedPercent(data.fixedPercent != null ? String(data.fixedPercent) : '0');
        setFixedAmount(data.fixedAmount != null ? String(data.fixedAmount) : '0');
        setDescription(data.description || '');
        setLedgerId(data.ledger_ID ? String(data.ledger_ID) : '');
        setSalesLedgerId(data.salesLegderId ? String(data.salesLegderId) : '');
        setPurchaseLedgerId(data.purchaseLegderId ? String(data.purchaseLegderId) : '');
        setOriginalData({
          name: data.name || '',
          taxType: data.tax_Type ?? 0,
          taxPercent: data.taxPercent != null ? String(data.taxPercent) : '',
          isPositiveEffect: data.isPositiveEffect ?? true,
          percentBased: data.percentBased ?? false,
          fixedPercent: data.fixedPercent != null ? String(data.fixedPercent) : '0',
          fixedAmount: data.fixedAmount != null ? String(data.fixedAmount) : '0',
          description: data.description || '',
          ledgerId: data.ledger_ID ? String(data.ledger_ID) : '',
          salesLedgerId: data.salesLegderId ? String(data.salesLegderId) : '',
          purchaseLedgerId: data.purchaseLegderId ? String(data.purchaseLegderId) : '',
        });
      }
    } catch (err: any) {
      if (!err?._processedByInterceptor) {
        toast.info('Failed to load extra charge data.', 'Info');
      }
    } finally {
      setIsDataLoading(false);
    }
  }

  // ─── Validation ─────────────────────────────────────────────────────────────
  function validate(): FormErrors {
    const errs: FormErrors = {};

    if (!name.trim()) {
      errs.name = 'This value is required.';
    } else if (!NAME_PATTERN.test(name.trim())) {
      errs.name = 'Name can only contain letters, numbers, spaces, dots, and hyphens.';
    }

    if (!ledgerId) {
      errs.ledger_ID = 'This value is required.';
    }

    if (isTaxTypeSelected) {
      if (!taxPercent || isNaN(Number(taxPercent))) {
        errs.taxPercent = 'This value is required.';
      } else {
        const val = Number(taxPercent);
        if (val < 0) errs.taxPercent = 'Value must be >= 0.';
        if (val > 100) errs.taxPercent = 'Value must be <= 100.';
      }
      if (!salesLedgerId) errs.salesLedger = 'This value is required.';
      if (!purchaseLedgerId) errs.purchaseLedger = 'This value is required.';
    }

    const fp = Number(fixedPercent);
    if (fixedPercent && !isNaN(fp)) {
      if (fp < 0) errs.fixedPercent = 'Value must be >= 0.';
      if (fp > 100) errs.fixedPercent = 'Value must be <= 100.';
    }

    const fa = Number(fixedAmount);
    if (fixedAmount && !isNaN(fa)) {
      if (fa < 0) errs.fixedAmount = 'Value must be >= 0.';
    }

    return errs;
  }

  // ─── Submit ─────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);

    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsBtnLoading(true);

    const payload: ExtraChargeCreatePayload = {
      name: name.trim(),
      tax_Type: taxType,
      taxPercent: taxPercent ? Number(taxPercent) : 0,
      fixedAmount: fixedAmount ? Number(fixedAmount) : 0,
      fixedPercent: fixedPercent ? Number(fixedPercent) : 0,
      vatEffect: false,
      cstEffect: false,
      isPositiveEffect,
      percentBased,
      description: description || null,
      ledger_ID: parseInt(ledgerId, 10),
      salesLegderId: salesLedgerId ? parseInt(salesLedgerId, 10) : null,
      purchaseLegderId: purchaseLedgerId ? parseInt(purchaseLedgerId, 10) : null,
    };

    try {
      // Resolve names
      const ledgerItem = generalLedgers.find(x => String(x.id) === ledgerId);
      const salesItem = salesLedgers.find(x => String(x.id) === salesLedgerId);
      const purchaseItem = purchaseLedgers.find(x => String(x.id) === purchaseLedgerId);

      if (isEditMode && editId) {
        payload.id = editId;
        await extraChargeApi.update(payload);
        toast.success('Record updated successfully.', 'Info');

        const updatedRecord: ExtraChargeRecord = {
          extraCharges_ID: editId,
          name: name.trim(),
          tax_Type: taxType,
          taxPercent: payload.taxPercent ?? 0,
          fixedAmount: payload.fixedAmount,
          fixedPercent: payload.fixedPercent,
          isPositiveEffect,
          percentBased,
          description: description || '',
          ledger: ledgerItem?.name ?? '',
          salesLedger: salesItem?.name ?? '',
          purchaseLedger: purchaseItem?.name ?? '',
        };
        onSaved?.(updatedRecord, true);
      } else {
        const newId = await extraChargeApi.create(payload);
        toast.success('Record created successfully.', 'Info');

        const newRecord: ExtraChargeRecord = {
          extraCharges_ID: typeof newId === 'number' ? newId : 0,
          name: name.trim(),
          tax_Type: taxType,
          taxPercent: payload.taxPercent ?? 0,
          fixedAmount: payload.fixedAmount,
          fixedPercent: payload.fixedPercent,
          isPositiveEffect,
          percentBased,
          description: description || '',
          ledger: ledgerItem?.name ?? '',
          salesLedger: salesItem?.name ?? '',
          purchaseLedger: purchaseItem?.name ?? '',
        };
        onSaved?.(newRecord, false);
      }

      onBack?.();
    } catch (err: any) {
      if (!err?._processedByInterceptor) {
        toast.info(err?.error || err?.message || 'Operation failed.', 'Info');
      }
    } finally {
      setIsBtnLoading(false);
    }
  }

  // ─── Clear ──────────────────────────────────────────────────────────────────
  function handleClear() {
    const yes = window.confirm('Are you sure you want to clear the form?');
    if (!yes) return;

    if (originalData) {
      setName(originalData.name);
      setTaxType(originalData.taxType);
      setTaxPercent(originalData.taxPercent);
      setIsPositiveEffect(originalData.isPositiveEffect);
      setPercentBased(originalData.percentBased);
      setFixedPercent(originalData.fixedPercent);
      setFixedAmount(originalData.fixedAmount);
      setDescription(originalData.description);
      setLedgerId(originalData.ledgerId);
      setSalesLedgerId(originalData.salesLedgerId);
      setPurchaseLedgerId(originalData.purchaseLedgerId);
    } else {
      setName('');
      setTaxType(0);
      setTaxPercent('');
      setIsPositiveEffect(true);
      setPercentBased(false);
      setFixedPercent('0');
      setFixedAmount('0');
      setDescription('');
      setLedgerId('');
      setSalesLedgerId('');
      setPurchaseLedgerId('');
    }
    setSubmitted(false);
    setErrors({});
  }

  function preventInvalidNumberInput(e: React.KeyboardEvent) {
    if (['e', 'E', '+', '-'].includes(e.key)) {
      e.preventDefault();
    }
  }

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto px-6 py-10"
    >
      {/* Page Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
            {isEditMode ? 'Edit Extra Charge' : 'Create New Extra Charge'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-bold uppercase tracking-wider opacity-60">
            {isEditMode
              ? 'Update the extra charge details below.'
              : 'Configure additional taxes, fees, or discounts for your invoices.'}
          </p>
        </div>
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-5 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95"
          >
            <ArrowLeft size={16} /> Back
          </button>
        )}
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
        {isDataLoading ? (
          <div className="flex items-center justify-center gap-3 py-20 text-slate-400">
            <Loader2 className="animate-spin" size={24} />
            <span className="text-sm font-bold uppercase tracking-widest">Loading...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} autoComplete="off" onKeyDown={e => { if (e.key === 'Enter') e.preventDefault(); }}>
            <div className="p-10 space-y-12">
              {/* Section 1: Identity */}
              <div className="space-y-8">
                <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-700/50 pb-4">
                  <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
                    <Layers size={20} />
                  </div>
                  <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-[0.2em]">
                    Identity & Classification
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      ref={nameRef}
                      className={`w-full bg-slate-50 dark:bg-slate-900/50 border rounded-2xl px-5 py-4 text-slate-900 dark:text-white font-bold focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all outline-none ${
                        submitted && errors.name
                          ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                      placeholder="e.g. Service Tax 5%"
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                    />
                    {submitted && errors.name && (
                      <p className="text-xs font-bold text-red-500 mt-1">{errors.name}</p>
                    )}
                  </div>

                  {/* Ledger */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">
                      Ledger <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={ledgerId}
                        onChange={e => setLedgerId(e.target.value)}
                        className={`w-full bg-slate-50 dark:bg-slate-900/50 border rounded-2xl px-5 py-4 text-slate-900 dark:text-white font-bold focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all appearance-none outline-none cursor-pointer ${
                          submitted && errors.ledger_ID
                            ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10'
                            : 'border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <option value="">--Select Ledger--</option>
                        {generalLedgers.map(item => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-slate-400">
                        <ChevronDown size={20} />
                      </div>
                    </div>
                    {submitted && errors.ledger_ID && (
                      <p className="text-xs font-bold text-red-500 mt-1">{errors.ledger_ID}</p>
                    )}
                  </div>

                  {/* Tax Type */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">
                      Tax Type <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={taxType}
                        onChange={e => {
                          const val = parseInt(e.target.value, 10);
                          setTaxType(val);
                          if (val === 0) {
                            setSalesLedgerId('');
                            setPurchaseLedgerId('');
                          } else {
                            setIsPositiveEffect(true);
                          }
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-slate-900 dark:text-white font-bold focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all appearance-none outline-none cursor-pointer"
                      >
                        {TAX_TYPE_OPTIONS.map(opt => (
                          <option key={opt.id} value={opt.id}>
                            {opt.text}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-slate-400">
                        <ChevronDown size={20} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tax Percent (shown when tax type selected) */}
                {isTaxTypeSelected && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">
                        Tax Percent <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          className={`w-full bg-slate-50 dark:bg-slate-900/50 border rounded-2xl px-5 py-4 pr-12 text-slate-900 dark:text-white font-bold focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all outline-none ${
                            submitted && errors.taxPercent
                              ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10'
                              : 'border-slate-200 dark:border-slate-700'
                          }`}
                          type="number"
                          min="0"
                          max="100"
                          step="any"
                          value={taxPercent}
                          onChange={e => setTaxPercent(e.target.value)}
                          onKeyDown={preventInvalidNumberInput}
                          placeholder="0"
                        />
                        <Percent className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      </div>
                      {submitted && errors.taxPercent && (
                        <p className="text-xs font-bold text-red-500 mt-1">{errors.taxPercent}</p>
                      )}
                    </div>

                    {/* Sales Ledger */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">
                        Sales Ledger <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={salesLedgerId}
                          onChange={e => setSalesLedgerId(e.target.value)}
                          className={`w-full bg-slate-50 dark:bg-slate-900/50 border rounded-2xl px-5 py-4 text-slate-900 dark:text-white font-bold focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all appearance-none outline-none cursor-pointer ${
                            submitted && errors.salesLedger
                              ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10'
                              : 'border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <option value="">--Select Sales Ledger--</option>
                          {salesLedgers.map(item => (
                            <option key={item.id} value={item.id}>
                              {item.name}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-slate-400">
                          <ChevronDown size={20} />
                        </div>
                      </div>
                      {submitted && errors.salesLedger && (
                        <p className="text-xs font-bold text-red-500 mt-1">{errors.salesLedger}</p>
                      )}
                    </div>

                    {/* Purchase Ledger */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">
                        Purchase Ledger <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={purchaseLedgerId}
                          onChange={e => setPurchaseLedgerId(e.target.value)}
                          className={`w-full bg-slate-50 dark:bg-slate-900/50 border rounded-2xl px-5 py-4 text-slate-900 dark:text-white font-bold focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all appearance-none outline-none cursor-pointer ${
                            submitted && errors.purchaseLedger
                              ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10'
                              : 'border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <option value="">--Select Purchase Ledger--</option>
                          {purchaseLedgers.map(item => (
                            <option key={item.id} value={item.id}>
                              {item.name}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-slate-400">
                          <ChevronDown size={20} />
                        </div>
                      </div>
                      {submitted && errors.purchaseLedger && (
                        <p className="text-xs font-bold text-red-500 mt-1">{errors.purchaseLedger}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Positive Effect (shown when NOT tax type) */}
                {!isTaxTypeSelected && (
                  <div className="flex items-center gap-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={isPositiveEffect}
                        onChange={e => setIsPositiveEffect(e.target.checked)}
                      />
                      <div className="w-14 h-7 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"></div>
                    </label>
                    <span className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                      Positive Effect?
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight max-w-[250px] leading-tight">
                      (Charge will be added to total instead of subtracted)
                    </span>
                  </div>
                )}
              </div>

              {/* Section 2: Calculation Logic */}
              <div className="space-y-8">
                <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-700/50 pb-4">
                  <div className="p-2 bg-blue-600/10 rounded-xl text-blue-600">
                    <RefreshCw size={20} />
                  </div>
                  <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-[0.2em]">
                    Calculation Logic
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Percent Based */}
                  <div className="p-8 rounded-3xl border-2 border-slate-100 dark:border-slate-700 space-y-6 bg-slate-50/30 dark:bg-slate-800/20">
                    <div className="flex items-center gap-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={percentBased}
                          onChange={e => setPercentBased(e.target.checked)}
                        />
                        <div className="w-6 h-6 rounded-full border-2 border-blue-600 flex items-center justify-center peer-checked:bg-blue-600 transition-all">
                          {percentBased && <div className="w-3 h-3 rounded-full bg-white"></div>}
                        </div>
                      </label>
                      <span className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest">
                        Percent Based?
                      </span>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        Fixed Percent (%)
                      </label>
                      <div className="relative">
                        <input
                          className={`w-full px-5 py-4 bg-white dark:bg-slate-900 border rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all outline-none text-sm font-black ${
                            submitted && errors.fixedPercent
                              ? 'border-red-400'
                              : 'border-slate-200 dark:border-slate-700'
                          }`}
                          value={fixedPercent}
                          onChange={e => setFixedPercent(e.target.value)}
                          onKeyDown={preventInvalidNumberInput}
                          type="number"
                          min="0"
                          max="100"
                          step="any"
                        />
                        <Percent className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      </div>
                      {submitted && errors.fixedPercent && (
                        <p className="text-xs font-bold text-red-500">{errors.fixedPercent}</p>
                      )}
                    </div>
                  </div>

                  {/* Amount Based */}
                  <div className="p-8 rounded-3xl border-2 border-slate-100 dark:border-slate-700 space-y-6 bg-slate-50/30 dark:bg-slate-800/20">
                    <div className="flex items-center gap-4">
                      <div className="w-6 h-6 rounded-full border-2 border-slate-300 dark:border-slate-600"></div>
                      <span className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest">
                        Amount Based?
                      </span>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        Fixed Amount
                      </label>
                      <div className="relative">
                        <input
                          className={`w-full px-5 py-4 bg-white dark:bg-slate-900 border rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all outline-none text-sm font-black ${
                            submitted && errors.fixedAmount
                              ? 'border-red-400'
                              : 'border-slate-200 dark:border-slate-700'
                          }`}
                          value={fixedAmount}
                          onChange={e => setFixedAmount(e.target.value)}
                          onKeyDown={preventInvalidNumberInput}
                          type="number"
                          min="0"
                          step="any"
                        />
                        <DollarSign className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      </div>
                      {submitted && errors.fixedAmount && (
                        <p className="text-xs font-bold text-red-500">{errors.fixedAmount}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Description */}
              <div className="space-y-8">
                <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-700/50 pb-4">
                  <div className="p-2 bg-slate-900/10 dark:bg-white/10 rounded-xl text-slate-900 dark:text-white">
                    <FileText size={20} />
                  </div>
                  <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-[0.2em]">
                    Additional Notes
                  </h3>
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">
                    Description
                  </label>
                  <textarea
                    className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-3xl focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all outline-none text-sm font-medium resize-none"
                    placeholder="Enter any internal notes or details about this charge..."
                    rows={4}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-10 border-t border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row items-center justify-center gap-6">
                <button
                  type="submit"
                  disabled={isBtnLoading}
                  className="w-full sm:w-52 flex items-center justify-center gap-3 bg-slate-800 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-900 active:scale-95 transition-all shadow-xl shadow-slate-800/20 disabled:opacity-60"
                >
                  {isBtnLoading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Please wait...
                    </>
                  ) : (
                    <>
                      {isEditMode ? <Save size={20} /> : <Upload size={20} />}
                      {isEditMode ? 'Update' : 'Insert'}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="w-full sm:w-52 flex items-center justify-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 active:scale-95 transition-all shadow-xl shadow-blue-600/20"
                >
                  <RefreshCw size={20} /> Clear Form
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 dark:bg-slate-900/50 px-10 py-5 border-t border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 gap-4">
              <div className="flex items-center gap-2">
                <HelpCircle size={14} className="text-blue-500" />
                Fields marked with <span className="text-red-500">*</span> are mandatory.
              </div>
              <div className="flex items-center gap-6 opacity-60">
                <span>Last modified: {new Date().toLocaleDateString('en-GB')}</span>
                <span>Version 2.4.1</span>
              </div>
            </div>
          </form>
        )}
      </div>
    </motion.div>
  );
};

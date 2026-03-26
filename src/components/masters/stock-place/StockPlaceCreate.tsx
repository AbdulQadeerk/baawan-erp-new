import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Upload,
  RefreshCw,
  HelpCircle,
  Warehouse,
  ChevronDown,
  Loader2,
  Save,
  MapPin,
  Phone,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  stockPlaceApi,
  type StockPlaceRecord,
} from '../../../services/stock-place.service';
import { commonApi } from '../../../lib/api-client';
import { toast } from '../../../lib/toast';

interface StockPlaceCreateProps {
  editId?: number | null;
  onBack?: () => void;
  onSaved?: (record: StockPlaceRecord, isUpdate: boolean) => void;
}

const NAME_PATTERN = /^[a-zA-Z0-9\s.\-]+$/;
const CODE_PATTERN = /^[a-zA-Z0-9\-]+$/;

interface FormErrors {
  name?: string;
  code?: string;
  area?: string;
  city?: string;
  state?: string;
  pin?: string;
}

export const StockPlaceCreate: React.FC<StockPlaceCreateProps> = ({ editId, onBack, onSaved }) => {
  // ─── State ──────────────────────────────────────────────────────────────────
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address_1, setAddress_1] = useState('');
  const [address_2, setAddress_2] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pin, setPin] = useState('');
  const [phone, setPhone] = useState('');

  // Fixed defaults from Angular
  const [canMakeBill] = useState(true);
  const [isStockPlace] = useState(true);
  const [useInCompany] = useState(true);

  // Dropdown data
  const [cityList, setCityList] = useState<{ id?: number; name: string }[]>([]);
  
  // Basic states for dropdown (mimicking Angular's limited list if needed, or free text)
  const STATE_OPTIONS = [
    'Maharashtra', 'Delhi', 'Karnataka', 'Gujarat', 'Tamil Nadu', 
    'Andhra Pradesh', 'Telangana', 'West Bengal', 'Rajasthan', 'Uttar Pradesh',
    'Kerala', 'Madhya Pradesh', 'Bihar', 'Punjab', 'Haryana'
  ];

  const [isBtnLoading, setIsBtnLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [originalData, setOriginalData] = useState<any>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  
  const isEditMode = !!editId;

  // ─── Load dropdown & edit data on mount ─────────────────────────────────────
  useEffect(() => {
    loadCities();
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
  async function loadCities() {
    try {
      const data = await commonApi.itemCategoryList({ table: 3, column: 'City' });
      setCityList(data ?? []);
    } catch {
      // Sliently handle
    }
  }

  async function loadEditData(id: number) {
    setIsDataLoading(true);
    try {
      const data = await stockPlaceApi.getById(id);
      if (data) {
        setName(data.name || '');
        setCode(data.code || '');
        setAddress_1(data.address_1 || '');
        setAddress_2(data.address_2 || '');
        setArea(data.area || '');
        setCity(data.city || '');
        setState(data.state || '');
        setPin(data.pin || '');
        setPhone(data.phone || '');

        setOriginalData({
          name: data.name || '',
          code: data.code || '',
          address_1: data.address_1 || '',
          address_2: data.address_2 || '',
          area: data.area || '',
          city: data.city || '',
          state: data.state || '',
          pin: data.pin || '',
          phone: data.phone || '',
        });
      }
    } catch (err: any) {
      if (!err?._processedByInterceptor) {
        toast.info('Failed to load stock place data.', 'Info');
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

    if (!code.trim()) {
      errs.code = 'This value is required.';
    } else if (!CODE_PATTERN.test(code.trim())) {
      errs.code = 'Code can only contain letters, numbers, and hyphens.';
    }
    
    if (!area.trim()) {
      errs.area = 'This value is required.';
    }

    if (!city.trim()) {
      errs.city = 'This value is required.';
    }

    if (!state.trim()) {
      errs.state = 'This value is required.';
    }

    if (pin && pin.trim().length < 3) {
      errs.pin = 'Invalid pincode format.';
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

    const payload: Omit<StockPlaceRecord, 'sp_ID'> & { id?: number } = {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      address_1: address_1.trim() || undefined,
      address_2: address_2.trim() || undefined,
      area: area.trim(),
      city: city.trim(),
      state: state.trim(),
      pin: pin.trim() || undefined,
      phone: phone.trim() || undefined,
      canMakeBill,
      isStockPlace,
      useInCompany,
    };

    try {
      if (isEditMode && editId) {
        payload.id = editId;
        // In update API, it expects id instead of sp_ID
        await stockPlaceApi.update(payload as any);
        toast.success('Record updated successfully.', 'Info');

        const updatedRecord: StockPlaceRecord = {
          ...(payload as unknown as StockPlaceRecord),
          sp_ID: editId,
        };
        onSaved?.(updatedRecord, true);
      } else {
        const newId = await stockPlaceApi.create(payload);
        toast.success('Record created successfully.', 'Info');

        const newRecord: StockPlaceRecord = {
          ...(payload as unknown as StockPlaceRecord),
          sp_ID: typeof newId === 'number' ? newId : 0,
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
      setCode(originalData.code);
      setAddress_1(originalData.address_1);
      setAddress_2(originalData.address_2);
      setArea(originalData.area);
      setCity(originalData.city);
      setState(originalData.state);
      setPin(originalData.pin);
      setPhone(originalData.phone);
    } else {
      setName('');
      setCode('');
      setAddress_1('');
      setAddress_2('');
      setArea('');
      setCity('');
      setState('');
      setPin('');
      setPhone('');
    }
    setSubmitted(false);
    setErrors({});
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
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-4">
            <div className="bg-blue-600/10 p-3 rounded-2xl text-blue-600">
              <Warehouse size={28} />
            </div>
            {isEditMode ? 'Edit Stock Place' : 'Create New Stock Place'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-bold uppercase tracking-wider opacity-60">
            {isEditMode
              ? 'Update the warehouse or storage location details below.'
              : 'Fill in the details below to add a new warehouse or storage location.'}
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
              
              {/* Primary Identity Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]" htmlFor="name">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={nameRef}
                    className={`w-full px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all outline-none font-bold text-sm ${
                      submitted && errors.name ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 dark:border-slate-700'
                    }`}
                    id="name"
                    placeholder="Warehouse name"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                  {submitted && errors.name && (
                    <p className="text-xs font-bold text-red-500 mt-1">{errors.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]" htmlFor="code">
                    Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    className={`w-full px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all outline-none font-bold text-sm uppercase ${
                      submitted && errors.code ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 dark:border-slate-700'
                    }`}
                    id="code"
                    placeholder="Unique location code"
                    type="text"
                    value={code}
                    onChange={e => setCode(e.target.value.toUpperCase())}
                  />
                  {submitted && errors.code && (
                    <p className="text-xs font-bold text-red-500 mt-1">{errors.code}</p>
                  )}
                </div>
              </div>

              {/* Address Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]" htmlFor="address1">
                    Address Line 1
                  </label>
                  <textarea
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all outline-none font-bold text-sm resize-none"
                    id="address1"
                    placeholder="Street, building, etc."
                    rows={3}
                    value={address_1}
                    onChange={e => setAddress_1(e.target.value)}
                  ></textarea>
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]" htmlFor="address2">
                    Address Line 2
                  </label>
                  <textarea
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all outline-none font-bold text-sm resize-none"
                    id="address2"
                    placeholder="Landmark, apartment, suite"
                    rows={3}
                    value={address_2}
                    onChange={e => setAddress_2(e.target.value)}
                  ></textarea>
                </div>
              </div>

              {/* Location Details Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]" htmlFor="state">
                    State <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      list="stateList"
                      className={`w-full px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all outline-none font-bold text-sm ${
                        submitted && errors.state ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 dark:border-slate-700'
                      }`}
                      id="state"
                      value={state}
                      onChange={e => setState(e.target.value)}
                      placeholder="e.g. Maharashtra"
                    />
                    <datalist id="stateList">
                      {STATE_OPTIONS.map(opt => <option key={opt} value={opt} />)}
                    </datalist>
                    {submitted && errors.state && (
                      <p className="text-xs font-bold text-red-500 mt-1">{errors.state}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]" htmlFor="city">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    list="cityDataList"
                    className={`w-full px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all outline-none font-bold text-sm ${
                      submitted && errors.city ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 dark:border-slate-700'
                    }`}
                    id="city"
                    placeholder="City name"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                  />
                  <datalist id="cityDataList">
                    {cityList.map(opt => <option key={opt.id ?? opt.name} value={opt.name} />)}
                  </datalist>
                  {submitted && errors.city && (
                    <p className="text-xs font-bold text-red-500 mt-1">{errors.city}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]" htmlFor="area">
                    Area <span className="text-red-500">*</span>
                  </label>
                  <input
                    className={`w-full px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all outline-none font-bold text-sm ${
                      submitted && errors.area ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 dark:border-slate-700'
                    }`}
                    id="area"
                    placeholder="Locality"
                    type="text"
                    value={area}
                    onChange={e => setArea(e.target.value)}
                  />
                  {submitted && errors.area && (
                    <p className="text-xs font-bold text-red-500 mt-1">{errors.area}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]" htmlFor="pin">
                    Pin Code
                  </label>
                  <input
                    className={`w-full px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all outline-none font-bold text-sm ${
                      submitted && errors.pin ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 dark:border-slate-700'
                    }`}
                    id="pin"
                    placeholder="123456"
                    type="text"
                    value={pin}
                    onChange={e => setPin(e.target.value)}
                  />
                  {submitted && errors.pin && (
                    <p className="text-xs font-bold text-red-500 mt-1">{errors.pin}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]" htmlFor="mobile">
                    Mobile
                  </label>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                      <span className="text-xs font-black text-slate-400"></span>
                    </div>
                    <input
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all outline-none font-bold text-sm"
                      id="mobile"
                      placeholder="Phone"
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                    />
                    <Phone className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                  </div>
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
                      {isEditMode ? 'Update' : 'Insert Place'}
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

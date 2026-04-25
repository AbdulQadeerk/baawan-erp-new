import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search, RotateCcw, FileSpreadsheet, FileText,
  LayoutGrid, Loader2, Eye, CalendarRange
} from 'lucide-react';
import { reportApi } from '../../../services/report.service';
import { commonApi } from '../../../lib/api-client';
import * as XLSX from 'xlsx';
import { CommonAutocompleteTemplate } from '../../../shared/CommonAutocompleteTemplate';
import { InvoiceDetailsModal } from '../InvoiceDetailsModal';

interface AutocompleteOption {
  name: string;
  [key: string]: any;
}

// ─── Checkbox Component ────────────────────────────────────────────────────
const CheckboxInput: React.FC<{
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = ({ id, label, checked, onChange }) => (
  <div className="flex items-center gap-2 h-full min-h-[38px]">
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={e => onChange(e.target.checked)}
      className="w-4 h-4 text-blue-600 bg-slate-50 border-slate-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
    />
    <label htmlFor={id} className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none">
      {label}
    </label>
  </div>
);

// ─── Autocomplete Input Component ──────────────────────────────────────────
const AutocompleteInput: React.FC<{
  label: string;
  value: any;
  options: AutocompleteOption[];
  onChange: (val: any) => void;
  placeholder: string;
  displayField?: string;
  templateType?: string;
  disabled?: boolean;
  required?: boolean;
  hasError?: boolean;
}> = ({ label, value, options, onChange, placeholder, displayField = 'name', templateType = 'name', disabled = false, required = false, hasError = false }) => {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = search.length >= 2
    ? options.filter(o => {
        const val = o[displayField] || o.name || '';
        return val.toLowerCase().includes(search.toLowerCase());
      }).slice(0, 10)
    : [];

  return (
    <div className="space-y-1 relative" ref={ref}>
      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="search"
        disabled={disabled}
        placeholder={placeholder}
        value={value ? (value[displayField] || value.name || '') : search}
        onChange={e => { setSearch(e.target.value); onChange(null); setOpen(true); }}
        onFocus={() => !disabled && setOpen(true)}
        className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50 ${hasError ? 'border-red-500 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'}`}
      />
      {open && filtered.length > 0 && !disabled && (
        <div className={`absolute z-50 top-full mt-1 ${['item', 'ledger'].includes(templateType) ? 'w-[800px] max-w-[90vw]' : 'w-full'} bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-64 overflow-y-auto`}>
          {filtered.map((opt, i) => (
            <button key={i} onClick={() => { onChange(opt); setSearch(''); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 last:border-0">
              <CommonAutocompleteTemplate result={opt} templateType={templateType} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const ItemRegisterReport: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [monthlyTotals, setMonthlyTotals] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInvCode, setModalInvCode] = useState<number | string>(0);
  const [modalInvType, setModalInvType] = useState<number>(1);
  const [modalIndex, setModalIndex] = useState(0);

  // Dropdown lists
  const [itemList, setItemList] = useState<any[]>([]);
  const [lotNoList, setLotNoList] = useState<any[]>([]);
  const [stockPlaceList, setStockPlaceList] = useState<any[]>([]);

  const defaultFilters = {
    fromDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    toDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
    isOpeningStock: false,
    stockDetail: false,
    spIds: '',
    item: null,
    mfrItemName: null,
    monthWise: false,
  };

  const [filters, setFilters] = useState<Record<string, any>>(defaultFilters);

  useEffect(() => {
    // Stock places
    commonApi.dropdown({ table: 4 }).then(setStockPlaceList).catch(() => {});

    try {
      const items = JSON.parse(localStorage.getItem('item-list') || '[]');
      const formattedItems = items.filter((ele: any) => ele.isact).map((ele: any) => ({
        ...ele, particular: [ele.nm, ele.ict, ele.typ, ele.brd, ele.siz, ele.ig].filter(Boolean).join(' '), name: ele.nm
      }));
      setItemList(formattedItems);
    } catch {}
  }, []);

  // When item changes, fetch Lot No List
  useEffect(() => {
    if (filters.item && filters.item.iid) {
      commonApi.itemCategoryList({
        table: 25,
        column: "MfgCode",
        searchText: filters.item.iid.toString()
      }).then(data => setLotNoList(data || [])).catch(() => setLotNoList([]));
    } else {
      setLotNoList([]);
      if (filters.mfrItemName !== null) {
        setFilters(f => ({ ...f, mfrItemName: null }));
      }
    }
  }, [filters.item]);

  const formatDateForApi = (dateStr: string, time: string) => {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y} ${time}`;
  };

  const getFiltersPayload = useCallback(() => {
    return {
      fromDate: filters.fromDate ? formatDateForApi(filters.fromDate, '00:00:00') : null,
      toDate: filters.toDate ? formatDateForApi(filters.toDate, '23:59:59') : null,
      isOpeningStock: filters.isOpeningStock,
      stockDetail: filters.stockDetail,
      spIds: (!filters.isOpeningStock && filters.spIds) ? [parseInt(filters.spIds)] : null,
      itemId: filters.item ? filters.item.iid : null,
      mfrItemName: filters.mfrItemName ? (filters.mfrItemName.name || filters.mfrItemName) : null,
    };
  }, [filters]);

  const validate = () => {
    setSubmitted(true);
    if (!filters.item) return false;
    if (!filters.fromDate || !filters.toDate) return false;
    return true;
  };

  const calculateMonthlyTotals = (sourceData: any[]) => {
    const map = new Map<string, any>();
    
    // Create copy to sort
    const sortedData = [...sourceData].sort((a, b) => new Date(a.BillDate).getTime() - new Date(b.BillDate).getTime());

    let currentMonthKey: string | null = null;
    let closingQuantity: number | null = null;
    let closingValue: number | null = null;

    sortedData.forEach(transaction => {
      const billDate = new Date(transaction.BillDate);
      if (isNaN(billDate.getTime())) return;

      const monthKey = `${billDate.getFullYear()}-${billDate.getMonth() + 1}`;

      if (monthKey !== currentMonthKey) {
        if (currentMonthKey !== null && map.has(currentMonthKey)) {
          const previousMonth = map.get(currentMonthKey);
          previousMonth.closingQuantity = closingQuantity;
          previousMonth.closingValue = closingValue;
        }
        closingQuantity = transaction.Balance || 0;
        closingValue = (transaction.Balance || 0) * (transaction.NetRate || 0);
        currentMonthKey = monthKey;
      } else {
        closingQuantity = transaction.Balance || 0;
        closingValue = (transaction.Balance || 0) * (transaction.NetRate || 0);
      }

      const inwardsQuantity = transaction.Received || 0;
      const inwardsValue = (transaction.Received || 0) * (transaction.NetRate || 0);
      const outwardsQuantity = transaction.Issued || 0;
      const outwardsValue = (transaction.Issued || 0) * (transaction.NetRate || 0);

      if (!map.has(monthKey)) {
        map.set(monthKey, {
          month: `${billDate.toLocaleString('default', { month: 'long' })} ${billDate.getFullYear()}`,
          inwardsQuantity,
          inwardsValue,
          outwardsQuantity,
          outwardsValue,
          closingQuantity: null,
          closingValue: null
        });
      } else {
        const existingMonth = map.get(monthKey);
        existingMonth.inwardsQuantity += inwardsQuantity;
        existingMonth.inwardsValue += inwardsValue;
        existingMonth.outwardsQuantity += outwardsQuantity;
        existingMonth.outwardsValue += outwardsValue;
      }
    });

    if (currentMonthKey !== null && map.has(currentMonthKey)) {
      const lastMonth = map.get(currentMonthKey);
      lastMonth.closingQuantity = closingQuantity;
      lastMonth.closingValue = closingValue;
    }

    setMonthlyTotals(Array.from(map.values()).filter(m => m.month !== 'January 1970'));
  };

  const submitReport = async () => {
    if (!validate()) return;
    setLoading(true);
    
    try {
      const payload = getFiltersPayload();
      const result = await reportApi.itemRegister(payload);
      
      if (result?.length) {
        setData(result);
        const keys = Object.keys(result[0]);
        setColumns(keys);
        
        // Always calculate monthly totals silently just in case they switch the checkbox later
        calculateMonthlyTotals(result);
      } else {
        setData([]);
        setColumns([]);
        setMonthlyTotals([]);
      }
    } catch {
      setData([]);
      setColumns([]);
      setMonthlyTotals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!validate()) return;
    setExportLoading(true);
    try {
      const payload = getFiltersPayload();
      const blob = await reportApi.itemRegisterExport(payload);

      if (blob && blob.size > 0) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'itemRegisterReport.xlsx';
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (e) { console.error('Export error:', e); }
    finally { setExportLoading(false); }
  };

  const clearFilters = () => {
    setSubmitted(false);
    setFilters(defaultFilters);
    setData([]);
    setMonthlyTotals([]);
  };

  const openInvoiceModal = (row: any, rowIndex: number) => {
    if (!row.Invcode || !row.TypeId) return;
    setModalInvCode(row.Invcode);
    setModalInvType(row.TypeId);
    setModalIndex(rowIndex);
    setModalOpen(true);
  };

  const formatNumber = (val: any) => {
    if (val == null || val === '') return '';
    const n = parseFloat(val);
    return isNaN(n) ? val : n.toFixed(2);
  };

  const formatDateStr = (val: any) => {
    if (!val) return '';
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return val;
      return d.toLocaleDateString('en-GB') + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return val;
    }
  };

  const hiddenColumns = ['LedgerId', 'TypeId', 'Invcode', 'Rate', 'Discount1', 'Discount2', 'Discount3', 'NetRate'];
  const columnLabels: Record<string, string> = {
    BillNo: 'Doc No', BillDate: 'Bill Date', Type: 'Invoice Type',
    Party: 'Ledger', StockPlace: 'Stock Place', Balance: 'Balance',
  };

  const invoiceListForModal = data.filter(r => r.Invcode && r.TypeId);

  return (
    <div className="font-sans text-slate-700 dark:text-slate-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-slate-200 dark:bg-slate-700 p-2 rounded-lg">
            <CalendarRange size={20} className="text-slate-600 dark:text-slate-300" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Item Register</h1>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <AutocompleteInput 
            label="Single Item" 
            value={filters.item} 
            options={itemList} 
            onChange={v => setFilters({ ...filters, item: v })} 
            placeholder="Single Item" 
            displayField="particular" 
            templateType="item" 
            required 
            hasError={submitted && !filters.item} 
          />
          <AutocompleteInput 
            label="Lot / Batch No" 
            value={filters.mfrItemName} 
            options={lotNoList} 
            onChange={v => setFilters({ ...filters, mfrItemName: v })} 
            placeholder="Lot / Batch No" 
          />
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">From Date <span className="text-red-500">*</span></label>
            <input type="date" value={filters.fromDate} onChange={e => setFilters({ ...filters, fromDate: e.target.value })}
              className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${submitted && !filters.fromDate ? 'border-red-500 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'}`} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">To Date <span className="text-red-500">*</span></label>
            <input type="date" value={filters.toDate} onChange={e => setFilters({ ...filters, toDate: e.target.value })}
              className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${submitted && !filters.toDate ? 'border-red-500 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'}`} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4 items-end">
          <div className="space-y-1 lg:col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Stock Place</label>
            <select value={filters.spIds} onChange={e => setFilters({ ...filters, spIds: e.target.value })} disabled={filters.isOpeningStock}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none disabled:opacity-50">
              <option value="">Select Stock Place</option>
              {stockPlaceList.map(sp => <option key={sp.id} value={sp.id}>{sp.name}</option>)}
            </select>
          </div>

          <CheckboxInput id="isOpeningStock" label="All Stock Places" checked={filters.isOpeningStock} onChange={v => setFilters({ ...filters, isOpeningStock: v, spIds: v ? '' : filters.spIds })} />
          <CheckboxInput id="stockDetail" label="Stock Balance In Details" checked={filters.stockDetail} onChange={v => setFilters({ ...filters, stockDetail: v })} />
          <CheckboxInput id="monthWise" label="Month Wise" checked={filters.monthWise} onChange={v => setFilters({ ...filters, monthWise: v })} />
        </div>

        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button onClick={submitReport} className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-700/20">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />} Search
          </button>
          <button onClick={clearFilters} className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 rounded-lg transition-all border border-slate-200 dark:border-slate-700">
            <RotateCcw size={16} />
          </button>
          <button onClick={handleExport} className="p-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all shadow-lg shadow-emerald-500/20">
            {exportLoading ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {filters.monthWise ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th rowSpan={2} className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-r border-slate-200 dark:border-slate-700">Month</th>
                  <th colSpan={2} className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-center text-slate-500 border-r border-slate-200 dark:border-slate-700 bg-blue-50/50 dark:bg-blue-900/10">Inwards</th>
                  <th colSpan={2} className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-center text-slate-500 border-r border-slate-200 dark:border-slate-700 bg-rose-50/50 dark:bg-rose-900/10">Outwards</th>
                  <th colSpan={2} className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-center text-slate-500 border-r border-slate-200 dark:border-slate-700 bg-emerald-50/50 dark:bg-emerald-900/10">Closing</th>
                </tr>
                <tr>
                  <th className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-right text-slate-500 bg-blue-50/50 dark:bg-blue-900/10">Quantity</th>
                  <th className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-right text-slate-500 border-r border-slate-200 dark:border-slate-700 bg-blue-50/50 dark:bg-blue-900/10">Value</th>
                  <th className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-right text-slate-500 bg-rose-50/50 dark:bg-rose-900/10">Quantity</th>
                  <th className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-right text-slate-500 border-r border-slate-200 dark:border-slate-700 bg-rose-50/50 dark:bg-rose-900/10">Value</th>
                  <th className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-right text-slate-500 bg-emerald-50/50 dark:bg-emerald-900/10">Quantity</th>
                  <th className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-right text-slate-500 border-r border-slate-200 dark:border-slate-700 bg-emerald-50/50 dark:bg-emerald-900/10">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr><td colSpan={7} className="px-6 py-12 text-center">
                    <Loader2 size={24} className="animate-spin text-blue-600 mx-auto mb-2" />
                  </td></tr>
                ) : !monthlyTotals.length ? (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-400">No data found</td></tr>
                ) : monthlyTotals.map((mt, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800">{mt.month}</td>
                    <td className="px-4 py-3 text-sm text-right text-slate-600 dark:text-slate-400">{formatNumber(mt.inwardsQuantity)}</td>
                    <td className="px-4 py-3 text-sm text-right text-slate-600 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800">{formatNumber(mt.inwardsValue)}</td>
                    <td className="px-4 py-3 text-sm text-right text-slate-600 dark:text-slate-400">{formatNumber(mt.outwardsQuantity)}</td>
                    <td className="px-4 py-3 text-sm text-right text-slate-600 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800">{formatNumber(mt.outwardsValue)}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-slate-700 dark:text-slate-300">{formatNumber(mt.closingQuantity)}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800">{formatNumber(mt.closingValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[calc(100vh-420px)]">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 w-10"></th>
                  {columns.filter(c => !hiddenColumns.includes(c)).map(col => (
                    <th key={col} className={`px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap ${['Balance', 'Received', 'Issued'].includes(col) ? 'text-right' : ''}`}>
                      {columnLabels[col] || col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr><td colSpan={columns.length + 1} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 size={24} className="animate-spin text-blue-600" />
                      <span className="text-xs text-slate-500 font-medium">Fetching register data...</span>
                    </div>
                  </td></tr>
                ) : !data.length ? (
                  <tr><td colSpan={columns.length + 1} className="px-6 py-12 text-center text-sm text-slate-400">
                    {submitted ? 'No register values found for selected criteria' : 'Select an item and click Search'}
                  </td></tr>
                ) : data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3">
                      {row.TypeId && row.Invcode && (
                        <button onClick={() => openInvoiceModal(row, idx)} className="text-blue-500 hover:text-blue-700 transition-colors p-1" title="View Details">
                          <Eye size={14} />
                        </button>
                      )}
                    </td>
                    {columns.filter(c => !hiddenColumns.includes(c)).map(col => (
                      <td key={col} className={`px-4 py-3 text-sm ${['Balance', 'Received', 'Issued'].includes(col) ? 'text-right font-medium text-slate-700 dark:text-slate-300' : 'text-slate-600 dark:text-slate-400'} whitespace-nowrap`}>
                        {col === 'BillDate' ? formatDateStr(row[col]) : ['Balance', 'Received', 'Issued'].includes(col) ? formatNumber(row[col]) : (row[col] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">{filters.monthWise ? 'Total Months:' : 'Total Rows:'}</span>
              <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded text-[10px] font-bold">
                {filters.monthWise ? monthlyTotals.length : data.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      <InvoiceDetailsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        invCode={modalInvCode}
        invType={modalInvType}
        invoiceList={invoiceListForModal}
        currentIndex={modalIndex}
      />
    </div>
  );
};

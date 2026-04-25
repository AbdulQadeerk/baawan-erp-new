import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Search, RotateCcw, FileSpreadsheet, FileText,
  LayoutGrid, Loader2, Calculator, Landmark, X, Eye, Info
} from 'lucide-react';
import { motion } from 'motion/react';
import { reportApi } from '../services/report.service';
import { commonApi, apiClient } from '../lib/api-client';
import * as XLSX from 'xlsx';

interface AutocompleteOption {
  name: string;
  [key: string]: any;
}

import { CommonAutocompleteTemplate } from '../shared/CommonAutocompleteTemplate';

// ─── Autocomplete Input Component ──────────────────────────────────────────
const AutocompleteInput: React.FC<{
  label: string;
  value: any;
  options: AutocompleteOption[];
  onChange: (val: any) => void;
  placeholder: string;
  displayField?: string;
  templateType?: string;
}> = ({ label, value, options, onChange, placeholder, displayField = 'name', templateType = 'name' }) => {
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
    ? options.filter(o => o[displayField]?.toLowerCase().includes(search.toLowerCase())).slice(0, 10)
    : [];

  return (
    <div className="space-y-1 relative" ref={ref}>
      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</label>
      <input
        type="search"
        placeholder={placeholder}
        value={value ? (value[displayField] || '') : search}
        onChange={e => { setSearch(e.target.value); onChange(null); setOpen(true); }}
        onFocus={() => setOpen(true)}
        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-50 top-full mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
          {filtered.map((opt, i) => (
            <button key={i} onClick={() => { onChange(opt); setSearch(''); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300">
              <CommonAutocompleteTemplate result={opt} templateType={templateType} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main Stock Valuation Report ───────────────────────────────────────────
export const StockValuationReport: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);

  // Filter lists
  const [brandList, setBrandList] = useState<AutocompleteOption[]>([]);
  const [categoryList, setCategoryList] = useState<AutocompleteOption[]>([]);
  const [sizeList, setSizeList] = useState<AutocompleteOption[]>([]);
  const [typeList, setTypeList] = useState<AutocompleteOption[]>([]);
  const [nameList, setNameList] = useState<AutocompleteOption[]>([]);
  const [codeList, setCodeList] = useState<AutocompleteOption[]>([]);

  // Filter values
  const [filters, setFilters] = useState<Record<string, any>>({
    brand: null, category: null, sizes: null, type: null,
    item_CodeTxt: null, name: null, invType: null
  });

  // Load API data
  useEffect(() => {
    const loadDistinct = (column: string, setter: (v: any[]) => void) => {
      commonApi.itemCategoryList({ table: 0, column }).then(setter).catch(() => {});
    };
    loadDistinct('Brand', setBrandList);
    loadDistinct('Category', setCategoryList);
    loadDistinct('Sizes', setSizeList);
    loadDistinct('Type', setTypeList);
    loadDistinct('Name', setNameList);
    loadDistinct('Item_CodeTxt', setCodeList);
  }, []);

  const getFilters = useCallback(() => ({
    brand: filters.brand?.name || null,
    category: filters.category?.name || null,
    sizes: filters.sizes?.name || null,
    type: filters.type?.name || null,
    item_CodeTxt: filters.item_CodeTxt?.name || null,
    name: filters.name?.name || null,
    invType: null
  }), [filters]);

  const submitReport = async () => {
    setLoading(true);
    try {
      const result = await reportApi.stockValuationReport(getFilters());
      setData(result || []);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const exportData = await reportApi.stockValuationReportExport({ ...getFilters() });
      if (exportData) {
        const a = document.createElement('a');
        const objectUrl = URL.createObjectURL(exportData);
        a.href = objectUrl;
        a.setAttribute("download", 'StockValuationReport.xlsx');
        a.click();
        URL.revokeObjectURL(objectUrl);
      }
    } catch (e) { console.error('Export error:', e); }
    finally { setExportLoading(false); }
  };

  const clearFilters = () => {
    setFilters({ brand: null, category: null, sizes: null, type: null, item_CodeTxt: null, name: null, invType: null });
  };

  const formatNumber = (val: any) => {
    if (val == null || val === '') return '';
    const n = parseFloat(val);
    return isNaN(n) ? val : n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Grouping logic removed to match legacy UI flat list

  const totalStock = data.reduce((s, i) => s + (parseFloat(i.Stock) || 0), 0);
  const totalLastValue = data.reduce((s, i) => s + (parseFloat(i.Last_Purchase_Value) || 0), 0);
  const totalAvgValue = data.reduce((s, i) => s + (parseFloat(i.Avg_Purchase_Value) || 0), 0);

  return (
    <div className="font-sans text-slate-700 dark:text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg text-emerald-600 dark:text-emerald-400">
            <Calculator size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Stock Valuation Report</h1>
            <p className="text-xs text-slate-500 font-medium">Real-time inventory costing and financial valuation summary.</p>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 mb-5">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
          <AutocompleteInput label="Item Code" value={filters.item_CodeTxt} options={codeList} onChange={v => setFilters({ ...filters, item_CodeTxt: v })} placeholder="Item Code" />
          <AutocompleteInput label="Item Name" value={filters.name} options={nameList} onChange={v => setFilters({ ...filters, name: v })} placeholder="Item Name" />
          <AutocompleteInput label="Brand" value={filters.brand} options={brandList} onChange={v => setFilters({ ...filters, brand: v })} placeholder="Brand" />
          <AutocompleteInput label="Category" value={filters.category} options={categoryList} onChange={v => setFilters({ ...filters, category: v })} placeholder="Category" />
          <AutocompleteInput label="Sub Category" value={filters.sizes} options={sizeList} onChange={v => setFilters({ ...filters, sizes: v })} placeholder="Sub Category" />
          <AutocompleteInput label="Type" value={filters.type} options={typeList} onChange={v => setFilters({ ...filters, type: v })} placeholder="Type" />
        </div>

        <div className="flex items-center gap-2 justify-end">
          <button onClick={submitReport} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-emerald-600/20" title="Apply Filters">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            <span className="hidden sm:inline">Search</span>
          </button>
          <button onClick={clearFilters} className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 rounded-lg transition-all border border-slate-200 dark:border-slate-700" title="Clear">
            <RotateCcw size={16} />
          </button>
          <button onClick={handleExport} className="p-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all shadow-lg shadow-blue-500/20" title="Export to Excel">
            {exportLoading ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
          </button>
        </div>
      </div>

      <div className="flex gap-6 flex-col xl:flex-row">
        {/* Table Section */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-auto custom-scrollbar max-h-[calc(100vh-320px)]">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Item Code</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Item Name</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Brand</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sub Category</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Total Stock</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Last Purch. Rate</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Last Purch. Value</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Avg Purch. Rate</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Avg Purch. Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr><td colSpan={11} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 size={24} className="animate-spin text-emerald-600" />
                      <span className="text-xs text-slate-500 font-medium">Calculating valuation...</span>
                    </div>
                  </td></tr>
                ) : !data.length ? (
                  <tr><td colSpan={11} className="px-6 py-12 text-center text-sm text-slate-400">
                    No data found for the selected criteria.
                  </td></tr>
                ) : data.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300">{item.Item_CodeTxt}</td>
                    <td className="px-4 py-2 text-sm font-semibold text-slate-800 dark:text-slate-100">{item.Name}</td>
                    <td className="px-4 py-2 text-xs text-slate-500">{item.Brand || ''}</td>
                    <td className="px-4 py-2 text-xs text-slate-500">{item.Category || ''}</td>
                    <td className="px-4 py-2 text-xs text-slate-500">{item.Sizes || ''}</td>
                    <td className="px-4 py-2 text-xs text-slate-500">{item.Type || ''}</td>
                    <td className="px-4 py-2 text-sm font-black text-slate-800 dark:text-slate-200 text-right">{item.Stock}</td>
                    <td className="px-4 py-2 text-xs text-slate-500 text-right">{formatNumber(item.Last_Purchaserate)}</td>
                    <td className="px-4 py-2 text-sm font-bold text-emerald-600 dark:text-emerald-400 text-right">{formatNumber(item.Last_Purchase_Value)}</td>
                    <td className="px-4 py-2 text-xs text-slate-500 text-right">{formatNumber(item.Avg_Purchaserate)}</td>
                    <td className="px-4 py-2 text-sm font-bold text-blue-600 dark:text-blue-400 text-right">{formatNumber(item.Avg_Purchase_Value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Totals */}
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Rows:</span>
                <span className="px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs font-black">{data.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Stock:</span>
                <span className="px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs font-black">{totalStock}</span>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Last Purch. Value</p>
                <p className="text-base font-black text-emerald-600 dark:text-emerald-400">{formatNumber(totalLastValue)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Avg Purch. Value</p>
                <p className="text-base font-black text-blue-600 dark:text-blue-400">{formatNumber(totalAvgValue)}</p>
              </div>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
};

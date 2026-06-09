import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Search, RotateCcw, FileSpreadsheet, FileText,
  LayoutGrid, Loader2, Calculator, Landmark, X, Eye, Info, Printer
} from 'lucide-react';
import { motion } from 'motion/react';
import { reportApi } from '../../../services/report.service';
import { commonApi, apiClient } from '../../../lib/api-client';
import * as XLSX from 'xlsx';

interface AutocompleteOption {
  name: string;
  [key: string]: any;
}

import { CommonAutocompleteTemplate } from '../../../shared/CommonAutocompleteTemplate';

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
        className="w-full px-3 py-[7px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
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
  const [data, setData] = useState<any[]>([]);
  const [animProgress, setAnimProgress] = useState(0);

  // Filter lists
  const [brandList, setBrandList] = useState<AutocompleteOption[]>([]);
  const [categoryList, setCategoryList] = useState<AutocompleteOption[]>([]);
  const [sizeList, setSizeList] = useState<AutocompleteOption[]>([]);
  const [typeList, setTypeList] = useState<AutocompleteOption[]>([]);
  const [nameList, setNameList] = useState<AutocompleteOption[]>([]);
  const [codeList, setCodeList] = useState<AutocompleteOption[]>([]);
  const [stockPlaceList, setStockPlaceList] = useState<any[]>([]);
  const [itemList, setItemList] = useState<any[]>([]);

  // Filter values
  const defaultFilters = {
    brand: null, category: null, sizes: null, type: null,
    item_CodeTxt: null, name: null,
    fromDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0],
    spId: '',
    itemSearchBy: '1',
    itemId: null
  };

  const [filters, setFilters] = useState<Record<string, any>>(defaultFilters);

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

    commonApi.dropdown({ table: 4 }).then(setStockPlaceList).catch(() => {});
    
    try {
      const items = JSON.parse(localStorage.getItem('item-list') || '[]');
      setItemList(items.filter((e:any) => e.isact).map((e:any) => ({ ...e, name: e.nm })));
    } catch {}
  }, []);

  useEffect(() => {
    if (data.length === 0) {
      setAnimProgress(0);
      return;
    }
    
    setAnimProgress(0);
    let start: number | null = null;
    let animationFrameId: number;
    const duration = 1200;
    
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      setAnimProgress(easeProgress);
      
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      }
    };
    
    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [data]);

  const getFilters = useCallback(() => {
    const formatDateForApi = (dateStr: string, time: string) => {
      if (!dateStr) return null;
      const [y, m, d] = dateStr.split("-");
      return `${d}/${m}/${y} ${time}`;
    };

    return {
      fromDate: formatDateForApi(filters.fromDate, "00:00:00"),
      toDate: formatDateForApi(filters.toDate, "23:59:59"),
      spId: filters.spId ? parseInt(filters.spId) : null,
      itemSearchBy: parseInt(filters.itemSearchBy),
      itemId: filters.itemId ? (filters.itemId.iid || filters.itemId.id) : null,
      brand: filters.brand?.name || null,
      category: filters.category?.name || null,
      sizes: filters.sizes?.name || null,
      type: filters.type?.name || null,
      item_CodeTxt: filters.item_CodeTxt?.name || null,
      name: filters.name?.name || null,
      sessionId: "388db132-4a83-4e27-b68c-240432775261,2" // Keeping a dummy session ID or omit if API auto handles
    };
  }, [filters]);

  const submitReport = async () => {
    setLoading(true);
    try {
      const payload = getFilters();
      const result = await reportApi.stockValuationReport(payload);
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
      if (exportData && exportData.size > 0) {
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
    setFilters(defaultFilters);
    setData([]);
  };

  const formatNumber = (val: any) => {
    if (val == null || val === '') return '';
    const n = parseFloat(val);
    return isNaN(n) ? val : n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const totalOpenStock = data.reduce((s, i) => s + (parseFloat(i.OpenStock) || 0), 0);
  const totalOpenValue = data.reduce((s, i) => s + (parseFloat(i.OpenStockValue) || 0), 0);
  const totalInStock = data.reduce((s, i) => s + (parseFloat(i.InStock) || 0), 0);
  const totalInValue = data.reduce((s, i) => s + (parseFloat(i.InStockValue) || 0), 0);
  const totalOutStock = data.reduce((s, i) => s + (parseFloat(i.OutStock) || 0), 0);
  const totalOutValue = data.reduce((s, i) => s + (parseFloat(i.OutStockValue) || 0), 0);
  const totalBalStock = data.reduce((s, i) => s + (parseFloat(i.BalStock) || 0), 0);
  const totalBalValue = data.reduce((s, i) => s + (parseFloat(i.BalStockValue) || 0), 0);

  // Dynamic Valuation Breakdown Calculation
  const brandValuations = data.reduce((acc: Record<string, number>, item) => {
    const brand = item.Brand || 'Others';
    const val = parseFloat(item.BalStockValue) || 0;
    if (val > 0) acc[brand] = (acc[brand] || 0) + val;
    return acc;
  }, {} as Record<string, number>);

  const sortedBrands = (Object.entries(brandValuations) as [string, number][]).sort((a, b) => b[1] - a[1]);
  const specificBrands = sortedBrands.filter(b => b[0] !== 'Others' && b[0] !== '');
  
  const finalTop1 = (specificBrands[0] || ['N/A', 0]) as [string, number];
  const finalTop2 = (specificBrands[1] || ['N/A', 0]) as [string, number];
  
  const othersVal = sortedBrands
    .filter(b => b[0] !== finalTop1[0] && b[0] !== finalTop2[0])
    .reduce((sum: number, b) => sum + b[1], 0);

  const totalPositiveVal = sortedBrands.reduce((sum: number, b) => sum + b[1], 0);

  const top1Pct = totalPositiveVal > 0 ? ((finalTop1[1] / totalPositiveVal) * 100).toFixed(1) : '0.0';
  const top2Pct = totalPositiveVal > 0 ? ((finalTop2[1] / totalPositiveVal) * 100).toFixed(1) : '0.0';
  const othersPct = totalPositiveVal > 0 ? ((othersVal / totalPositiveVal) * 100).toFixed(1) : '0.0';

  const p1 = Number(top1Pct) * animProgress;
  const p2 = p1 + (Number(top2Pct) * animProgress);
  const animTop1Pct = (Number(top1Pct) * animProgress).toFixed(1);

  return (
    <div className="font-sans text-slate-700 dark:text-slate-200 pt-4">
      <div className="flex gap-6 flex-col xl:flex-row">
        {/* Left Column */}
        <div className="flex-1 min-w-0 flex flex-col">
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
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 mb-2">
              <AutocompleteInput label="Single Item" value={filters.itemId} options={itemList} onChange={v => setFilters({ ...filters, itemId: v })} placeholder="Single Item" templateType="item" />
              <AutocompleteInput label="Brand" value={filters.brand} options={brandList} onChange={v => setFilters({ ...filters, brand: v })} placeholder="Brand" />
              <AutocompleteInput label="Category" value={filters.category} options={categoryList} onChange={v => setFilters({ ...filters, category: v })} placeholder="Category" />
              <AutocompleteInput label="Sub Category" value={filters.sizes} options={sizeList} onChange={v => setFilters({ ...filters, sizes: v })} placeholder="Sub Category" />
              <AutocompleteInput label="Type" value={filters.type} options={typeList} onChange={v => setFilters({ ...filters, type: v })} placeholder="Type" />
              <AutocompleteInput label="Item Code" value={filters.item_CodeTxt} options={codeList} onChange={v => setFilters({ ...filters, item_CodeTxt: v })} placeholder="Item Code" />
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Search By</label>
                <select
                  value={filters.itemSearchBy}
                  onChange={(e) => setFilters({ ...filters, itemSearchBy: e.target.value })}
                  className="w-full px-3 py-[7px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="1">All Stock</option>
                  <option value="2">Positive Stock</option>
                  <option value="3">Negative Stock</option>
                  <option value="4">Zero Stock</option>
                </select>
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Stock Place</label>
                <select
                  value={filters.spId}
                  onChange={(e) => setFilters({ ...filters, spId: e.target.value })}
                  className="w-full px-3 py-[7px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Select Stock Place</option>
                  {stockPlaceList.map(sp => <option key={sp.id} value={sp.id}>{sp.name}</option>)}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-end justify-between gap-4 mt-2 pt-3 border-t border-slate-100 dark:border-slate-800 w-full">
              <div className="flex flex-wrap items-end gap-3">
                <div className="w-full sm:w-36 shrink-0 space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">From Date <span className="text-rose-500">*</span></label>
                  <input
                    type="date"
                    value={filters.fromDate}
                    onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-[7px] text-[13px] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                  />
                </div>
                <div className="w-full sm:w-36 shrink-0 space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">To Date <span className="text-rose-500">*</span></label>
                  <input
                    type="date"
                    value={filters.toDate}
                    onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-[7px] text-[13px] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={submitReport} disabled={loading} className="w-10 h-10 flex items-center justify-center bg-[#2D9E75] text-white rounded-lg hover:opacity-90 transition-all shadow-sm cursor-pointer disabled:opacity-70" title="Search">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                </button>
                <button onClick={clearFilters} className="w-10 h-10 flex items-center justify-center bg-lime-500 text-white rounded-lg hover:opacity-90 transition-all shadow-sm cursor-pointer" title="Reset Filters">
                  <RotateCcw size={16} />
                </button>
                <button disabled={loading || !data.length} className="w-10 h-10 flex items-center justify-center bg-rose-500 text-white rounded-lg hover:opacity-90 transition-all shadow-sm cursor-pointer disabled:opacity-70" title="PDF Export">
                  <Printer size={16} />
                </button>
                <button onClick={handleExport} disabled={exportLoading || loading || !data.length} className="w-10 h-10 flex items-center justify-center bg-emerald-600 text-white rounded-lg hover:opacity-90 transition-all shadow-sm cursor-pointer disabled:opacity-70" title="Excel Export">
                  {exportLoading ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
                </button>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col mb-4">
            <div className="overflow-auto custom-scrollbar max-h-[calc(100vh-320px)]">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Item Name</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right whitespace-nowrap">Open Stock</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right whitespace-nowrap">Open Rate</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right whitespace-nowrap">Open Value</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right whitespace-nowrap">In Stock</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right whitespace-nowrap">In Rate</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right whitespace-nowrap">In Value</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right whitespace-nowrap">Out Stock</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right whitespace-nowrap">Out Rate</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right whitespace-nowrap">Out Value</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right whitespace-nowrap">Bal Stock</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right whitespace-nowrap">Bal Rate</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right whitespace-nowrap">Bal Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading ? (
                    <tr><td colSpan={13} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 size={24} className="animate-spin text-emerald-600" />
                        <span className="text-xs text-slate-500 font-medium">Calculating valuation...</span>
                      </div>
                    </td></tr>
                  ) : !data.length ? (
                    <tr><td colSpan={13} className="px-6 py-12 text-center text-sm text-slate-400">
                      No data found for the selected criteria.
                    </td></tr>
                  ) : data.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="px-4 py-2 text-sm font-semibold text-slate-800 dark:text-slate-100 whitespace-nowrap">{item.ItemName}</td>
                      <td className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 text-right">{formatNumber(item.OpenStock)}</td>
                      <td className="px-4 py-2 text-xs text-slate-400 text-right">{formatNumber(item.OpenRate)}</td>
                      <td className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 text-right">{formatNumber(item.OpenStockValue)}</td>
                      <td className="px-4 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 text-right">{formatNumber(item.InStock)}</td>
                      <td className="px-4 py-2 text-xs text-slate-400 text-right">{formatNumber(item.InRate)}</td>
                      <td className="px-4 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 text-right">{formatNumber(item.InStockValue)}</td>
                      <td className="px-4 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 text-right">{formatNumber(item.OutStock)}</td>
                      <td className="px-4 py-2 text-xs text-slate-400 text-right">{formatNumber(item.OutRate)}</td>
                      <td className="px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 text-right">{formatNumber(item.OutStockValue)}</td>
                      <td className="px-4 py-2 text-sm font-black text-slate-800 dark:text-slate-200 text-right">{formatNumber(item.BalStock)}</td>
                      <td className="px-4 py-2 text-xs text-slate-500 text-right">{formatNumber(item.BalRate)}</td>
                      <td className="px-4 py-2 text-sm font-bold text-emerald-600 dark:text-emerald-400 text-right">{formatNumber(item.BalStockValue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Inner Footer Totals */}
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rows:</span>
                  <span className="px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs font-black">{data.length}</span>
                </div>
              </div>
              <div className="flex gap-6 overflow-x-auto custom-scrollbar">
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Tot Open Val</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{formatNumber(totalOpenValue)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Tot In Val</p>
                  <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{formatNumber(totalInValue)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Tot Out Val</p>
                  <p className="text-sm font-bold text-rose-600 dark:text-rose-400">{formatNumber(totalOutValue)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Footer Summary Bar */}
          <footer className="sticky bottom-0 z-10 mt-6 bg-brand-yellow dark:bg-brand-yellow/10 px-4 py-2.5 md:px-6 md:py-4 rounded-xl shadow-[0_-4px_20px_rgba(0,0,0,0.15)] flex flex-col md:flex-row justify-between items-center gap-3 border border-brand-yellow/20 select-none">
            <div className="grid grid-cols-2 md:flex items-center gap-4 md:gap-12 w-full md:w-auto">
              <div className="flex flex-col">
                <span className="text-[9px] md:text-[10px] font-black text-slate-800/80 dark:text-brand-yellow/70 uppercase tracking-widest leading-tight">Total Unique Items</span>
                <span className="text-sm md:text-xl font-black text-slate-950 dark:text-brand-yellow leading-tight mt-0.5">
                  {data.length > 0 ? formatNumber(data.length) + ' SKUs' : '0 SKUs'}
                </span>
              </div>
              <div className="flex flex-col border-l border-slate-900/10 dark:border-brand-yellow/10 pl-4 md:border-l-0 md:pl-0">
                <span className="text-[9px] md:text-[10px] font-black text-slate-800/80 dark:text-brand-yellow/70 uppercase tracking-widest leading-tight">Total Bal Stock</span>
                <span className="text-sm md:text-xl font-black text-slate-950 dark:text-brand-yellow leading-tight mt-0.5">
                  {data.length > 0 ? formatNumber(totalBalStock) + ' Units' : '0 Units'}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between md:justify-start gap-3 md:gap-4 bg-slate-900/10 dark:bg-brand-yellow/20 px-4 py-1.5 md:px-6 md:py-2 rounded-xl border border-slate-900/10 dark:border-brand-yellow/20 w-full md:w-auto">
              <div className="flex flex-col items-start md:items-end">
                <span className="text-[9px] md:text-[10px] font-black text-slate-800/80 dark:text-brand-yellow/70 uppercase tracking-widest leading-tight">Grand Total Bal Value</span>
                <span className="text-lg md:text-3xl font-black text-slate-950 dark:text-brand-yellow leading-tight">
                  {data.length > 0 ? '₹' + formatNumber(totalBalValue) : '₹0.00'}
                </span>
              </div>
              <div className="h-6 md:h-10 w-[2px] bg-slate-900/10 dark:bg-brand-yellow/20"></div>
              <Landmark className="w-5 h-5 md:w-9 md:h-9 text-slate-950 dark:text-brand-yellow flex-shrink-0" />
            </div>
          </footer>
        </div>

        {/* Sidebar */}
        <div className="xl:w-80 flex flex-col gap-6 shrink-0">
          {/* Breakdown Chart */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6">Valuation Breakdown</h3>
            <div className="relative flex items-center justify-center mb-6">
              <div 
                className="w-48 h-48 rounded-full bg-slate-200 dark:bg-slate-800 relative flex items-center justify-center shadow-inner"
                style={{ backgroundImage: `conic-gradient(#2563eb 0% ${p1}%, #60a5fa ${p1}% ${p2}%, transparent ${p2}% 100%)` }}
              >
                <div className="absolute inset-4 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.05)]">
                  <div className="text-center flex flex-col items-center justify-center p-2">
                    <span className="block text-2xl font-black text-slate-900 dark:text-white leading-none mb-1">{animTop1Pct}%</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase text-center w-full truncate px-2" title={finalTop1[0] !== 'N/A' ? finalTop1[0] : 'Top Brand'}>
                      {finalTop1[0] !== 'N/A' ? finalTop1[0] : 'Top Brand'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 truncate max-w-[120px]" title={finalTop1[0] !== 'N/A' ? finalTop1[0] : 'Top Brand'}>
                    {finalTop1[0] !== 'N/A' ? finalTop1[0] : 'Top Brand'}
                  </span>
                </div>
                <span className="text-xs font-black">{top1Pct}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 truncate max-w-[120px]" title={finalTop2[0] !== 'N/A' ? finalTop2[0] : 'Secondary Brand'}>
                    {finalTop2[0] !== 'N/A' ? finalTop2[0] : 'Secondary Brand'}
                  </span>
                </div>
                <span className="text-xs font-black">{top2Pct}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-800"></div>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Others</span>
                </div>
                <span className="text-xs font-black">{othersPct}%</span>
              </div>
            </div>
          </div>
          {/* Methodology Card */}
          <div className="bg-blue-600/5 dark:bg-blue-600/20 p-5 rounded-xl border border-blue-600/20 dark:border-blue-600/40">
            <div className="flex items-center gap-2 mb-2 text-blue-600 dark:text-blue-400">
              <Info size={18} />
              <h4 className="text-xs font-black uppercase tracking-wider">Methodology Note</h4>
            </div>
            <p className="text-[12px] leading-relaxed text-slate-600 dark:text-slate-300">
              Valuation is calculated using the <strong>FIFO</strong> method. Costs are assigned based on the chronological sequence of purchase orders. Real-time exchange rates are applied for international procurement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

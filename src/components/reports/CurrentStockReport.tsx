import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search, RotateCcw, FileSpreadsheet, FileText, Edit2, Eye,
  LayoutGrid, Loader2, X, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { reportApi } from '../../services/report.service';
import { commonApi } from '../../lib/api-client';
import { apiClient } from '../../lib/api-client';
import { ItemRegisterView } from './ItemRegisterView';
import * as XLSX from 'xlsx';

interface TabItem {
  id: number;
  text: string;
  itemid: number;
}

interface AutocompleteOption {
  name: string;
  [key: string]: any;
}

// ─── Autocomplete Input Component ──────────────────────────────────────────
const AutocompleteInput: React.FC<{
  label: string;
  value: any;
  options: AutocompleteOption[];
  onChange: (val: any) => void;
  placeholder: string;
  displayField?: string;
}> = ({ label, value, options, onChange, placeholder, displayField = 'name' }) => {
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
              {opt[displayField]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Item Detail Banner ────────────────────────────────────────────────────
const ItemDetailBanner: React.FC<{ data: any; onClose: () => void }> = ({ data, onClose }) => {
  if (!data) return null;
  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
      className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-4 overflow-hidden">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex flex-wrap gap-6 text-sm">
          <div><span className="font-bold text-blue-800 dark:text-blue-300">Item Code :-</span> <span className="text-slate-700 dark:text-slate-300">{data.item_CodeTxt || '-'}</span></div>
          <div><span className="font-bold text-blue-800 dark:text-blue-300">HSN :-</span> <span className="text-slate-700 dark:text-slate-300">{data.hsnNo || '-'}</span></div>
          {data.priceCategories?.map((pc: any, i: number) => (
            <div key={i}><span className="font-bold text-blue-800 dark:text-blue-300">{pc.label}:</span> <span className="text-slate-700 dark:text-slate-300">{Number(pc.rate || 0).toFixed(2)}</span></div>
          ))}
          <div><span className="font-bold text-blue-800 dark:text-blue-300">MSL :-</span> <span className="text-slate-700 dark:text-slate-300">{data.minimum_Qty ?? 0}</span></div>
          <div><span className="font-bold text-blue-800 dark:text-blue-300">MOQ :-</span> <span className="text-slate-700 dark:text-slate-300">{data.reOrderQty ?? 0}</span></div>
        </div>
        <button onClick={onClose} className="p-1.5 bg-blue-100 dark:bg-blue-800 hover:bg-blue-200 rounded-lg transition-colors text-blue-600 dark:text-blue-300"><X size={16} /></button>
      </div>
      <div className="flex gap-6 mt-2 text-sm border-t border-blue-200 dark:border-blue-800 pt-2">
        <div><span className="font-bold text-blue-800 dark:text-blue-300">Note :-</span> <span className="text-slate-700 dark:text-slate-300">{data.note || '-'}</span></div>
        <div><span className="font-bold text-blue-800 dark:text-blue-300">Location :-</span> <span className="text-slate-700 dark:text-slate-300">{data.location || '-'}</span></div>
      </div>
    </motion.div>
  );
};

// ─── Main Current Stock Report ─────────────────────────────────────────────
export const CurrentStockReport: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);

  // Filter lists from API (mirrors Angular getDataFromApi)
  const [brandList, setBrandList] = useState<AutocompleteOption[]>([]);
  const [categoryList, setCategoryList] = useState<AutocompleteOption[]>([]);
  const [sizeList, setSizeList] = useState<AutocompleteOption[]>([]);
  const [typeList, setTypeList] = useState<AutocompleteOption[]>([]);
  const [groupList, setGroupList] = useState<AutocompleteOption[]>([]);
  const [nameList, setNameList] = useState<AutocompleteOption[]>([]);
  const [codeList, setCodeList] = useState<AutocompleteOption[]>([]);
  const [stockPlaceList, setStockPlaceList] = useState<any[]>([]);
  const [itemList, setItemList] = useState<any[]>([]);
  const [priceCategoryList, setPriceCategoryList] = useState<any[]>([]);

  // Filter values
  const [filters, setFilters] = useState<Record<string, any>>({
    brand: null, category: null, sizes: null, type: null,
    itemGroup: null, item_CodeTxt: null, name: null,
    item: null, stockPlace: '',
  });

  // Item detail view (top banner when eye icon clicked)
  const [singleRecordData, setSingleRecordData] = useState<any>(null);

  // Tabs for item register drill-down (mirrors Angular tab system)
  const [tabs, setTabs] = useState<TabItem[]>([]);
  const [selectedTab, setSelectedTab] = useState(1);
  const counterRef = useRef(2);

  const singleItemRef = useRef<HTMLInputElement>(null);

  // ─── Load filter options from API on mount ─────────────────────────────
  useEffect(() => {
    const loadDistinct = (column: string, setter: (v: any[]) => void) => {
      commonApi.itemCategoryList({ table: 0, column }).then(setter).catch(() => {});
    };
    loadDistinct('Brand', setBrandList);
    loadDistinct('Category', setCategoryList);
    loadDistinct('Sizes', setSizeList);
    loadDistinct('Type', setTypeList);
    loadDistinct('ItemGroup', setGroupList);
    loadDistinct('Name', setNameList);
    loadDistinct('Item_CodeTxt', setCodeList);

    // Stock places (table: 4)
    commonApi.dropdown({ table: 4 }).then(setStockPlaceList).catch(() => {});

    // Price categories (table: 27)
    commonApi.dropdown({ table: 27 }).then(d => {
      setPriceCategoryList(d.map((item: any) => ({ priceCategoryID: item.id, priceCategoryName: item.name })));
    }).catch(() => {});

    singleItemRef.current?.focus();
  }, []);

  // ─── Build filter payload (mirrors Angular getFilters) ─────────────────
  const getFilters = useCallback(() => ({
    brand: filters.brand?.name || null,
    category: filters.category?.name || null,
    sizes: filters.sizes?.name || null,
    type: filters.type?.name || null,
    itemGroup: filters.itemGroup?.name || null,
    item_CodeTxt: filters.item_CodeTxt?.name || null,
    name: filters.name?.name || null,
    itemId: filters.item?.iid || null,
    spId: filters.stockPlace || null,
  }), [filters]);

  // ─── Submit report (mirrors Angular submitReportView) ──────────────────
  const submitReport = async () => {
    setLoading(true);
    try {
      const result = await reportApi.currentStock(getFilters());
      if (result?.length) {
        const keys = Object.keys(result[0]).filter(k => k !== 'itemGroup');
        setColumns(keys);
        setData(result);
      } else {
        setData([]);
        setColumns([]);
      }
    } catch {
      setData([]);
      setColumns([]);
    } finally {
      setLoading(false);
    }
  };

  // ─── Export to Excel using xlsx library ────────────────────────────────
  const handleExport = async () => {
    setExportLoading(true);
    try {
      const exportData = data.length ? data : await reportApi.currentStock(getFilters());
      if (exportData?.length) {
        const visibleCols = Object.keys(exportData[0]).filter(c => c !== 'itemid' && c !== 'itemGroup');
        const wsData = [
          visibleCols.map(c => columnLabel(c)),
          ...exportData.map((row: any) => visibleCols.map(c => {
            const val = row[c];
            return isNumericColumn(c) ? (parseFloat(val) || 0) : (val ?? '');
          }))
        ];
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, 'Current Stock');
        XLSX.writeFile(wb, 'current-stock-report.xlsx');
      }
    } catch (e) { console.error('Export error:', e); }
    finally { setExportLoading(false); }
  };

  // ─── Print using pdfmake ───────────────────────────────────────────────
  const handlePrint = async () => {
    setPrintLoading(true);
    try {
      const printData = data.length ? data : await reportApi.currentStock(getFilters());
      if (printData?.length) {
        const pdfMake = (await import('pdfmake/build/pdfmake')).default;
        const pdfFonts = (await import('pdfmake/build/vfs_fonts')).default;
        (pdfMake as any).vfs = (pdfFonts as any).pdfMake?.vfs || pdfFonts;

        // Include all columns (including itemid) except itemGroup
        const allCols = Object.keys(printData[0]).filter(c => c !== 'itemGroup');
        const headers = allCols.map(c => ({ text: columnLabel(c), style: 'tableHeader' }));
        const rows = printData.map((row: any) => allCols.map(c => {
          return isNumericColumn(c) ? formatNumber(row[c]) : String(row[c] ?? '');
        }));

        // Add totals row
        const totalsRow = allCols.map(c => {
          if (c === 'itemcode') return { text: 'Total', bold: true };
          if (isNumericColumn(c) && c !== 'itemid') {
            const sum = printData.reduce((s: number, r: any) => s + (parseFloat(r[c]) || 0), 0);
            return { text: formatNumber(sum), bold: true };
          }
          return '';
        });
        rows.push(totalsRow);

        const now = new Date();
        const printedOn = `Printed on : ${now.toLocaleDateString('en-GB')} ${now.toLocaleTimeString('en-GB')}`;

        const docDef: any = {
          pageOrientation: 'landscape',
          pageSize: 'A4',
          content: [
            { text: printedOn, alignment: 'right', fontSize: 8, color: '#64748b', margin: [0, 0, 0, 5] },
            { text: 'Current Stock Report', style: 'header', margin: [0, 0, 0, 10] },
            {
              table: { headerRows: 1, widths: allCols.map(() => 'auto'), body: [headers, ...rows] },
              layout: { hLineWidth: () => 0.5, vLineWidth: () => 0.5, hLineColor: () => '#e2e8f0', vLineColor: () => '#e2e8f0', paddingLeft: () => 3, paddingRight: () => 3, paddingTop: () => 2, paddingBottom: () => 2 }
            },
            { text: `Total Rows: ${printData.length}`, style: 'footer', margin: [0, 10, 0, 0] }
          ],
          styles: {
            header: { fontSize: 14, bold: true, color: '#1e293b' },
            tableHeader: { fontSize: 7, bold: true, color: '#475569', fillColor: '#f1f5f9' },
            footer: { fontSize: 9, italics: true, color: '#64748b' }
          },
          defaultStyle: { fontSize: 7 }
        };
        pdfMake.createPdf(docDef).open();
      }
    } catch (e) { console.error('PDF generation error:', e); }
    finally { setPrintLoading(false); }
  };

  // ─── Clear filters ────────────────────────────────────────────────────
  const clearFilters = () => {
    setFilters({ brand: null, category: null, sizes: null, type: null, itemGroup: null, item_CodeTxt: null, name: null, item: null, stockPlace: '' });
  };

  // ─── Open item detail (view button — mirrors Angular openModel) ────────
  const openItemDetail = async (itemid: number) => {
    try {
      // Try API first (matches Angular InventoryService.Get)
      let itemData: any = null;
      try {
        itemData = await apiClient.post('/api/item/GetById', { id: itemid });
      } catch (apiErr) {
        console.warn('Item/GetById failed, trying localStorage fallback:', apiErr);
      }

      // Fallback: resolve from localStorage item-lst
      if (!itemData || !itemData.nm) {
        try {
          const items = JSON.parse(localStorage.getItem('item-lst') || '[]');
          const found = items.find((it: any) => it.iid === itemid || it.iid === String(itemid));
          if (found) {
            itemData = {
              item_CodeTxt: found.ict || '',
              hsnNo: found.hsn || '',
              minimum_Qty: found.msl || 0,
              reOrderQty: found.moq || 0,
              note: found.nt || '',
              location: found.loc || '',
              priceCategories: [],
            };
          }
        } catch {}
      }

      // Normalize field names if API returns different format
      if (itemData && !itemData.item_CodeTxt && itemData.item_CodeTxt !== '') {
        itemData.item_CodeTxt = itemData.item_CodeTxt || itemData.itemCode || itemData.ict || '';
        itemData.hsnNo = itemData.hsnNo || itemData.hsn || '';
        itemData.minimum_Qty = itemData.minimum_Qty ?? itemData.minimumQty ?? 0;
        itemData.reOrderQty = itemData.reOrderQty ?? itemData.reorderQty ?? 0;
      }

      if (itemData?.priceCategories?.length && priceCategoryList.length) {
        itemData.priceCategories.forEach((v: any) => {
          const rec = priceCategoryList.find((x: any) => x.priceCategoryID === v.priceCategoryID);
          if (rec) v.label = rec.priceCategoryName;
        });
      }
      setSingleRecordData(itemData);
    } catch (err) {
      console.error('openItemDetail error:', err);
    }
  };

  // ─── Add item register tab (edit button — mirrors Angular add) ─────────
  const addTab = (itemcode: string, itemid: number) => {
    const existing = tabs.find(t => t.text === itemcode);
    if (!existing) {
      const newId = counterRef.current++;
      setTabs([...tabs, { id: newId, text: itemcode, itemid }]);
      setSelectedTab(newId);
    } else {
      setSelectedTab(existing.id);
    }
  };

  const closeTab = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const newTabs = [...tabs];
    newTabs.splice(index, 1);
    setTabs(newTabs);
    setSelectedTab(1);
  };

  // ─── Column definitions (mirrors Angular resolveColDef) ────────────────
  const isNumericColumn = (key: string) => !['itemcode', 'itename', 'category', 'sizes', 'type', 'brand', 'itemGroup', 'itemid'].includes(key);

  const columnLabel = (key: string): string => {
    const map: Record<string, string> = {
      itemcode: 'Item Code', itename: 'Item Name', category: 'Category',
      sizes: 'Sub Category', type: 'Type', brand: 'Brand', itemGroup: 'Item Group',
    };
    return map[key] || key;
  };

  const formatNumber = (val: any) => {
    if (val == null || val === '') return '';
    const n = parseFloat(val);
    return isNaN(n) ? val : n.toFixed(2);
  };

  return (
    <div className="font-sans text-slate-700 dark:text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-slate-200 dark:bg-slate-700 p-2 rounded-lg">
            <LayoutGrid size={20} className="text-slate-600 dark:text-slate-300" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Current Stock</h1>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 mb-5">
        {/* Row 1: Autocomplete filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-4">
          <AutocompleteInput label="Item Code" value={filters.item_CodeTxt} options={codeList} onChange={v => setFilters({ ...filters, item_CodeTxt: v })} placeholder="Item Code" />
          <AutocompleteInput label="Item Name" value={filters.name} options={nameList} onChange={v => setFilters({ ...filters, name: v })} placeholder="Item Name" />
          <AutocompleteInput label="Brand" value={filters.brand} options={brandList} onChange={v => setFilters({ ...filters, brand: v })} placeholder="Brand" />
          <AutocompleteInput label="Category" value={filters.category} options={categoryList} onChange={v => setFilters({ ...filters, category: v })} placeholder="Category" />
          <AutocompleteInput label="Sub Category" value={filters.sizes} options={sizeList} onChange={v => setFilters({ ...filters, sizes: v })} placeholder="Sub Category" />
          <AutocompleteInput label="Type" value={filters.type} options={typeList} onChange={v => setFilters({ ...filters, type: v })} placeholder="Type" />
          <AutocompleteInput label="Brand Code" value={filters.itemGroup} options={groupList} onChange={v => setFilters({ ...filters, itemGroup: v })} placeholder="Brand Code" />
        </div>

        {/* Row 2: Single Item + Stock Place + Buttons */}
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1 min-w-[250px]">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Single Item</label>
            <input ref={singleItemRef} type="search" placeholder="Search item..."
              value={filters.item ? `${filters.item.ict || ''} ${filters.item.nm || ''}` : ''}
              onChange={() => setFilters({ ...filters, item: null })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
          </div>
          <div className="space-y-1 min-w-[180px]">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Stock Place</label>
            <select value={filters.stockPlace} onChange={e => setFilters({ ...filters, stockPlace: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none">
              <option value="">Select Stock Place</option>
              {stockPlaceList.map((sp: any) => <option key={sp.id} value={sp.id}>{sp.name}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={submitReport} className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-700/20" title="Apply">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              <span className="hidden sm:inline">Search</span>
            </button>
            <button onClick={clearFilters} className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 rounded-lg transition-all border border-slate-200 dark:border-slate-700" title="Clear">
              <RotateCcw size={16} />
            </button>
            <button onClick={handleExport} className="p-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all shadow-lg shadow-emerald-500/20" title="Export to Excel">
              {exportLoading ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
            </button>
            <button onClick={handlePrint} className="p-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-all shadow-lg shadow-rose-500/20" title="Print / PDF">
              {printLoading ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs (Current Stock + Item Register drill-downs) */}
      <div className="mb-4">
        <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
          <button onClick={() => setSelectedTab(1)}
            className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${selectedTab === 1 ? 'border-blue-600 text-blue-700 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
            CURRENT STOCK
          </button>
          {tabs.map((tab, idx) => (
            <button key={tab.id} onClick={() => setSelectedTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${selectedTab === tab.id ? 'border-blue-600 text-blue-700 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
              {tab.text} Details
              <span onClick={(e) => closeTab(e, idx)} className="ml-1 p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"><X size={12} /></span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {selectedTab === 1 ? (
        <>
          {/* Item detail banner */}
          <AnimatePresence>{singleRecordData && <ItemDetailBanner data={singleRecordData} onClose={() => setSingleRecordData(null)} />}</AnimatePresence>

          {/* Data Table */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto max-h-[calc(100vh-420px)]">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 w-20">Actions</th>
                    {columns.filter(c => c !== 'itemid').map(col => (
                      <th key={col} className={`px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap ${isNumericColumn(col) ? 'text-right' : ''}`}>
                        {columnLabel(col)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading ? (
                    <tr><td colSpan={columns.length + 1} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 size={24} className="animate-spin text-blue-600" />
                        <span className="text-xs text-slate-500 font-medium">Fetching stock data...</span>
                      </div>
                    </td></tr>
                  ) : !data.length ? (
                    <tr><td colSpan={columns.length + 1} className="px-6 py-12 text-center text-sm text-slate-400">
                      {columns.length === 0 ? 'Click Search to load stock data' : 'No stock values found for selected criteria'}
                    </td></tr>
                  ) : data.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => addTab(row.itemcode, row.itemid)} className="text-blue-500 hover:text-blue-700 transition-colors" title="Item Register">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => openItemDetail(row.itemid)} className="text-slate-400 hover:text-slate-600 transition-colors" title="View Details">
                            <Eye size={14} />
                          </button>
                        </div>
                      </td>
                      {columns.filter(c => c !== 'itemid').map(col => (
                        <td key={col} className={`px-4 py-3 text-sm whitespace-nowrap ${isNumericColumn(col) ? 'text-right font-medium text-slate-700 dark:text-slate-300' : col === 'itemcode' ? 'font-bold text-slate-800 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}`}>
                          {isNumericColumn(col) ? formatNumber(row[col]) : (row[col] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">Total Rows:</span>
                  <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded text-[10px] font-bold">{data.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">Filtered:</span>
                  <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-[10px] font-bold">{data.length}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        // Item Register Tab Content
        (() => {
          const activeTab = tabs.find(t => t.id === selectedTab);
          return activeTab ? (
            <ItemRegisterView itemId={activeTab.itemid} stockPlaceId={filters.stockPlace || null} />
          ) : null;
        })()
      )}
    </div>
  );
};

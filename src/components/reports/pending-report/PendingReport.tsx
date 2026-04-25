import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, RotateCcw, FileSpreadsheet, FileText, Loader2, CalendarRange, Eye } from 'lucide-react';
import { reportApi } from '../../../services/report.service';
import { commonApi } from '../../../lib/api-client';
import { CommonAutocompleteTemplate } from '../../../shared/CommonAutocompleteTemplate';
import { InvoiceDetailsModal } from '../InvoiceDetailsModal';

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

// Checkbox Component
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

export const PendingReport: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  // Dropdown lists
  const [itemList, setItemList] = useState<any[]>([]);
  const [stockPlaceList, setStockPlaceList] = useState<any[]>([]);
  const [ledgerList, setLedgerList] = useState<any[]>([]);
  const [salesPersonList, setSalesPersonList] = useState<any[]>([]);

  // Item filter lists (mocking behavior of Angular)
  const [brandList, setBrandList] = useState<any[]>([]);
  const [categoryList, setCategoryList] = useState<any[]>([]);
  const [sizeList, setSizeList] = useState<any[]>([]);
  const [typeList, setTypeList] = useState<any[]>([]);
  const [groupList, setGroupList] = useState<any[]>([]);
  const [itemNameList, setItemNameList] = useState<any[]>([]);
  const [itemCodeList, setItemCodeList] = useState<any[]>([]);

  const defaultFilters = {
    fromDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0],
    item_CodeTxt: null,
    name: null,
    brand: null,
    category: null,
    sizes: null,
    type: null,
    itemGroup: null,
    assignedUserID: '',
    itemId: null,
    itemWise: false,
    billDetailsReq: false,
    billWise: false,
    invType: 1,
    spIdWise: false,
    spId: '',
    ledgerWise: false,
    ledgerIds: null,
    dateWise: false,
    mfrReq: false,
    projectIds: 0,
    subsidiaryOption: 0
  };

  const [filters, setFilters] = useState<Record<string, any>>(defaultFilters);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInvCode, setModalInvCode] = useState<number | string>(0);
  const [modalInvType, setModalInvType] = useState<number>(1);
  const [modalIndex, setModalIndex] = useState(0);

  useEffect(() => {
    // Load local storage items
    try {
      const items = JSON.parse(localStorage.getItem('item-list') || '[]');
      setItemList(items.filter((ele: any) => ele.isact).map((ele: any) => ({
        ...ele, particular: [ele.nm, ele.ict, ele.typ, ele.brd, ele.siz, ele.ig].filter(Boolean).join(' '), name: ele.nm
      })));

      const ledgers = JSON.parse(localStorage.getItem('ledger-list') || '[]');
      setLedgerList(ledgers);
    } catch {}

    // Load Stock Places
    commonApi.dropdown({ table: 4 }).then(setStockPlaceList).catch(() => {});
    
    // Load Sales Person List
    commonApi.dropdown({ table: 5 }).then(setSalesPersonList).catch(() => {});

    // Load additional lists
    commonApi.itemCategoryList({ table: 0, column: 'Brand' }).then(setBrandList).catch(() => {});
    commonApi.itemCategoryList({ table: 0, column: 'Category' }).then(setCategoryList).catch(() => {});
    commonApi.itemCategoryList({ table: 0, column: 'Sizes' }).then(setSizeList).catch(() => {});
    commonApi.itemCategoryList({ table: 0, column: 'Type' }).then(setTypeList).catch(() => {});
    commonApi.itemCategoryList({ table: 0, column: 'ItemGroup' }).then(setGroupList).catch(() => {});
    commonApi.itemCategoryList({ table: 0, column: 'Name' }).then(setItemNameList).catch(() => {});
    commonApi.itemCategoryList({ table: 0, column: 'ItemCode' }).then(setItemCodeList).catch(() => {});
  }, []);

  const formatDateForApi = (dateStr: string, time: string) => {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y} ${time}`;
  };

  const getFiltersPayload = useCallback(() => {
    return {
      brand: filters.brand ? filters.brand.name : null,
      category: filters.category ? filters.category.name : null,
      sizes: filters.sizes ? filters.sizes.name : null,
      type: filters.type ? filters.type.name : null,
      itemGroup: filters.itemGroup ? filters.itemGroup.name : null,
      item_CodeTxt: filters.item_CodeTxt ? filters.item_CodeTxt.name : null,
      name: filters.name ? filters.name.name : null,
      itemWise: filters.itemWise,
      itemId: (filters.itemId && !filters.itemWise) ? filters.itemId.iid : null,
      spIdWise: filters.spIdWise,
      spId: (filters.spId && !filters.spIdWise) ? parseInt(filters.spId) : null,
      dateWise: filters.dateWise,
      dateFrom: filters.fromDate ? formatDateForApi(filters.fromDate, '00:00:00') : null,
      dateTo: filters.toDate ? formatDateForApi(filters.toDate, '23:59:59') : null,
      invType: filters.invType ? parseInt(filters.invType) : null,
      ledgerWise: filters.ledgerWise,
      ledgerIds: (filters.ledgerIds && !filters.ledgerWise) ? filters.ledgerIds.id : null,
      mfrReq: filters.mfrReq,
      billDetailsReq: filters.billDetailsReq,
      projectIds: filters.projectIds,
      subsidiaryOption: filters.subsidiaryOption,
    };
  }, [filters]);

  const validate = () => {
    setSubmitted(true);
    if (!filters.fromDate || !filters.toDate) return false;
    if (!filters.billWise && !filters.invType) return false;
    return true;
  };

  const submitReport = async () => {
    if (!validate()) return;
    setLoading(true);
    
    try {
      const payload = getFiltersPayload();
      const result = await reportApi.pendingItems(payload);
      
      if (result?.length) {
        setData(result);
        const keys = Object.keys(result[0]);
        setColumns(keys);
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

  const handleExport = async () => {
    if (!validate()) return;
    setExportLoading(true);
    try {
      const payload = getFiltersPayload();
      const blob = await reportApi.pendingItemsExport(payload);

      if (blob && blob.size > 0) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'pending-ItemsReport.xlsx';
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
  };

  const openInvoiceModal = (row: any, rowIndex: number) => {
    if (!row.InvoiceCode || !row.TypeId) return;
    setModalInvCode(row.InvoiceCode);
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
      return d.toLocaleDateString('en-GB');
    } catch {
      return val;
    }
  };

  // Determine visibility logic mimicking Angular columns
  const getVisibleColumns = () => {
    const hidden = ['TypeId', 'InvoiceCode', 'ProjectSiteName'];
    
    if (filters.spId == null && !filters.spIdWise) hidden.push('StockPlace');
    if (filters.ledgerIds == null && !filters.ledgerWise) hidden.push('Party');
    if (!filters.billDetailsReq) {
      hidden.push('BillNo', 'OrderNo');
    }
    if (!filters.dateWise) {
      hidden.push('Date');
    }

    return columns.filter(c => !hidden.includes(c));
  };

  const visibleColumns = getVisibleColumns();
  const columnLabels: Record<string, string> = {
    BillNo: 'Doc No', Date: 'Date', BillType: 'Bill Type',
    Party: 'Party', StockPlace: 'Stock Place', Amount: 'Amount',
    OrderNo: 'Order No', Category: 'Category', Sizes: 'Sizes',
    Type: 'Type', Brand: 'Brand', Group: 'Group',
    ItemCode: 'Item Code', Name: 'Name', Particular: 'Particular'
  };

  const invoiceListForModal = data.filter(r => r.InvoiceCode && r.TypeId).map(r => ({ ...r, Invcode: r.InvoiceCode }));

  return (
    <div className="font-sans text-slate-700 dark:text-slate-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-slate-200 dark:bg-slate-700 p-2 rounded-lg">
            <FileText size={20} className="text-slate-600 dark:text-slate-300" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Pending Report</h1>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
          <AutocompleteInput label="Item Code" value={filters.item_CodeTxt} options={itemCodeList} onChange={v => setFilters({ ...filters, item_CodeTxt: v })} placeholder="Item Code" />
          <AutocompleteInput label="Item Name" value={filters.name} options={itemNameList} onChange={v => setFilters({ ...filters, name: v })} placeholder="Item Name" />
          <AutocompleteInput label="Brand" value={filters.brand} options={brandList} onChange={v => setFilters({ ...filters, brand: v })} placeholder="Brand" />
          <AutocompleteInput label="Category" value={filters.category} options={categoryList} onChange={v => setFilters({ ...filters, category: v })} placeholder="Category" />
          <AutocompleteInput label="Sub Category" value={filters.sizes} options={sizeList} onChange={v => setFilters({ ...filters, sizes: v })} placeholder="Sub Category" />
          <AutocompleteInput label="Type" value={filters.type} options={typeList} onChange={v => setFilters({ ...filters, type: v })} placeholder="Type" />
          <AutocompleteInput label="Brand Code" value={filters.itemGroup} options={groupList} onChange={v => setFilters({ ...filters, itemGroup: v })} placeholder="Brand Code" />
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Sales Person</label>
            <select value={filters.assignedUserID} onChange={e => setFilters({ ...filters, assignedUserID: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20">
              <option value="">Select Sales Person</option>
              {salesPersonList.map(sp => <option key={sp.id} value={sp.id}>{sp.name}</option>)}
            </select>
          </div>

          <AutocompleteInput label="Single Item" value={filters.itemId} options={itemList} onChange={v => setFilters({ ...filters, itemId: v })} placeholder="Single Item" displayField="particular" templateType="item" />
          
          <CheckboxInput id="itemWise" label="Item Wise" checked={filters.itemWise} onChange={v => setFilters({ ...filters, itemWise: v })} />
          <CheckboxInput id="billDetailsReq" label="Bill Details" checked={filters.billDetailsReq} onChange={v => setFilters({ ...filters, billDetailsReq: v })} />
          <CheckboxInput id="billWise" label="Bill Type Wise" checked={filters.billWise} onChange={v => setFilters({ ...filters, billWise: v, invType: v ? '' : filters.invType })} />
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Type</label>
            <select value={filters.invType} onChange={e => setFilters({ ...filters, invType: e.target.value })} disabled={filters.billWise}
              className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${submitted && !filters.billWise && !filters.invType ? 'border-red-500 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'}`}>
              <option value="">Select Type</option>
              {/* Common Invoice Types - adjust according to environment */}
              <option value="1">Sales Invoice</option>
              <option value="2">Purchase Invoice</option>
              <option value="3">Sales Order</option>
              <option value="4">Purchase Order</option>
              <option value="5">Sales Quotation</option>
              <option value="6">Delivery Challan</option>
              <option value="7">Purchase Challan</option>
            </select>
          </div>

          <CheckboxInput id="spIdWise" label="Stock Place Wise" checked={filters.spIdWise} onChange={v => setFilters({ ...filters, spIdWise: v })} />
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Stock Place</label>
            <select value={filters.spId} onChange={e => setFilters({ ...filters, spId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20">
              <option value="">Select Stock Place</option>
              {stockPlaceList.map(sp => <option key={sp.id} value={sp.id}>{sp.name}</option>)}
            </select>
          </div>

          <CheckboxInput id="ledgerWise" label="Ledger Wise" checked={filters.ledgerWise} onChange={v => setFilters({ ...filters, ledgerWise: v })} />
          <AutocompleteInput label="Select Party" value={filters.ledgerIds} options={ledgerList} onChange={v => setFilters({ ...filters, ledgerIds: v })} placeholder="Select Party" templateType="ledger" />
          <CheckboxInput id="dateWise" label="Date Wise" checked={filters.dateWise} onChange={v => setFilters({ ...filters, dateWise: v })} />

          <div className="space-y-1 lg:col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">From Date <span className="text-red-500">*</span></label>
            <input type="date" value={filters.fromDate} onChange={e => setFilters({ ...filters, fromDate: e.target.value })}
              className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${submitted && !filters.fromDate ? 'border-red-500 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'}`} />
          </div>
          <div className="space-y-1 lg:col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">To Date <span className="text-red-500">*</span></label>
            <input type="date" value={filters.toDate} onChange={e => setFilters({ ...filters, toDate: e.target.value })}
              className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${submitted && !filters.toDate ? 'border-red-500 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'}`} />
          </div>
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
        <div className="overflow-x-auto max-h-[calc(100vh-420px)]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 w-10"></th>
                {visibleColumns.map(col => (
                  <th key={col} className={`px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap ${['Amount', 'Quantity', 'Balance'].includes(col) ? 'text-right' : ''}`}>
                    {columnLabels[col] || col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan={visibleColumns.length + 1} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 size={24} className="animate-spin text-blue-600" />
                    <span className="text-xs text-slate-500 font-medium">Fetching pending items...</span>
                  </div>
                </td></tr>
              ) : !data.length ? (
                <tr><td colSpan={visibleColumns.length + 1} className="px-6 py-12 text-center text-sm text-slate-400">
                  {submitted ? 'No pending values found for selected criteria' : 'Click Search to view pending items'}
                </td></tr>
              ) : data.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3">
                    {row.TypeId && row.InvoiceCode && (
                      <button onClick={() => openInvoiceModal(row, idx)} className="text-blue-500 hover:text-blue-700 transition-colors p-1" title="View Details">
                        <Eye size={14} />
                      </button>
                    )}
                  </td>
                  {visibleColumns.map(col => (
                    <td key={col} className={`px-4 py-3 text-sm ${['Amount', 'Quantity', 'Balance'].includes(col) ? 'text-right font-medium text-slate-700 dark:text-slate-300' : 'text-slate-600 dark:text-slate-400'} whitespace-nowrap`}>
                      {col === 'Date' ? formatDateStr(row[col]) : ['Amount', 'Quantity', 'Balance'].includes(col) ? formatNumber(row[col]) : (row[col] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Total Rows:</span>
              <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded text-[10px] font-bold">
                {data.length}
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

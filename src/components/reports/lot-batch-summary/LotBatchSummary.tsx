import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  RotateCcw,
  FileSpreadsheet,
  FileText,
  Loader2,
  AlertCircle,
  Printer,
  XCircle,
} from "lucide-react";
import { reportApi } from "../../../services/report.service";
import { commonApi } from "../../../lib/api-client";
import { CommonAutocompleteTemplate } from "../../../shared/CommonAutocompleteTemplate";

// ─── Autocomplete Input Component ──────────────────────────────────────────
const AutocompleteInput: React.FC<{
  label: string;
  value: any;
  options: any[];
  onChange: (val: any) => void;
  placeholder: string;
  displayField?: string;
  templateType?: string;
}> = ({
  label,
  value,
  options,
  onChange,
  placeholder,
  displayField = "name",
  templateType = "name",
}) => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = search.length >= 2
    ? options.filter((o) => {
        const val = o[displayField] || o.name || "";
        return val.toLowerCase().includes(search.toLowerCase());
      }).slice(0, 10)
    : [];

  return (
    <div className="space-y-1 relative" ref={ref}>
      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </label>
      <input
        type="search"
        placeholder={placeholder}
        value={value ? value[displayField] || value.name || "" : search}
        onChange={(e) => {
          setSearch(e.target.value);
          onChange(null);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-50 top-full mt-1 w-[800px] max-w-[90vw] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-64 overflow-y-auto">
          {filtered.map((opt, i) => (
            <button
              key={i}
              onClick={() => {
                onChange(opt);
                setSearch("");
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors border-b border-slate-100 dark:border-slate-700 last:border-0"
            >
              <CommonAutocompleteTemplate
                result={opt}
                templateType={templateType}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const LotBatchSummary: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Dropdowns
  const [brandList, setBrandList] = useState<any[]>([]);
  const [categoryList, setCategoryList] = useState<any[]>([]);
  const [sizeList, setSizeList] = useState<any[]>([]);
  const [typeList, setTypeList] = useState<any[]>([]);
  const [groupList, setGroupList] = useState<any[]>([]);
  const [nameList, setNameList] = useState<any[]>([]);
  const [codeList, setCodeList] = useState<any[]>([]);
  const [itemList, setItemList] = useState<any[]>([]);
  const [stockPlaceList, setStockPlaceList] = useState<any[]>([]);

  const defaultFilters = {
    brand: "",
    category: "",
    sizes: "",
    type: "",
    itemGroup: "",
    item_CodeTxt: "",
    name: "",
    item: null,
    spId: "",
    fromDate: "",
    toDate: "",
  };

  const [filters, setFilters] = useState<Record<string, any>>(defaultFilters);

  useEffect(() => {
    // Basic dropdowns
    commonApi.dropdown({ table: 4 }).then(setStockPlaceList).catch(() => {});
    commonApi.itemCategoryList({ table: 0, column: "Brand" }).then(setBrandList).catch(() => {});
    commonApi.itemCategoryList({ table: 0, column: "Category" }).then(setCategoryList).catch(() => {});
    commonApi.itemCategoryList({ table: 0, column: "Sizes" }).then(setSizeList).catch(() => {});
    commonApi.itemCategoryList({ table: 0, column: "Type" }).then(setTypeList).catch(() => {});
    commonApi.itemCategoryList({ table: 0, column: "ItemGroup" }).then(setGroupList).catch(() => {});
    commonApi.itemCategoryList({ table: 0, column: "Name" }).then(setNameList).catch(() => {});
    commonApi.itemCategoryList({ table: 0, column: "Item_CodeTxt" }).then(setCodeList).catch(() => {});

    // Single item
    try {
      const items = JSON.parse(localStorage.getItem("item-list") || "[]");
      const formattedItems = items
        .filter((ele: any) => ele.isact && ele.uf !== 25)
        .map((ele: any) => ({
          ...ele,
          particular: [ele.nm, ele.ict, ele.typ, ele.brd, ele.siz, ele.ig]
            .filter(Boolean)
            .join(" "),
          name: ele.nm,
        }));
      setItemList(formattedItems);
    } catch {}
  }, []);

  const formatDateForApi = (dateStr: string, time: string) => {
    if (!dateStr) return null;
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y} ${time}`;
  };

  const getPayload = () => {
    return {
      brand: filters.brand || null,
      category: filters.category || null,
      sizes: filters.sizes || null,
      type: filters.type || null,
      itemGroup: filters.itemGroup || null,
      item_CodeTxt: filters.item_CodeTxt || null,
      name: filters.name || null,
      itemId: filters.item ? filters.item.iid : null,
      usedFor: null,
      spId: filters.spId ? parseInt(filters.spId) : null,
      fromDate: filters.fromDate ? formatDateForApi(filters.fromDate, "00:00:00") : null,
      toDate: filters.toDate ? formatDateForApi(filters.toDate, "23:59:59") : null,
    };
  };

  const submitReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await reportApi.batchStockSummary(getPayload());
      setData(result || []);
      if (!result || result.length === 0) {
        setError("No data found for the selected criteria.");
      }
    } catch (err: any) {
      setData([]);
      setError(err?.message || "Failed to load report data.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const exportData = await reportApi.currentStockExport(getPayload());
      if (exportData?.size) {
        const a = document.createElement("a");
        const objectUrl = URL.createObjectURL(exportData);
        a.href = objectUrl;
        a.setAttribute("download", "current-stockReport.xlsx");
        a.click();
        URL.revokeObjectURL(objectUrl);
      } else {
        setError("No data found to export.");
      }
    } catch (e) {
      console.error("Export error:", e);
    } finally {
      setExportLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    setData([]);
    setError(null);
  };

  const formatNumber = (val: any) => {
    if (val == null || val === "") return "";
    const n = parseFloat(val);
    return isNaN(n)
      ? val
      : n.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
  };

  const formatDate = (val: string) => {
    if (!val) return "";
    const date = new Date(val);
    if (isNaN(date.getTime())) return val;
    const d = date.getDate().toString().padStart(2, "0");
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  const totalQty = data.reduce((s, i) => s + (parseFloat(i.Qty) || 0), 0);

  // Derived state for Dashboard
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const thirtyDaysFromNow = new Date(today);
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  let expiredCount = 0;
  let expiringCount = 0;
  let healthyCount = 0;
  let expiringSoonList: any[] = [];

  data.forEach((row) => {
    if (!row.ExpDate) {
      healthyCount++;
      return;
    }
    const expDate = new Date(row.ExpDate);
    if (isNaN(expDate.getTime())) {
      healthyCount++;
      return;
    }

    if (expDate < today) {
      expiredCount++;
    } else if (expDate <= thirtyDaysFromNow) {
      expiringCount++;
      expiringSoonList.push({ ...row, expDateObj: expDate });
    } else {
      healthyCount++;
    }
  });

  const totalBatches = data.length;
  const healthyPct = totalBatches ? Math.round((healthyCount / totalBatches) * 100) : 0;
  const expiringPct = totalBatches ? Math.round((expiringCount / totalBatches) * 100) : 0;
  const expiredPct = totalBatches ? Math.round((expiredCount / totalBatches) * 100) : 0;

  expiringSoonList.sort((a, b) => a.expDateObj.getTime() - b.expDateObj.getTime());

  const circumference = 527.78;
  const strokeHealthy = (healthyCount / (totalBatches || 1)) * circumference;
  const strokeExpiring = (expiringCount / (totalBatches || 1)) * circumference;
  const strokeExpired = (expiredCount / (totalBatches || 1)) * circumference;

  const getDaysLeft = (expDate: Date) => {
    const diffTime = expDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const SelectInput: React.FC<{ label: string; field: string; options: any[] }> = ({ label, field, options }) => (
    <div className="space-y-1">
      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </label>
      <select
        value={filters[field]}
        onChange={(e) => setFilters({ ...filters, [field]: e.target.value })}
        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
      >
        <option value="">{label}</option>
        {options.map((opt, i) => (
          <option key={i} value={opt.name || opt.id}>
            {opt.name}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="font-sans text-slate-700 dark:text-slate-200 pt-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400">
            <FileText size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Lot / Batch Stock Summary</h1>
            <p className="text-xs text-slate-500 font-medium">Detailed inventory monitoring by batch and stock location.</p>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-4">
          <SelectInput label="Item Code" field="item_CodeTxt" options={codeList} />
          <SelectInput label="Item Name" field="name" options={nameList} />
          <SelectInput label="Category" field="category" options={categoryList} />
          <SelectInput label="Sizes" field="sizes" options={sizeList} />
          <SelectInput label="Type" field="type" options={typeList} />
          <SelectInput label="Brand" field="brand" options={brandList} />
          <SelectInput label="Group" field="itemGroup" options={groupList} />
          
          <div className="col-span-1 sm:col-span-2 md:col-span-1 xl:col-span-2">
            <AutocompleteInput
              label="Single Item"
              placeholder="Search Single Item"
              value={filters.item}
              options={itemList}
              onChange={(v) => setFilters({ ...filters, item: v })}
              templateType="item"
            />
          </div>
          <SelectInput label="Select Stock Place" field="spId" options={stockPlaceList} />
        </div>

        <div className="flex flex-wrap xl:flex-nowrap items-end gap-4 border-t border-slate-100 dark:border-slate-800 pt-4">
          <div className="w-full sm:w-36 shrink-0 space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              From Exp Date
            </label>
            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <div className="w-full sm:w-36 shrink-0 space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              To Exp Date
            </label>
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="flex items-center space-x-2 shrink-0 pb-0.5">
            <button
              onClick={submitReport}
              disabled={loading}
              className="w-10 h-10 flex items-center justify-center bg-[#2D9E75] text-white rounded-lg hover:opacity-90 transition-all shadow-sm cursor-pointer disabled:opacity-70"
              title="Search"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            </button>
            <button
              onClick={clearFilters}
              className="w-10 h-10 flex items-center justify-center bg-lime-500 text-white rounded-lg hover:opacity-90 transition-all shadow-sm cursor-pointer"
              title="Reset Filters"
            >
              <RotateCcw size={16} />
            </button>
            <button
              disabled={loading || !data.length}
              className="w-10 h-10 flex items-center justify-center bg-rose-500 text-white rounded-lg hover:opacity-90 transition-all shadow-sm cursor-pointer disabled:opacity-70"
              title="PDF Export"
            >
              <Printer size={16} />
            </button>
            <button
              onClick={handleExport}
              disabled={exportLoading || loading || !data.length}
              className="w-10 h-10 flex items-center justify-center bg-emerald-600 text-white rounded-lg hover:opacity-90 transition-all shadow-sm cursor-pointer disabled:opacity-70"
              title="Excel Export"
            >
              {exportLoading ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
      {/* Table Area */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col min-w-0">
        <div className="overflow-auto custom-scrollbar max-h-[calc(100vh-320px)]">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Item Code</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Item Name</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sizes</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Brand</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Item Group</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Stock</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Rate</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Lot / Batch No</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mfg date</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Exp Date</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Doc. No.</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={14} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 size={24} className="animate-spin text-blue-600" />
                      <span className="text-xs text-slate-500 font-medium">Fetching summary...</span>
                    </div>
                  </td>
                </tr>
              ) : error && !data.length ? (
                <tr>
                  <td colSpan={14} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle size={24} className="text-rose-500" />
                      <span className="text-xs text-rose-500 font-medium">{error}</span>
                    </div>
                  </td>
                </tr>
              ) : !data.length ? (
                <tr>
                  <td colSpan={14} className="px-6 py-12 text-center text-sm text-slate-400">
                    Use the filters above to generate the report.
                  </td>
                </tr>
              ) : (
                data.map((row, index) => {
                  const isExpired = row.ExpDate && new Date(row.ExpDate) < new Date();
                  return (
                    <tr key={index} className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group ${isExpired ? 'bg-rose-50/30 dark:bg-rose-900/10' : ''}`}>
                      <td className="px-4 py-2 text-xs font-bold text-blue-600 hover:underline cursor-pointer">{row.ItemCode}</td>
                      <td className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200">{row.ItemName}</td>
                      <td className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400">{row.ItemCategory}</td>
                      <td className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400">{row.ItemSizes}</td>
                      <td className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400">{row.ItemType}</td>
                      <td className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400">{row.ItemBrand}</td>
                      <td className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400">{row.ItemGroup}</td>
                      <td className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 text-right">{formatNumber(row.Qty)}</td>
                      <td className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 text-right">{formatNumber(row.Rate)}</td>
                      <td className="px-4 py-2 text-xs text-slate-600 dark:text-slate-300 font-bold">{row.MfgCode || "-"}</td>
                      <td className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400">{formatDate(row.MfgDate)}</td>
                      <td className="px-4 py-2 text-xs">
                        <div className={`flex items-center gap-1 font-bold ${isExpired ? 'text-rose-600' : 'text-slate-500 dark:text-slate-400'}`}>
                          {isExpired && <XCircle size={14} />}
                          {formatDate(row.ExpDate)}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-xs font-bold text-blue-600 hover:underline cursor-pointer">{row.BillNo}</td>
                      <td className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400">{formatDate(row.InvDate)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Rows:</span>
          <span className="px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs font-black">{data.length}</span>
        </div>
      </div>

      {/* Right Sidebar Analytics */}
      <aside className="w-80 shrink-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-y-auto p-6 hidden xl:block">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Batch Health</h3>
          <span className="text-slate-400 cursor-help" title="Analytics based on Expiry Date">
            <AlertCircle size={16} />
          </span>
        </div>
        
        {/* Donut Chart */}
        <div className="relative flex items-center justify-center mb-8">
          <div className="w-48 h-48 rounded-full border-[12px] border-slate-100 dark:border-slate-800 relative">
            <svg className="absolute inset-0 w-full h-full rotate-[-90deg]" viewBox="0 0 192 192">
              <circle cx="96" cy="96" fill="transparent" r="84" stroke="#fbbf24" strokeDasharray={`${strokeExpiring} ${circumference}`} strokeLinecap="round" strokeWidth="12" />
              <circle cx="96" cy="96" fill="transparent" r="84" stroke="#ef4444" strokeDasharray={`${strokeExpired} ${circumference}`} strokeDashoffset={-strokeExpiring} strokeLinecap="round" strokeWidth="12" />
              <circle cx="96" cy="96" fill="transparent" r="84" stroke="#10b981" strokeDasharray={`${strokeHealthy} ${circumference}`} strokeDashoffset={-(strokeExpiring + strokeExpired)} strokeLinecap="round" strokeWidth="12" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center -m-3">
              <span className="text-2xl font-black">{totalBatches}</span>
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Batches</span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-3 mb-8">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-medium text-slate-700 dark:text-slate-300">Healthy</span>
            </div>
            <span className="font-bold">{healthyPct}%</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span className="font-medium text-slate-700 dark:text-slate-300">Expiring &lt; 30d</span>
            </div>
            <span className="font-bold">{expiringPct}%</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span className="font-medium text-slate-700 dark:text-slate-300">Expired</span>
            </div>
            <span className="font-bold">{expiredPct}%</span>
          </div>
        </div>
        
        <hr className="border-slate-100 dark:border-slate-800 mb-6" />

        {/* Expiring Soon List */}
        <h4 className="text-xs font-black uppercase text-slate-400 mb-4 tracking-widest">Expiring Soon</h4>
        <div className="space-y-4">
          {expiringSoonList.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">No batches expiring within 30 days.</p>
          ) : (
            expiringSoonList.slice(0, 5).map((item, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border-l-4 border-amber-400 group hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate pr-2" title={item.ItemName}>{item.ItemName}</p>
                  <span className="text-[10px] bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded shadow-sm text-amber-600 font-bold whitespace-nowrap">
                    {getDaysLeft(item.expDateObj)} Days
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-medium">
                  <span className="truncate">Batch: {item.MfgCode || '-'}</span>
                  <span className="whitespace-nowrap ml-2">Qty: {formatNumber(item.Qty)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>
      </div>

      {/* Summary Footer */}
      <footer className="sticky bottom-0 z-50 bg-brand-yellow dark:bg-brand-yellow/10 px-6 py-2 shadow-[0_-4px_20px_rgba(0,0,0,0.15)] border-t border-brand-yellow/20 dark:border-brand-yellow/5 flex flex-wrap justify-center gap-8 md:gap-16 items-center -mx-6 mt-4">
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-bold text-slate-800/80 dark:text-brand-yellow/70 uppercase tracking-tighter">Total Stock (Qty)</span>
          <span className="text-lg font-black text-slate-950 dark:text-brand-yellow tabular-nums leading-none">
            {data.length > 0 ? formatNumber(totalQty) : '0.00'}
          </span>
        </div>
      </footer>
    </div>
  );
};

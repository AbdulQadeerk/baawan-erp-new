import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  RotateCcw,
  FileSpreadsheet,
  FileText,
  LayoutGrid,
  Loader2,
  Edit2,
  Eye,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Calendar,
  Printer,
  Download,
} from "lucide-react";
import { reportApi } from "../../../services/report.service";
import { commonApi } from "../../../lib/api-client";
import { INVOICE_VOUCHER_TYPES_BY_ID } from "../../../lib/constants";
import * as XLSX from "xlsx";
import { CommonAutocompleteTemplate } from "../../../shared/CommonAutocompleteTemplate";

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
  <div className="flex items-center gap-2 h-full min-h-[38px] group">
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="w-4 h-4 text-[#2D9E75] bg-slate-50 border-slate-300 rounded-full focus:ring-[#2D9E75] dark:focus:ring-[#2D9E75] dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600 cursor-pointer"
    />
    <label
      htmlFor={id}
      className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none group-hover:text-[#2D9E75] transition-colors"
    >
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
}> = ({
  label,
  value,
  options,
  onChange,
  placeholder,
  displayField = "name",
  templateType = "name",
  disabled = false,
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

  const filtered =
    search.length >= 2
      ? options
          .filter((o) =>
            o[displayField]?.toLowerCase().includes(search.toLowerCase()),
          )
          .slice(0, 10)
      : [];

  return (
    <div className="space-y-1 relative" ref={ref}>
      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </label>
      <input
        type="search"
        disabled={disabled}
        placeholder={placeholder}
        value={value ? value[displayField] || "" : search}
        onChange={(e) => {
          setSearch(e.target.value);
          onChange(null);
          setOpen(true);
        }}
        onFocus={() => !disabled && setOpen(true)}
        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50"
      />
      {open && filtered.length > 0 && !disabled && (
        <div className="absolute z-50 top-full mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
          {filtered.map((opt, i) => (
            <button
              key={i}
              onClick={() => {
                onChange(opt);
                setSearch("");
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300"
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

export const InventoryReport: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [isInventoryMode, setIsInventoryMode] = useState(false);

  // Filter lists from API
  const [brandList, setBrandList] = useState<AutocompleteOption[]>([]);
  const [categoryList, setCategoryList] = useState<AutocompleteOption[]>([]);
  const [sizeList, setSizeList] = useState<AutocompleteOption[]>([]);
  const [typeList, setTypeList] = useState<AutocompleteOption[]>([]);
  const [groupList, setGroupList] = useState<AutocompleteOption[]>([]);
  const [nameList, setNameList] = useState<AutocompleteOption[]>([]);
  const [codeList, setCodeList] = useState<AutocompleteOption[]>([]);
  const [stockPlaceList, setStockPlaceList] = useState<any[]>([]);
  const [itemList, setItemList] = useState<any[]>([]);
  const [ledgerList, setLedgerList] = useState<any[]>([]);

  const defaultFilters = {
    brand: null,
    category: null,
    sizes: null,
    type: null,
    itemGroup: null,
    item_CodeTxt: null,
    name: null,
    item: null,
    inventory: false,
    itemWise: false,
    billDetailsReq: false,
    billWise: false,
    invType: 1,
    spIdWise: false,
    stockPlace: "",
    ledgerWise: false,
    ledgerIds: null,
    dateWise: false,
    dateFrom: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .substring(0, 10),
    dateTo: new Date().toISOString().substring(0, 10),
    mfrReq: false,
  };

  const [filters, setFilters] = useState<Record<string, any>>(defaultFilters);

  useEffect(() => {
    const loadDistinct = (column: string, setter: (v: any[]) => void) => {
      commonApi
        .itemCategoryList({ table: 0, column })
        .then(setter)
        .catch(() => {});
    };
    loadDistinct("Brand", setBrandList);
    loadDistinct("Category", setCategoryList);
    loadDistinct("Sizes", setSizeList);
    loadDistinct("Type", setTypeList);
    loadDistinct("ItemGroup", setGroupList);
    loadDistinct("Name", setNameList);
    loadDistinct("Item_CodeTxt", setCodeList);

    // Stock places
    commonApi
      .dropdown({ table: 4 })
      .then(setStockPlaceList)
      .catch(() => {});

    try {
      const items = JSON.parse(localStorage.getItem("item-list") || "[]");
      const formattedItems = items
        .filter((ele: any) => ele.isact)
        .map((ele: any) => ({
          ...ele,
          particular: [ele.nm, ele.ict, ele.typ, ele.brd, ele.siz, ele.ig]
            .filter(Boolean)
            .join(" "),
          name: ele.nm,
        }));
      setItemList(formattedItems);
    } catch {}

    try {
      const ledgers = JSON.parse(localStorage.getItem("ledger-list") || "[]");
      const formattedLedgers = ledgers.map((l: any) => ({
        ...l,
        name: l.text || l.name,
      }));
      setLedgerList(formattedLedgers);
    } catch {}
  }, []);

  const getFilters = useCallback(() => {
    if (filters.inventory) {
      return {
        brand: filters.brand?.name || null,
        category: filters.category?.name || null,
        sizes: filters.sizes?.name || null,
        type: filters.type?.name || null,
        itemGroup: filters.itemGroup?.name || null,
        item_CodeTxt: filters.item_CodeTxt?.name || null,
        name: filters.name?.name || null,
        itemId: filters.item?.iid || null,
        spId: filters.stockPlace || null,
      };
    }

    return {
      brand: filters.brand?.name || null,
      category: filters.category?.name || null,
      sizes: filters.sizes?.name || null,
      type: filters.type?.name || null,
      itemGroup: filters.itemGroup?.name || null,
      item_CodeTxt: filters.item_CodeTxt?.name || null,
      name: filters.name?.name || null,
      itemWise: filters.itemWise,
      itemId: filters.item && !filters.itemWise ? filters.item.iid : null,
      spIdWise: filters.spIdWise,
      spId: filters.stockPlace && !filters.spIdWise ? filters.stockPlace : null,
      dateWise: filters.dateWise,
      dateFrom: filters.dateFrom
        ? `${filters.dateFrom.split("-").reverse().join("/")} 00:00:00`
        : null,
      dateTo: filters.dateTo
        ? `${filters.dateTo.split("-").reverse().join("/")} 23:59:59`
        : null,
      invType: filters.invType && !filters.billWise ? filters.invType : null,
      ledgerWise: filters.ledgerWise,
      ledgerIds:
        filters.ledgerIds && !filters.ledgerWise ? filters.ledgerIds.id : null,
      mfrReq: filters.mfrReq,
      billDetailsReq: filters.billDetailsReq,
      projectIds: 0,
      subsidiaryOption: 0,
    };
  }, [filters]);

  const submitReport = async () => {
    setLoading(true);
    setIsInventoryMode(filters.inventory);
    try {
      const payload = getFilters();
      const result = filters.inventory
        ? await reportApi.currentStock(payload)
        : await reportApi.inventoryReport(payload);

      if (result?.length) {
        const keys = Object.keys(result[0]).filter(
          (k) => k !== "itemGroup" && k !== "itemid",
        );
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

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const payload = getFilters();
      const blob = filters.inventory
        ? await reportApi.currentStockExport(payload)
        : await reportApi.inventoryReportExport(payload);

      if (blob && blob.size > 0) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "inventoryReport.xlsx";
        a.click();
        URL.revokeObjectURL(url);
      } else if (data.length) {
        // Fallback export using client-side data
        const wsData = [
          columns,
          ...data.map((row) => columns.map((c) => row[c] ?? "")),
        ];
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, "Inventory Report");
        XLSX.writeFile(wb, "inventory-report.xlsx");
      }
    } catch (e) {
      console.error("Export error:", e);
    } finally {
      setExportLoading(false);
    }
  };

  const clearFilters = () => setFilters(defaultFilters);

  const columnLabel = (key: string): string => {
    const map: Record<string, string> = {
      itemcode: "Item Code",
      ItemCode: "Item Code",
      itename: "Item Name",
      Name: "Name",
      category: "Category",
      Category: "Category",
      sizes: "Sub Category",
      Sizes: "Sub Category",
      type: "Type",
      Type: "Type",
      brand: "Brand",
      Brand: "Brand",
      Group: "Group",
      group: "Group",
      StockPlace: "Stock Place",
      Amount: "Amount",
      Party: "Party",
      Date: "Date",
      BillType: "Bill Type",
      BillNo: "Doc No",
      Particular: "Particular",
    };
    return map[key] || key;
  };

  const isNumericColumn = (key: string) =>
    ![
      "itemcode",
      "ItemCode",
      "itename",
      "Name",
      "category",
      "Category",
      "sizes",
      "Sizes",
      "type",
      "Type",
      "brand",
      "Brand",
      "itemGroup",
      "Group",
      "group",
      "StockPlace",
      "Party",
      "Date",
      "BillType",
      "BillNo",
      "Particular",
      "itemid",
    ].includes(key);

  const formatNumber = (val: any) => {
    if (val == null || val === "") return "";
    const n = parseFloat(val);
    return isNaN(n) ? val : n.toFixed(2);
  };

  const formatDateStr = (val: any) => {
    if (!val) return "";
    try {
      return new Date(val).toLocaleDateString("en-GB");
    } catch {
      return val;
    }
  };

  const invTypesList = Object.entries(INVOICE_VOUCHER_TYPES_BY_ID)
    .map(([id, text]) => ({ id: Number(id), text }))
    .sort((a, b) => a.text.localeCompare(b.text));

  return (
    <div className="font-sans text-slate-700 dark:text-slate-200 pb-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-slate-200 dark:bg-slate-700 p-2 rounded-lg">
            <LayoutGrid
              size={20}
              className="text-slate-600 dark:text-slate-300"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              Inventory Report
            </h1>
            <nav
              aria-label="Breadcrumb"
              className="flex text-xs text-slate-500 dark:text-slate-400 mt-1"
            >
              <ol className="inline-flex items-center space-x-1">
                <li>Reports</li>
                <li>
                  <span className="mx-1">{">"}</span>
                </li>
                <li className="font-medium text-[#2D9E75]">
                  Inventory Stock Report
                </li>
              </ol>
            </nav>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="bg-blue-500 hover:opacity-90 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-all shadow-sm cursor-pointer">
            <Printer size={18} />
            <span>Print Report</span>
          </button>
          <button className="bg-[#2D9E75] hover:opacity-90 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-all shadow-sm cursor-pointer">
            <Download size={18} />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 mb-5">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-4">
          <AutocompleteInput
            label="Item Code"
            value={filters.item_CodeTxt}
            options={codeList}
            onChange={(v) => setFilters({ ...filters, item_CodeTxt: v })}
            placeholder="Item Code"
          />
          <AutocompleteInput
            label="Item Name"
            value={filters.name}
            options={nameList}
            onChange={(v) => setFilters({ ...filters, name: v })}
            placeholder="Item Name"
          />
          <AutocompleteInput
            label="Brand"
            value={filters.brand}
            options={brandList}
            onChange={(v) => setFilters({ ...filters, brand: v })}
            placeholder="Brand"
          />
          <AutocompleteInput
            label="Category"
            value={filters.category}
            options={categoryList}
            onChange={(v) => setFilters({ ...filters, category: v })}
            placeholder="Category"
          />
          <AutocompleteInput
            label="Sub Category"
            value={filters.sizes}
            options={sizeList}
            onChange={(v) => setFilters({ ...filters, sizes: v })}
            placeholder="Sub Category"
          />
          <AutocompleteInput
            label="Type"
            value={filters.type}
            options={typeList}
            onChange={(v) => setFilters({ ...filters, type: v })}
            placeholder="Type"
          />
          <AutocompleteInput
            label="Brand Code"
            value={filters.itemGroup}
            options={groupList}
            onChange={(v) => setFilters({ ...filters, itemGroup: v })}
            placeholder="Brand Code"
          />
          <AutocompleteInput
            label="Single Item"
            disabled={filters.itemWise}
            value={filters.item}
            options={itemList}
            onChange={(v) => setFilters({ ...filters, item: v })}
            placeholder="Single Item"
            displayField="particular"
            templateType="item"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <CheckboxInput
              id="inventory"
              label="Inventory"
              checked={filters.inventory}
              onChange={(v) => setFilters({ ...filters, inventory: v })}
            />
            {!filters.inventory && (
              <>
                <CheckboxInput
                  id="itemWise"
                  label="Item Wise"
                  checked={filters.itemWise}
                  onChange={(v) => setFilters({ ...filters, itemWise: v })}
                />
                <CheckboxInput
                  id="billDetailsReq"
                  label="Bill Details"
                  checked={filters.billDetailsReq}
                  onChange={(v) =>
                    setFilters({ ...filters, billDetailsReq: v })
                  }
                />
                <CheckboxInput
                  id="billWise"
                  label="Bill Type Wise"
                  checked={filters.billWise}
                  onChange={(v) => setFilters({ ...filters, billWise: v })}
                />
                <CheckboxInput
                  id="spIdWise"
                  label="Stock Place Wise"
                  checked={filters.spIdWise}
                  onChange={(v) => setFilters({ ...filters, spIdWise: v })}
                />
                <CheckboxInput
                  id="ledgerWise"
                  label="Ledger Wise"
                  checked={filters.ledgerWise}
                  onChange={(v) => setFilters({ ...filters, ledgerWise: v })}
                />
                <CheckboxInput
                  id="dateWise"
                  label="Date Wise"
                  checked={filters.dateWise}
                  onChange={(v) => setFilters({ ...filters, dateWise: v })}
                />
              </>
            )}
          </div>

          <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Stock Place
              </label>
              <select
                value={filters.stockPlace}
                onChange={(e) =>
                  setFilters({ ...filters, stockPlace: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D9E75]/20 focus:border-[#2D9E75] transition-all appearance-none"
              >
                <option value="">Select Stock Place</option>
                {stockPlaceList.map((sp) => (
                  <option key={sp.id} value={sp.id}>
                    {sp.name}
                  </option>
                ))}
              </select>
            </div>

            {!filters.inventory && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Bill Type
                </label>
                <select
                  value={filters.invType}
                  onChange={(e) =>
                    setFilters({ ...filters, invType: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D9E75]/20 focus:border-[#2D9E75] transition-all appearance-none"
                >
                  <option value="">Select Type</option>
                  {invTypesList.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.text}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col md:flex-row items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-6 gap-4">
          <div className="flex flex-wrap items-center gap-4">
            {!filters.inventory && (
              <>
                <div className="w-full md:w-48">
                  <AutocompleteInput
                    label="Select Party"
                    disabled={filters.ledgerWise}
                    value={filters.ledgerIds}
                    options={ledgerList}
                    onChange={(v) => setFilters({ ...filters, ledgerIds: v })}
                    placeholder="Select Party"
                    templateType="ledger"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase mt-4">
                    From
                  </span>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) =>
                      setFilters({ ...filters, dateFrom: e.target.value })
                    }
                    className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#2D9E75]/20 focus:border-[#2D9E75] transition-all mt-4"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase mt-4">
                    To
                  </span>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) =>
                      setFilters({ ...filters, dateTo: e.target.value })
                    }
                    className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#2D9E75]/20 focus:border-[#2D9E75] transition-all mt-4"
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <button
              onClick={submitReport}
              className="w-10 h-10 rounded-lg bg-[#2D9E75] text-white flex items-center justify-center hover:opacity-90 transition-all shadow-sm cursor-pointer"
              title="Search"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Search size={16} />
              )}
            </button>
            <button
              onClick={clearFilters}
              className="w-10 h-10 rounded-lg bg-lime-500 text-white flex items-center justify-center hover:opacity-90 transition-all shadow-sm cursor-pointer"
              title="Reset Filters"
            >
              <RotateCcw size={16} />
            </button>
            <button
              className="w-10 h-10 rounded-lg bg-rose-500 text-white flex items-center justify-center hover:opacity-90 transition-all shadow-sm cursor-pointer"
              title="PDF Export"
            >
              <FileText size={16} />
            </button>
            <button
              onClick={handleExport}
              className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center hover:opacity-90 transition-all shadow-sm cursor-pointer"
              title="Excel Export"
            >
              {exportLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <FileSpreadsheet size={16} />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto max-h-[calc(100vh-420px)]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                {columns.map((col) => (
                  <th
                    key={col}
                    className={`px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap ${isNumericColumn(col) ? "text-right" : ""}`}
                  >
                    {columnLabel(col)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td
                    colSpan={columns.length || 1}
                    className="px-6 py-12 text-center"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Loader2
                        size={24}
                        className="animate-spin text-[#2D9E75]"
                      />
                      <span className="text-xs text-slate-500 font-medium">
                        Fetching report data...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : !data.length ? (
                <tr>
                  <td
                    colSpan={columns.length || 1}
                    className="px-6 py-12 text-center text-sm text-slate-400"
                  >
                    {columns.length === 0
                      ? "Click Search to load report data"
                      : "No report values found for selected criteria"}
                  </td>
                </tr>
              ) : (
                data.map((row, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    {columns.map((col) => (
                      <td
                        key={col}
                        className={`px-4 py-3 text-sm whitespace-nowrap ${isNumericColumn(col) ? "text-right font-medium text-slate-700 dark:text-slate-300" : col.toLowerCase() === "itemcode" ? "font-semibold text-[#2D9E75]" : col.toLowerCase().includes("code") ? "font-bold text-slate-800 dark:text-slate-100" : "text-slate-600 dark:text-slate-400"}`}
                      >
                        {col === "Date"
                          ? formatDateStr(row[col])
                          : isNumericColumn(col)
                            ? formatNumber(row[col])
                            : (row[col] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination & Basic Info */}
        <div className="bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Showing{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              1
            </span>{" "}
            to{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {data.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {data.length}
            </span>{" "}
            results
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-white dark:hover:bg-slate-700 text-slate-400 disabled:opacity-50 cursor-pointer">
              <ChevronsLeft size={16} />
            </button>
            <button className="p-2 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-white dark:hover:bg-slate-700 text-slate-400 disabled:opacity-50 cursor-pointer">
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center space-x-1 px-2">
              <button className="w-8 h-8 rounded-md bg-[#2D9E75] text-white text-sm font-bold cursor-pointer">
                1
              </button>
            </div>
            <button className="p-2 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-white dark:hover:bg-slate-700 text-slate-400 cursor-pointer">
              <ChevronRight size={16} />
            </button>
            <button className="p-2 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-white dark:hover:bg-slate-700 text-slate-400 cursor-pointer">
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Fixed Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 py-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-40">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <div className="flex space-x-8">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">Total Rows:</span>
              <span className="text-[#2D9E75] text-sm font-bold">
                {data.length}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">Filter Applied:</span>
              <span
                className="text-indigo-500 text-sm font-bold truncate max-w-[150px] sm:max-w-xs md:max-w-md"
                title={
                  [
                    filters.dateWise && "Date Wise",
                    filters.itemWise && "Item Wise",
                    filters.ledgerWise && "Ledger Wise",
                    filters.billWise && "Bill Type Wise",
                    filters.spIdWise && "Stock Place Wise",
                    filters.inventory && "Inventory",
                  ]
                    .filter(Boolean)
                    .join(", ") || "None"
                }
              >
                {[
                  filters.dateWise && "Date Wise",
                  filters.itemWise && "Item Wise",
                  filters.ledgerWise && "Ledger Wise",
                  filters.billWise && "Bill Type Wise",
                  filters.spIdWise && "Stock Place Wise",
                  filters.inventory && "Inventory",
                ]
                  .filter(Boolean)
                  .join(", ") || "None"}
              </span>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <span className="bg-[#2D9E75]/10 text-[#2D9E75] px-3 py-1 rounded-full">
              System Ready
            </span>
            <span className="text-[10px] font-normal lowercase">
              v4.2.1-stable
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

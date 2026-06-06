import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  RotateCcw,
  FileSpreadsheet,
  FileText,
  Loader2,
  Printer,
  Eye,
} from "lucide-react";
import { reportApi } from "../../../services/report.service";
import { projectSiteApi } from "../../../services/project-site.service";
import { CommonAutocompleteTemplate } from "../../../shared/CommonAutocompleteTemplate";
import { toast } from "../../../lib/toast";
import * as H from "../outstanding/outstandingHelpers";

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
}> = ({
  label,
  value,
  options,
  onChange,
  placeholder,
  displayField = "name",
  templateType = "name",
  disabled = false,
  required = false,
  hasError = false,
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
          .filter((o) => {
            const val = o[displayField] || o.name || "";
            return val.toLowerCase().includes(search.toLowerCase());
          })
          .slice(0, 50)
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
        value={value ? value[displayField] || value.name || "" : search}
        onChange={(e) => {
          setSearch(e.target.value);
          onChange(null);
          setOpen(true);
        }}
        onFocus={() => !disabled && setOpen(true)}
        className={`w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all disabled:opacity-50 font-semibold ${hasError ? "border-red-500 focus:border-red-500" : "border-slate-200 dark:border-slate-700 focus:border-sky-500"}`}
      />
      {open && filtered.length > 0 && !disabled && (
        <div
          className={`absolute z-50 top-full mt-1 ${["item", "ledger"].includes(templateType) ? "w-[600px] max-w-[90vw]" : "w-full"} bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-xl max-h-64 overflow-y-auto`}
        >
          {filtered.map((opt, i) => (
            <button
              key={i}
              onClick={() => {
                onChange(opt);
                setSearch("");
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 last:border-0"
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

const EN_INV_TYPE_FOR_DROPDOWN = [
  { text: "Sales Invoice", id: 1 },
  { text: "Cash Invoice", id: 2 },
  { text: "Sale Return", id: 3 },
  { text: "Sales Quotation", id: 4 },
  { text: "Sales Order", id: 5 },
  { text: "Performa Invoice", id: 6 },
  { text: "Dispatch Note", id: 7 },
  { text: "Purchase Order", id: 8 },
  { text: "Purchase Invoice", id: 9 },
  { text: "Purchase Return", id: 10 },
  { text: "Purchase Quotation", id: 11 },
  { text: "Opening Stock", id: 12 },
  { text: "Transfered In Stock", id: 13 },
  { text: "Transfered Out Stock", id: 14 },
  { text: "Adjusted Stock", id: 15 },
  { text: "Purchase Challan", id: 16 },
  { text: "Payment Voucher", id: 17 },
  { text: "Receipt Voucher", id: 18 },
  { text: "Journal Voucher", id: 19 },
  { text: "Contra Voucher", id: 20 },
  { text: "Absolute Stock", id: 21 },
  { text: "Sales Enquiry", id: 23 },
  { text: "Payment Open Brc", id: 24 },
  { text: "Receipt Open Brc", id: 25 },
  { text: "Costing", id: 26 },
  { text: "Material Slip", id: 27 },
  { text: "Material In", id: 28 },
  { text: "Material Out", id: 29 },
  { text: "Dispatch Note Return", id: 30 },
  { text: "Purchase Challan Return", id: 31 },
  { text: "Cancel Document", id: 32 },
  { text: "Production Order", id: 33 },
];

export const DocumentsReport: React.FC = () => {
  const precision = H.getPrecision();

  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);

  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);

  // Dropdown lists
  const [itemList, setItemList] = useState<any[]>([]);
  const [ledgerList, setLedgerList] = useState<any[]>([]);
  const [projectSites, setProjectSites] = useState<any[]>([]);

  const defaultFilters = {
    fromDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    toDate: new Date().toISOString().split("T")[0],
    invType: 1, // default doc type (Sales Invoice)
    ledgerId: null,
    itemId: null,
    invoiceNo: "",
    itemDetails: false, // hidden, replaced by reportOptions logic in backend mostly
    isActual: true,
    isAdvance: false,
    itemSelect: true,
    reportOptions: 1, // Without Item Details
    projectSiteId: null,
  };

  const [filters, setFilters] = useState<Record<string, any>>(defaultFilters);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    try {
      const items = JSON.parse(localStorage.getItem("item-list") || "[]");
      setItemList(
        items
          .filter((ele: any) => ele.isact)
          .map((ele: any) => ({
            ...ele,
            particular: [ele.nm, ele.ict, ele.typ, ele.brd, ele.siz, ele.ig]
              .filter(Boolean)
              .join(" "),
            name: ele.nm,
          })),
      );

      const ledgers = JSON.parse(localStorage.getItem("ledger-list") || "[]");
      setLedgerList(ledgers);
    } catch {}

    const loadProjectSites = async () => {
      try {
        const result = await projectSiteApi.search({
          pageSize: 1000,
          pageNumber: 1
        });
        setProjectSites(result.list || []);
      } catch (err) {
        console.error("Failed to load project sites", err);
      }
    };
    loadProjectSites();
  }, []);

  const getFiltersPayload = useCallback(() => {
    return {
      fromDate: filters.fromDate ? `${filters.fromDate} 00:00:00` : null,
      toDate: filters.toDate ? `${filters.toDate} 23:59:59` : null,
      invType: filters.invType || null,
      ledgerId: filters.ledgerId ? filters.ledgerId.id : null,
      itemId: filters.itemId ? filters.itemId.iid : null,
      invoiceNo: filters.invoiceNo || null,
      itemDetails: filters.reportOptions === 2 || filters.reportOptions === 4,
      isActual: filters.isActual,
      isAdvance: filters.isAdvance,
      itemSelect: filters.itemSelect,
      reportOptions: filters.reportOptions,
      projectSiteId: filters.projectSiteId || null,
    };
  }, [filters]);

  const validate = () => {
    setSubmitted(true);
    if (!filters.fromDate || !filters.toDate) {
      toast.error("Please specify both From Date and To Date");
      return false;
    }
    const rec = filters.reportOptions;
    if ((rec === 3 || rec === 4 || rec === 5 || rec === 6) && !filters.invType) {
      toast.error("Document Type is required for this report option.");
      return false;
    }
    return true;
  };

  const getRequestedFields = (condition: any, dataItems: any[]) => {
    if (!dataItems || !dataItems.length) return [];
    let fields = [
      "Date", "Bill_No", "PartyName", "OrderNo", "OrderDate", "Itemcode", "Itemname",
      "Category", "Sizes", "Type", "Brand", "Std_Qty",
      "PendingQty", "Std_Rate", "ProjectSiteName", "InvoiceNo", "InvTypeName",
      "RefNo", "RefDate", "YourRefNo", "YourRefDate", "OtherRefNo", "OtherRefDate",
      "AgainstRefNo", "AgainstRefDate", "PIDNo", "Item_SubTotal", "Extra_Subtotal",
      "Grandtotal", "Remark", "Note", "SupplyToName", "ProjectName", "KindAttention",
      "Subject", "LoginByUserName", "DepartmentUserName", "Stockplace", "SalesByUserName",
      "MfgCode", "MfgDate", "ExpDate", "RejectQty", "ScrapQty", "ItemGroup"
    ];

    // Filter based on data presence & logic
    const availableKeys = Object.keys(dataItems[0]);

    if (condition.reportOptions === 1) {
      const itemFields = ["Itemcode", "Itemname", "Category", "Sizes", "Type", "Brand", "Std_Qty", "PendingQty", "Std_Rate", "ItemGroup", "MfgCode", "MfgDate", "ExpDate"];
      fields = fields.filter((f) => !itemFields.includes(f));
    } else {
      if (condition.isActual === true) {
        fields = fields.filter((f) => f !== "PendingQty");
      }
    }
    
    // Check advance details
    if (!condition.isAdvance) {
       const advFields = ["YourRefNo", "YourRefDate", "OtherRefNo", "OtherRefDate", "AgainstRefNo", "AgainstRefDate", "SupplyToName", "ProjectName", "KindAttention", "Subject"];
       fields = fields.filter(f => !advFields.includes(f));
    }

    // specific report option rules
    if (condition.reportOptions === 3) {
      fields = ["Itemcode", "Itemname", "Category", "Sizes", "Type", "Brand", "ItemGroup", "Std_Qty", "PendingQty"];
    } else if (condition.reportOptions === 5) {
      fields = ["InvoiceNo", "Bill_No", "Date", "PartyName", "Itemcode", "Itemname", "Category", "Sizes", "Type", "Brand", "ItemGroup", "RejectQty"];
    } else if (condition.reportOptions === 6) {
      fields = ["InvoiceNo", "Bill_No", "Date", "PartyName", "Itemcode", "Itemname", "Category", "Sizes", "Type", "Brand", "ItemGroup", "ScrapQty"];
    }

    return fields.filter(f => availableKeys.includes(f) || availableKeys.includes(f.toLowerCase()));
  };

  const submitReport = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      const payload = getFiltersPayload();
      const result = await reportApi.documentsReport(payload);

      if (result?.length) {
        result.sort((a, b) => (a.InvoiceNo || 0) - (b.InvoiceNo || 0));
        
        const condition = {
            isAdvance: filters.isAdvance,
            isActual: filters.isActual,
            reportOptions: filters.reportOptions,
        };

        const activeCols = getRequestedFields(condition, result);
        setColumns(activeCols.length ? activeCols : Object.keys(result[0]));
        setData(result);
      } else {
        setData([]);
        setColumns([]);
        toast.info("No data found.", "Info");
      }
    } catch (err: any) {
      setData([]);
      setColumns([]);
      toast.error(err?.message || "Error fetching report");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!validate()) return;
    setExportLoading(true);
    try {
      const payload = getFiltersPayload();
      const blob = await reportApi.documentsReportExport(payload);

      if (blob && blob.size > 0) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "documents-report.xlsx";
        a.click();
        URL.revokeObjectURL(url);
      } else {
         toast.info("No data to export");
      }
    } catch (e: any) {
      toast.error(e?.message || "Export error");
    } finally {
      setExportLoading(false);
    }
  };

  const handlePrint = async () => {
    setPrintLoading(true);
    try {
      toast.info("Print functionality requires backend implementation.");
    } finally {
      setPrintLoading(false);
    }
  };

  const clearFilters = () => {
    setSubmitted(false);
    setFilters(defaultFilters);
    setData([]);
  };

  const formatNumber = (val: any) => {
    if (val == null || val === "") return "";
    const n = parseFloat(val);
    return isNaN(n) ? val : H.formatNumber(n, precision);
  };

  const formatDateStr = (val: any) => {
    if (!val) return "";
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return val;
      return d.toLocaleDateString("en-GB");
    } catch {
      return val;
    }
  };

  const columnLabels: Record<string, string> = {
    InvoiceNo: "Doc No",
    Bill_No: "Bill No",
    Date: "Date",
    PartyName: "Party",
    OrderNo: "Order No",
    OrderDate: "Order Date",
    Itemcode: "Item Code",
    Itemname: "Item Name",
    Category: "Category",
    Sizes: "Sizes",
    Type: "Type",
    Brand: "Brand",
    Std_Qty: "Std Qty",
    PendingQty: "Pending Qty",
    Std_Rate: "Std Rate",
    ProjectSiteName: "Project Site",
    InvTypeName: "Doc Type",
    RefNo: "Ref No",
    RefDate: "Ref Date",
    YourRefNo: "Your Ref No",
    YourRefDate: "Your Ref Date",
    OtherRefNo: "Other Ref No",
    OtherRefDate: "Other Ref Date",
    AgainstRefNo: "Against Ref No",
    AgainstRefDate: "Against Ref Date",
    PIDNo: "PID No",
    Item_SubTotal: "Item SubTotal",
    Extra_Subtotal: "Extra Subtotal",
    Grandtotal: "Grand Total",
    Remark: "Remark",
    Note: "Note",
    SupplyToName: "Supply To",
    ProjectName: "Project",
    KindAttention: "Kind Attention",
    Subject: "Subject",
    LoginByUserName: "Created By",
    DepartmentUserName: "Department User",
    Stockplace: "Stock Place",
    SalesByUserName: "Sales Person",
    MfgCode: "Mfg Code",
    MfgDate: "Mfg Date",
    ExpDate: "Exp Date",
    RejectQty: "Reject Qty",
    ScrapQty: "Scrap Qty",
    ItemGroup: "Group",
  };

  const isNumeric = (col: string) => {
      const lower = col.toLowerCase();
      return lower.includes('qty') || lower.includes('rate') || lower.includes('total') || lower.includes('amount');
  };

  return (
    <div className="font-sans text-slate-700 dark:text-slate-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-slate-200 dark:bg-slate-700 p-2 rounded-lg text-slate-600 dark:text-slate-300">
            <FileText size={20} />
          </div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            Documents Report
          </h1>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-3 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 mb-2">
          {/* Row 1 equivalent */}
          <AutocompleteInput
            label="Select Ledger"
            value={filters.ledgerId}
            options={ledgerList}
            onChange={(v) => setFilters({ ...filters, ledgerId: v })}
            placeholder="Select Ledger"
            templateType="ledger"
          />

          <AutocompleteInput
            label="Single Item"
            value={filters.itemId}
            options={itemList}
            onChange={(v) => setFilters({ ...filters, itemId: v })}
            placeholder="Single Item"
            displayField="particular"
            templateType="item"
          />

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Document Type
            </label>
            <select
              value={filters.invType || ""}
              onChange={(e) =>
                setFilters({ ...filters, invType: e.target.value ? parseInt(e.target.value) : null })
              }
              className={`w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded-md text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20 ${(filters.reportOptions >= 3) && !filters.invType && submitted ? "border-red-500" : "border-slate-200 dark:border-slate-700"}`}
            >
              <option value="">--Select doc. type--</option>
              {EN_INV_TYPE_FOR_DROPDOWN.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.text}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              From Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) =>
                setFilters({ ...filters, fromDate: e.target.value })
              }
              className={`w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded-md text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20 ${submitted && !filters.fromDate ? "border-red-500" : "border-slate-200 dark:border-slate-700"}`}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              To Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) =>
                setFilters({ ...filters, toDate: e.target.value })
              }
              className={`w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded-md text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20 ${submitted && !filters.toDate ? "border-red-500" : "border-slate-200 dark:border-slate-700"}`}
            />
          </div>

          {/* Row 2 equivalent */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Document No
            </label>
            <input
              type="text"
              value={filters.invoiceNo}
              onChange={(e) =>
                setFilters({ ...filters, invoiceNo: e.target.value })
              }
              placeholder="Document No"
              className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Project Site
            </label>
            <select
              value={filters.projectSiteId || ""}
              onChange={(e) =>
                setFilters({ ...filters, projectSiteId: e.target.value ? parseInt(e.target.value) : null })
              }
              className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="">Select Project Site</option>
              {projectSites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Report Option <span className="text-red-500">*</span>
            </label>
            <select
              value={filters.reportOptions}
              onChange={(e) =>
                setFilters({ ...filters, reportOptions: parseInt(e.target.value) })
              }
              className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            >
              <option value={1}>Without Item Details</option>
              <option value={2}>With Item Details</option>
              <option value={3}>Item Summary</option>
              <option value={4}>Item Batch Wise</option>
              <option value={5}>Rejected Items</option>
              <option value={6}>Scrap Items</option>
            </select>
          </div>

          <div className="flex flex-col gap-1 justify-center lg:col-span-1 pt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="isActual"
                checked={filters.isActual === true}
                onChange={() => setFilters({ ...filters, isActual: true })}
                className="text-sky-600 focus:ring-sky-500 w-3 h-3"
              />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Actual Document</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="isActual"
                checked={filters.isActual === false}
                onChange={() => setFilters({ ...filters, isActual: false })}
                className="text-sky-600 focus:ring-sky-500 w-3 h-3"
              />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Pending Document</span>
            </label>
          </div>

          <div className="flex flex-col gap-1 justify-center pt-4 relative">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="isAdvance"
                checked={filters.isAdvance === false}
                onChange={() => setFilters({ ...filters, isAdvance: false })}
                className="text-sky-600 focus:ring-sky-500 w-3 h-3"
              />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Basic Details</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="isAdvance"
                checked={filters.isAdvance === true}
                onChange={() => setFilters({ ...filters, isAdvance: true })}
                className="text-sky-600 focus:ring-sky-500 w-3 h-3"
              />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Advance Details</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-end justify-start gap-2 h-full pb-1">
            <button
              onClick={submitReport}
              className="w-8 h-8 rounded-md bg-[#2D9E75] text-white flex items-center justify-center hover:opacity-90 transition-all shadow-sm cursor-pointer"
              title="Search"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            </button>
            <button
              onClick={clearFilters}
              className="w-8 h-8 rounded-md bg-lime-500 text-white flex items-center justify-center hover:opacity-90 transition-all shadow-sm cursor-pointer"
              title="Reset Filters"
            >
              <RotateCcw size={14} />
            </button>
            <button
              onClick={handleExport}
              className="w-8 h-8 rounded-md bg-emerald-600 text-white flex items-center justify-center hover:opacity-90 transition-all shadow-sm cursor-pointer"
              title="Export to Excel"
            >
              {exportLoading ? <Loader2 size={14} className="animate-spin" /> : <FileSpreadsheet size={14} />}
            </button>
            <button
              onClick={handlePrint}
              className="w-8 h-8 rounded-md bg-rose-500 text-white flex items-center justify-center hover:opacity-90 transition-all shadow-sm cursor-pointer"
              title="Print"
            >
               {printLoading ? <Loader2 size={14} className="animate-spin" /> : <Printer size={14} />}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto max-h-[calc(100vh-450px)] custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                {columns.map((col) => (
                  <th
                    key={col}
                    className={`px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap ${isNumeric(col) ? "text-right" : ""}`}
                  >
                    {columnLabels[col] || col}
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
                        className="animate-spin text-blue-600"
                      />
                      <span className="text-xs text-slate-500 font-medium">
                        Loading records...
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
                    {submitted
                      ? "No rows to show"
                      : "Click Search to view documents"}
                  </td>
                </tr>
              ) : (
                data.map((row, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    {columns.map((col) => {
                      const isNum = isNumeric(col);
                      const isDate = col.toLowerCase().includes("date");
                      return (
                        <td
                          key={col}
                          className={`px-4 py-3 text-sm whitespace-nowrap ${isNum ? "text-right font-medium text-slate-700 dark:text-slate-300" : "text-slate-600 dark:text-slate-400"}`}
                        >
                          {isDate && row[col]
                            ? formatDateStr(row[col])
                            : isNum
                              ? formatNumber(row[col])
                              : row[col] ?? ""}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 bg-brand-yellow dark:bg-brand-yellow/10 border-t border-brand-yellow/20 dark:border-brand-yellow/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-800 dark:text-brand-yellow/90 font-medium">
                Total Rows:
              </span>
              <span className="px-2 py-0.5 bg-slate-900/10 dark:bg-brand-yellow/20 text-slate-900 dark:text-brand-yellow rounded text-[10px] font-bold">
                {data.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

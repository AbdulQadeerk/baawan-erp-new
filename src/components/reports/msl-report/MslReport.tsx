import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  RotateCcw,
  FileSpreadsheet,
  Printer,
  Loader2,
  Calendar,
  X,
  Package,
} from "lucide-react";
import { reportApi } from "../../../services/report.service";
import { commonApi } from "../../../lib/api-client";
import { toast } from "../../../lib/toast";
import * as H from "../outstanding/outstandingHelpers";
import { DateRangePicker } from "../../DateRangePicker";

// ─── Autocomplete Option Interface ──────────────────────────────────────────
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
}> = ({
  label,
  value,
  options,
  onChange,
  placeholder,
  displayField = "name",
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
    search.length >= 1
      ? options
          .filter((o) =>
            o[displayField]?.toLowerCase().includes(search.toLowerCase())
          )
          .slice(0, 10)
      : options.slice(0, 10);

  return (
    <div className="relative w-full" ref={ref}>
      <div
        className={`w-full px-3 py-1 bg-white dark:bg-slate-900 border rounded-lg transition-all focus-within:border-yellow-500 focus-within:ring-2 focus-within:ring-yellow-500/20 ${
          open
            ? "border-yellow-500 ring-2 ring-yellow-500/20"
            : "border-slate-200 dark:border-slate-700"
        }`}
      >
        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block select-none mb-0.5">
          {label}
        </label>
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder={placeholder}
            value={value ? value[displayField] || "" : search}
            onChange={(e) => {
              setSearch(e.target.value);
              onChange(null);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            className="w-full bg-transparent border-0 p-0 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-0 disabled:opacity-50 pr-6"
          />
          {(value || search) && (
            <button
              type="button"
              className="absolute right-0 text-slate-400 dark:text-slate-500 hover:text-slate-600 font-extrabold select-none cursor-pointer"
              onClick={() => {
                onChange(null);
                setSearch("");
              }}
            >
              <X size={14} className="stroke-[3]" />
            </button>
          )}
        </div>
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute z-50 top-full mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {filtered.map((opt, i) => (
            <button
              key={i}
              onClick={() => {
                onChange(opt);
                setSearch("");
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              {opt[displayField]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main MSL Report Component ──────────────────────────────────────────────
export const MslReport: React.FC = () => {
  const precision = H.getPrecision();

  const formatNumber = (val: number | null | undefined, prec: number = 2): string => {
    if (val == null) return "";
    const n = Number(val);
    if (isNaN(n)) return String(val);
    return n.toLocaleString("en-IN", {
      minimumFractionDigits: prec,
      maximumFractionDigits: prec,
    });
  };

  // Filters State
  const [filters, setFilters] = useState<any>({
    brand: null,
    category: null,
    sizes: null,
    type: null,
    item_CodeTxt: null,
    name: null,
  });

  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 6);
    return d.toISOString().split("T")[0];
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().split("T")[0]);

  // Autocomplete Options Lists
  const [brandList, setBrandList] = useState<AutocompleteOption[]>([]);
  const [categoryList, setCategoryList] = useState<AutocompleteOption[]>([]);
  const [sizeList, setSizeList] = useState<AutocompleteOption[]>([]);
  const [typeList, setTypeList] = useState<AutocompleteOption[]>([]);
  const [codeList, setCodeList] = useState<AutocompleteOption[]>([]);
  const [nameList, setNameList] = useState<AutocompleteOption[]>([]);

  // Search Results & UI States
  const [lst, setLst] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Fetch Autocomplete filters options on mount
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
    loadDistinct("Item_CodeTxt", setCodeList);
    loadDistinct("Name", setNameList);
  }, []);

  const formatDateForApi = (dateStr: string, time: string) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y} ${time}`;
  };

  const getFilters = useCallback(() => {
    return {
      brand: filters.brand ? filters.brand.name : null,
      category: filters.category ? filters.category.name : null,
      sizes: filters.sizes ? filters.sizes.name : null,
      type: filters.type ? filters.type.name : null,
      item_CodeTxt: filters.item_CodeTxt ? filters.item_CodeTxt.name : null,
      name: filters.name ? filters.name.name : null,
      invType: null,
      fromDate: formatDateForApi(fromDate, "00:00:00"),
      toDate: formatDateForApi(toDate, "23:59:59"),
    };
  }, [filters, fromDate, toDate]);

  const submitSearch = useCallback(async () => {
    setSubmitted(true);
    if (!fromDate || !toDate) {
      toast.info("From Date and To Date are required.", "Validation Error");
      return;
    }
    if (new Date(fromDate) > new Date(toDate)) {
      toast.info("From Date cannot be greater than To Date.", "Validation Error");
      return;
    }

    setLoading(true);
    try {
      const payload = getFilters();
      const data = await reportApi.mslReport(payload);
      if (data && data.length > 0) {
        setLst(data);
      } else {
        setLst([]);
        toast.info("No data found", "Info");
      }
    } catch (err: any) {
      setLst([]);
      toast.error(err?.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, getFilters]);

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const payload = getFilters();
      const blob = await reportApi.mslReportExport(payload);
      if (blob?.size) {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "MSLReport.xlsx";
        a.click();
        URL.revokeObjectURL(a.href);
      } else {
        toast.info("No data found to export.", "Info");
      }
    } catch {
      toast.error("Excel export failed");
    } finally {
      setExportLoading(false);
    }
  };

  const handlePrint = async () => {
    setPrintLoading(true);
    try {
      const printData = lst.length
        ? lst
        : await reportApi.mslReport(getFilters());

      if (printData?.length) {
        const pdfMake = (await import("pdfmake/build/pdfmake")).default;
        const pdfFonts = (await import("pdfmake/build/vfs_fonts")).default;
        (pdfMake as any).vfs = pdfFonts?.pdfMake?.vfs || pdfFonts;

        const headers = [
          { text: "Item Code", style: "tableHeader", alignment: "left" },
          { text: "Sales", style: "tableHeader", alignment: "right" },
          { text: "Sales Return", style: "tableHeader", alignment: "right" },
          { text: "Project Sales", style: "tableHeader", alignment: "right" },
          { text: "Project Return", style: "tableHeader", alignment: "right" },
          { text: "Retail Spl Sales", style: "tableHeader", alignment: "right" },
          { text: "Retail Spl Return", style: "tableHeader", alignment: "right" },
          { text: "Minimum Qty", style: "tableHeader", alignment: "right" },
          { text: "Re-Order Qty", style: "tableHeader", alignment: "right" },
          { text: "Current Stock", style: "tableHeader", alignment: "right" },
          { text: "Pending Orders", style: "tableHeader", alignment: "right" },
        ];

        const rows: any[][] = printData.map((row: any) => [
          String(row.Item ?? "-"),
          formatNumber(row.Sales, precision),
          formatNumber(row["Sales Return"], precision),
          formatNumber(row["Project Sales"], precision),
          formatNumber(row["Project Return"], precision),
          formatNumber(row["Retail Spl Sales"], precision),
          formatNumber(row["Retail Spl Return"], precision),
          formatNumber(row.MinimumQty, precision),
          formatNumber(row.ReOrderQty, precision),
          formatNumber(row.CurrentStock, precision),
          formatNumber(row.PendingQty, precision),
        ]);

        const totalSales = printData.reduce((acc, r) => acc + (Number(r.Sales) || 0), 0);
        const totalSalesReturn = printData.reduce((acc, r) => acc + (Number(r["Sales Return"]) || 0), 0);
        const totalProjSales = printData.reduce((acc, r) => acc + (Number(r["Project Sales"]) || 0), 0);
        const totalProjReturn = printData.reduce((acc, r) => acc + (Number(r["Project Return"]) || 0), 0);
        const totalRetailSales = printData.reduce((acc, r) => acc + (Number(r["Retail Spl Sales"]) || 0), 0);
        const totalRetailReturn = printData.reduce((acc, r) => acc + (Number(r["Retail Spl Return"]) || 0), 0);

        const totalsRow = [
          { text: "Total", bold: true, alignment: "left" },
          { text: formatNumber(totalSales, precision), bold: true, alignment: "right" },
          { text: formatNumber(totalSalesReturn, precision), bold: true, alignment: "right" },
          { text: formatNumber(totalProjSales, precision), bold: true, alignment: "right" },
          { text: formatNumber(totalProjReturn, precision), bold: true, alignment: "right" },
          { text: formatNumber(totalRetailSales, precision), bold: true, alignment: "right" },
          { text: formatNumber(totalRetailReturn, precision), bold: true, alignment: "right" },
          "",
          "",
          "",
          "",
        ];
        rows.push(totalsRow);

        const now = new Date();
        const printedOn = `Printed on: ${now.toLocaleDateString("en-GB")} ${now.toLocaleTimeString("en-GB")}`;

        const docDef: any = {
          pageOrientation: "landscape",
          pageSize: "A4",
          content: [
            {
              text: printedOn,
              alignment: "right",
              fontSize: 8,
              color: "#64748b",
              margin: [0, 0, 0, 5],
            },
            {
              text: "MSL Report",
              style: "header",
              margin: [0, 0, 0, 10],
            },
            {
              table: {
                headerRows: 1,
                widths: ["*", "auto", "auto", "auto", "auto", "auto", "auto", "auto", "auto", "auto", "auto"],
                body: [headers, ...rows],
              },
              layout: {
                hLineWidth: () => 0.5,
                vLineWidth: () => 0.5,
                hLineColor: () => "#e2e8f0",
                vLineColor: () => "#e2e8f0",
                paddingLeft: () => 4,
                paddingRight: () => 4,
                paddingTop: () => 4,
                paddingBottom: () => 4,
              },
            },
            {
              text: `Total Rows: ${printData.length}`,
              style: "footer",
              margin: [0, 10, 0, 0],
            },
          ],
          styles: {
            header: { fontSize: 14, bold: true, color: "#1e293b" },
            tableHeader: {
              fontSize: 8,
              bold: true,
              color: "#475569",
              fillColor: "#f1f5f9",
            },
            footer: { fontSize: 9, italics: true, color: "#64748b" },
          },
          defaultStyle: { fontSize: 8 },
        };
        pdfMake.createPdf(docDef).open();
      } else {
        toast.info("No data found to print.", "Info");
      }
    } catch (err: any) {
      toast.error(err?.message || "Print failed");
    } finally {
      setPrintLoading(false);
    }
  };

  const handleClear = () => {
    setLst([]);
    setFilters({
      brand: null,
      category: null,
      sizes: null,
      type: null,
      item_CodeTxt: null,
      name: null,
    });
    setFromDate(() => {
      const d = new Date();
      d.setMonth(d.getMonth() - 6);
      return d.toISOString().split("T")[0];
    });
    setToDate(new Date().toISOString().split("T")[0]);
    setSubmitted(false);
  };

  // Calculations for bottom sticky bar
  const totalSales = lst.reduce((acc, r) => acc + (Number(r.Sales) || 0), 0);
  const totalSalesReturn = lst.reduce((acc, r) => acc + (Number(r["Sales Return"]) || 0), 0);
  const totalProjSales = lst.reduce((acc, r) => acc + (Number(r["Project Sales"]) || 0), 0);
  const totalProjReturn = lst.reduce((acc, r) => acc + (Number(r["Project Return"]) || 0), 0);
  const totalRetailSales = lst.reduce((acc, r) => acc + (Number(r["Retail Spl Sales"]) || 0), 0);
  const totalRetailReturn = lst.reduce((acc, r) => acc + (Number(r["Retail Spl Return"]) || 0), 0);

  return (
    <div className="font-sans text-slate-700 dark:text-slate-200 pt-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg text-orange-600 dark:text-orange-400">
            <Package size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">MSL Report</h1>
            <p className="text-xs text-slate-500 font-medium">
              View and manage minimum stock levels, sales, and re-order quantities.
            </p>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
        {/* Row 1: The 6 autocomplete filters */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
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
            label="Sub cat."
            value={filters.sizes}
            options={sizeList}
            onChange={(v) => setFilters({ ...filters, sizes: v })}
            placeholder="Sub cat."
          />
          <AutocompleteInput
            label="Type"
            value={filters.type}
            options={typeList}
            onChange={(v) => setFilters({ ...filters, type: v })}
            placeholder="Type"
          />
        </div>

        {/* Row 2: Date Range picker + Action Buttons */}
        <div className="flex flex-wrap items-end gap-3 w-full">
          {/* From Date */}
          <div className="w-full sm:w-36 shrink-0 space-y-1">
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              From Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer font-semibold"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          {/* To Date */}
          <div className="w-full sm:w-36 shrink-0 space-y-1">
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              To Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer font-semibold"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pb-0.5">
            <div className="shrink-0 relative">
              <button
                type="button"
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="w-10 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                title="Date Presets"
              >
                <Calendar size={18} />
              </button>
              {showDatePicker && (
                <DateRangePicker
                  isOpen={showDatePicker}
                  onClose={() => setShowDatePicker(false)}
                  onApply={(from, to) => {
                    const partsFrom = from.split("/");
                    if (partsFrom.length === 3) {
                      setFromDate(`${partsFrom[2]}-${partsFrom[1]}-${partsFrom[0]}`);
                    }
                    const partsTo = to.split("/");
                    if (partsTo.length === 3) {
                      setToDate(`${partsTo[2]}-${partsTo[1]}-${partsTo[0]}`);
                    }
                    setShowDatePicker(false);
                  }}
                  initialFrom={H.formatDisplayDate(fromDate)}
                  initialTo={H.formatDisplayDate(toDate)}
                />
              )}
            </div>

            {/* Search */}
            <button
              onClick={submitSearch}
              disabled={loading}
              title="Search"
              className="w-10 h-10 flex items-center justify-center bg-[#2D9E75] text-white rounded-lg hover:opacity-90 transition-all shadow-sm cursor-pointer disabled:opacity-70"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Search size={16} />
              )}
            </button>

            {/* Clear */}
            <button
              onClick={handleClear}
              title="Reset Filters"
              className="w-10 h-10 flex items-center justify-center bg-lime-500 text-white rounded-lg hover:opacity-90 transition-all shadow-sm cursor-pointer"
            >
              <RotateCcw size={16} />
            </button>

            {/* Print */}
            <button
              onClick={handlePrint}
              disabled={printLoading || loading}
              title="Print PDF"
              className="w-10 h-10 flex items-center justify-center bg-rose-500 text-white rounded-lg hover:opacity-90 transition-all shadow-sm cursor-pointer disabled:opacity-70"
            >
              {printLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Printer size={16} />
              )}
            </button>

            {/* Excel */}
            <button
              onClick={handleExport}
              disabled={exportLoading || loading}
              title="Excel Export"
              className="w-10 h-10 flex items-center justify-center bg-emerald-600 text-white rounded-lg hover:opacity-90 transition-all shadow-sm cursor-pointer disabled:opacity-70"
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

      {/* Grid Table */}
      {lst.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col mt-4">
          <div className="overflow-auto custom-scrollbar max-h-[calc(100vh-340px)]">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="sticky top-0 z-10">
                <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Item Code
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">
                    Sales
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">
                    Sales Return
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">
                    Project Sales
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">
                    Project Return
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">
                    Retail Spl Sales
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">
                    Retail Spl Return
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">
                    Minimum Qty
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">
                    Re-Order Qty
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">
                    Current Stock
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">
                    Pending Orders
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {lst.map((row, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    <td className="px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {row.Item ?? "-"}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                      {formatNumber(row.Sales, precision)}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                      {formatNumber(row["Sales Return"], precision)}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                      {formatNumber(row["Project Sales"], precision)}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                      {formatNumber(row["Project Return"], precision)}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                      {formatNumber(row["Retail Spl Sales"], precision)}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                      {formatNumber(row["Retail Spl Return"], precision)}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                      {formatNumber(row.MinimumQty, precision)}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                      {formatNumber(row.ReOrderQty, precision)}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                      {formatNumber(row.CurrentStock, precision)}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                      {formatNumber(row.PendingQty, precision)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sticky yellow summary bar */}
      {lst.length > 0 && (
        <div className="sticky bottom-0 z-10 bg-brand-yellow dark:bg-brand-yellow/10 rounded-xl border border-brand-yellow/20 dark:border-brand-yellow/5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] p-4 select-none mt-4 text-slate-800 dark:text-brand-yellow">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center md:text-right">
              <span className="text-[10px] font-bold uppercase block text-slate-800/80 dark:text-brand-yellow/70">
                Sales
              </span>
              <span className="text-sm font-black font-mono">
                {formatNumber(totalSales, precision)}
              </span>
            </div>
            <div className="text-center md:text-right">
              <span className="text-[10px] font-bold uppercase block text-slate-800/80 dark:text-brand-yellow/70">
                Sales Return
              </span>
              <span className="text-sm font-black font-mono">
                {formatNumber(totalSalesReturn, precision)}
              </span>
            </div>
            <div className="text-center md:text-right">
              <span className="text-[10px] font-bold uppercase block text-slate-800/80 dark:text-brand-yellow/70">
                Project Sales
              </span>
              <span className="text-sm font-black font-mono">
                {formatNumber(totalProjSales, precision)}
              </span>
            </div>
            <div className="text-center md:text-right">
              <span className="text-[10px] font-bold uppercase block text-slate-800/80 dark:text-brand-yellow/70">
                Project Return
              </span>
              <span className="text-sm font-black font-mono">
                {formatNumber(totalProjReturn, precision)}
              </span>
            </div>
            <div className="text-center md:text-right">
              <span className="text-[10px] font-bold uppercase block text-slate-800/80 dark:text-brand-yellow/70">
                Retail Spl Sales
              </span>
              <span className="text-sm font-black font-mono">
                {formatNumber(totalRetailSales, precision)}
              </span>
            </div>
            <div className="text-center md:text-right">
              <span className="text-[10px] font-bold uppercase block text-slate-800/80 dark:text-brand-yellow/70">
                Retail Spl Return
              </span>
              <span className="text-sm font-black font-mono">
                {formatNumber(totalRetailReturn, precision)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

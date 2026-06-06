import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  RotateCcw,
  FileSpreadsheet,
  Printer,
  Loader2,
  Calendar,
  X,
  Target,
} from "lucide-react";
import { reportApi } from "../../../services/report.service";
import { commonApi } from "../../../services/common.service";
import { toast } from "../../../lib/toast";
import * as H from "../outstanding/outstandingHelpers";
import { storage } from "../../../lib/storage";
import { STORAGE_KEYS } from "../../../lib/constants";

// ─── Autocomplete Input Component ──────────────────────────────────────────
const AutocompleteInput: React.FC<{
  label: string;
  value: any;
  options: any[];
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
    search.length >= 1
      ? options
          .filter((o) =>
            o[displayField]?.toLowerCase().includes(search.toLowerCase()) ||
            (o.particular && o.particular.toLowerCase().includes(search.toLowerCase()))
          )
          .slice(0, 10)
      : [];

  return (
    <div className="relative" ref={ref}>
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
            disabled={disabled}
            placeholder={placeholder}
            value={value ? value[displayField] || "" : search}
            onChange={(e) => {
              setSearch(e.target.value);
              onChange(null);
              setOpen(true);
            }}
            onFocus={() => !disabled && setOpen(true)}
            className="w-full bg-transparent border-0 p-0 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-0 disabled:opacity-50 pr-6"
          />
          {(value || search) && (
            <button
              type="button"
              className="absolute right-0 text-blue-600 dark:text-blue-400 hover:text-blue-800 font-extrabold select-none cursor-pointer"
              onClick={() => {
                onChange(null);
                setSearch("");
              }}
            >
              <X size={16} className="stroke-[3]" />
            </button>
          )}
        </div>
      </div>
      {open && filtered.length > 0 && !disabled && (
        <div className="absolute z-50 top-full mt-1 w-full sm:min-w-[950px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {filtered.map((opt, i) => (
            <button
              key={i}
              onClick={() => {
                onChange(opt);
                setSearch("");
                setOpen(false);
              }}
              className="w-full text-left transition-colors border-b border-slate-100 dark:border-slate-700 last:border-0 p-0 flex hover:brightness-95 dark:hover:brightness-110 focus:outline-none"
            >
              {templateType === "ledger" ? (
                <div className="flex w-full text-sm font-medium">
                  {/* Left part - yellow background */}
                  <div
                    className="w-[32%] bg-[#fcf8e3] dark:bg-amber-950/40 px-3 py-2 text-slate-800 dark:text-amber-200 font-semibold truncate text-left"
                    title={opt.name}
                  >
                    {opt.name}
                  </div>
                  {/* Right part - blue background */}
                  <div className="w-[68%] bg-[#d9edf7] dark:bg-blue-950/40 px-3 py-2 flex items-center text-xs text-slate-700 dark:text-blue-200 font-semibold gap-2">
                    <div className="w-[22%] truncate text-left" title={opt.group}>
                      {opt.group || ""}
                    </div>
                    <div className="w-[24%] truncate text-left" title={opt.area}>
                      {opt.area || "-"}
                    </div>
                    <div className="w-[16%] truncate text-left" title={opt.city}>
                      {opt.city || "-"}
                    </div>
                    <div className="w-[20%] truncate text-left" title={opt.mobile || opt.phone_1 || opt.phone_2}>
                      {opt.mobile || opt.phone_1 || opt.phone_2 || "-"}
                    </div>
                    <div className="w-[18%] truncate text-left" title={opt.gstNo || opt.gstin}>
                      {opt.gstNo || opt.gstin || "-"}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="px-3 py-2 w-full text-left">{opt.name}</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Column Configuration Helper
const getColumnConfig = (key: string) => {
  switch (key) {
    case "Brand":
      return { label: "Brand", align: "left" };
    case "Category":
      return { label: "Category", align: "left" };
    case "Sizes":
      return { label: "Sub Category", align: "left" };
    case "Type":
      return { label: "Type", align: "left" };
    case "TargetAmt":
      return { label: "Target Amt", align: "right", isAmount: true };
    case "TargetQty":
      return { label: "Target Qty", align: "right", isQty: true };
    case "SalesAmt":
      return { label: "Sales Amt", align: "right", isAmount: true };
    case "SalesQty":
      return { label: "Sales Qty", align: "right", isQty: true };
    case "SalesProjectAmt":
      return { label: "Project Amt", align: "right", isAmount: true };
    case "SalesProjectQty":
      return { label: "Project Qty", align: "right", isQty: true };
    case "SalesReturnAmt":
      return { label: "Return Amt", align: "right", isAmount: true };
    case "SalesReturnQty":
      return { label: "Return Qty", align: "right", isQty: true };
    case "NetAmt":
      return { label: "Net Amt", align: "right", isAmount: true };
    case "NetQty":
      return { label: "Net Qty", align: "right", isQty: true };
    case "AchievedAmt":
      return { label: "Achieved Amt %", align: "right", isPercent: true };
    case "AchievedQty":
      return { label: "Achieved Qty %", align: "right", isPercent: true };
    case "UnderAchievedAmt":
      return { label: "Under Achieved Amt %", align: "right", isUnderPercent: "Amt" };
    case "UnderAchievedQty":
      return { label: "Under Achieved Qty %", align: "right", isUnderPercent: "Qty" };
    default:
      return { label: key, align: "right", isQty: true };
  }
};

export const LedgerTargetReport: React.FC = () => {
  const precision = H.getPrecision();

  // Filters State
  const [ledgers, setLedgers] = useState<any[]>([]);
  const [selectedLedger, setSelectedLedger] = useState<any>(null);
  const [dateRanges, setDateRanges] = useState<any[]>([]);
  const [selectedRange, setSelectedRange] = useState<string>("");

  // Search Results
  const [lst, setLst] = useState<any[]>([]);

  // Loading States
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Load all active ledgers (unfiltered)
  useEffect(() => {
    const ldrList = storage.getItem<any[]>(STORAGE_KEYS.LEDGER_LIST) || [];
    const grpList = storage.getItem<any[]>(STORAGE_KEYS.GROUP_LIST) || [];
    if (!ldrList.length) return;

    const enriched = ldrList
      .filter((x: any) => !x.lock_Freeze)
      .map((ele: any) => {
        const parts: string[] = [ele.name];
        if (ele.address) parts.push(ele.address);
        if (ele.area) parts.push(ele.area);
        if (ele.city) parts.push(ele.city);
        if (ele.phone_1) parts.push(ele.phone_1);
        if (ele.phone_2) parts.push(ele.phone_2);
        if (ele.mobile) parts.push(ele.mobile);
        const grp = grpList.find((g: any) => g.id === ele.group_ID);
        return { ...ele, particular: parts.join(" "), group: grp?.name || "" };
      });
    setLedgers(enriched);
  }, []);

  const formatDateToDDMMYYYY = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateForApi = (dateStr: string, time: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year} ${time}`;
  };

  const handleLedgerChange = async (ledger: any) => {
    setSelectedLedger(ledger);
    setDateRanges([]);
    setSelectedRange("");
    setLst([]);

    if (ledger) {
      try {
        const data = await commonApi.salesTargetRange({ id: ledger.id });
        if (data && data.length > 0) {
          const formatted = data.map((item: any) => {
            const formattedFrom = formatDateToDDMMYYYY(item.FromDate);
            const formattedTo = formatDateToDDMMYYYY(item.ToDate);
            return {
              ...item,
              Range: `${formattedFrom} - ${formattedTo}`,
            };
          });
          setDateRanges(formatted);
          // Auto select first option if available
          setSelectedRange(formatted[0].Range);
        } else {
          toast.info("No date ranges found for selected ledger", "Info");
        }
      } catch (err: any) {
        toast.error(err?.message || "Failed to load date ranges");
      }
    }
  };

  const getFilters = () => {
    const dateData = dateRanges.find((x) => x.Range === selectedRange);
    return {
      ledgerId: selectedLedger ? selectedLedger.id : null,
      dateFrom: dateData ? formatDateForApi(dateData.FromDate, "00:00:00") : "",
      dateTo: dateData ? formatDateForApi(dateData.ToDate, "23:59:59") : "",
      resultType: 1,
    };
  };

  const submitSearch = useCallback(async () => {
    setSubmitted(true);
    if (!selectedLedger) {
      toast.info("Please select a Ledger.", "Validation Error");
      return;
    }
    if (!selectedRange) {
      toast.info("Please select a Date Range.", "Validation Error");
      return;
    }

    setLoading(true);
    try {
      const filters = getFilters();
      const data = await reportApi.reportTOD(filters);
      if (data && data.length > 0) {
        setLst(data);
      } else {
        setLst([]);
        toast.info("No data found", "Info");
      }
    } catch (err: any) {
      setLst([]);
      toast.info(err?.message || "Failed to load report", "Error");
    } finally {
      setLoading(false);
    }
  }, [selectedLedger, selectedRange, dateRanges]);

  const handleExport = async () => {
    if (!selectedLedger) {
      toast.info("Please select a Ledger.", "Validation Error");
      return;
    }
    if (!selectedRange) {
      toast.info("Please select a Date Range.", "Validation Error");
      return;
    }
    setExportLoading(true);
    try {
      const filters = getFilters();
      const blob = await reportApi.reportTODExport(filters);
      if (blob?.size) {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "ledger-targetReport.xlsx";
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
    if (!selectedLedger) {
      toast.info("Please select a Ledger.", "Validation Error");
      return;
    }
    if (!selectedRange) {
      toast.info("Please select a Date Range.", "Validation Error");
      return;
    }
    setPrintLoading(true);
    try {
      const printData = lst.length
        ? lst
        : await reportApi.reportTOD(getFilters());

      if (printData?.length) {
        const pdfMake = (await import("pdfmake/build/pdfmake")).default;
        const pdfFonts = (await import("pdfmake/build/vfs_fonts")).default;
        (pdfMake as any).vfs = pdfFonts?.pdfMake?.vfs || pdfFonts;

        const keys = Object.keys(printData[0]).filter((k) => k !== "ItemGroup");
        const headers = keys.map((k) => ({
          text: getColumnConfig(k).label,
          style: "tableHeader",
          alignment: getColumnConfig(k).align,
        }));

        const rows: any[][] = printData.map((row: any) =>
          keys.map((k) => {
            const config = getColumnConfig(k);
            const val = row[k];
            if (config.isAmount || config.isQty) {
              return H.formatNumber(val, precision);
            }
            if (config.isPercent) {
              return (Number(val) || 0).toFixed(2) + "%";
            }
            if (config.isUnderPercent === "Amt") {
              let under = 0;
              if (row.TargetAmt && row.AchievedAmt < 100) {
                under = 100 - row.AchievedAmt;
              }
              return under.toFixed(2) + "%";
            }
            if (config.isUnderPercent === "Qty") {
              let under = 0;
              if (row.TargetQty && row.AchievedQty < 100) {
                under = 100 - row.AchievedQty;
              }
              return under.toFixed(2) + "%";
            }
            return String(val ?? "");
          })
        );

        const totalsRow = keys.map((k, idx) => {
          if (idx === 0) return { text: "Total", bold: true, alignment: "left" };
          const config = getColumnConfig(k);
          if (config.isAmount || config.isQty) {
            const sum = printData.reduce((acc, r) => acc + (Number(r[k]) || 0), 0);
            return { text: H.formatNumber(sum, precision), bold: true, alignment: "right" };
          }
          return "";
        });
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
              text: "Ledger Target Report",
              style: "header",
              margin: [0, 0, 0, 10],
            },
            {
              text: `Party: ${selectedLedger.name}  |  Range: ${selectedRange}`,
              fontSize: 10,
              bold: true,
              margin: [0, 0, 0, 10],
            },
            {
              table: {
                headerRows: 1,
                widths: keys.map(() => "*"),
                body: [headers, ...rows],
              },
              layout: {
                hLineWidth: () => 0.5,
                vLineWidth: () => 0.5,
                hLineColor: () => "#e2e8f0",
                vLineColor: () => "#e2e8f0",
                paddingLeft: () => 4,
                paddingRight: () => 4,
                paddingTop: () => 3,
                paddingBottom: () => 3,
              },
            },
            {
              text: `Total Rows: ${printData.length}`,
              style: "footer",
              margin: [0, 10, 0, 0],
            },
          ],
          styles: {
            header: { fontSize: 12, bold: true, color: "#1e293b" },
            tableHeader: {
              fontSize: 7,
              bold: true,
              color: "#475569",
              fillColor: "#f1f5f9",
            },
            footer: { fontSize: 8, italics: true, color: "#64748b" },
          },
          defaultStyle: { fontSize: 7 },
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
    setSelectedLedger(null);
    setDateRanges([]);
    setSelectedRange("");
    setSubmitted(false);
  };

  // Bottom summary calculations
  const totalTargetAmt = lst.reduce((acc, r) => acc + (Number(r.TargetAmt) || 0), 0);
  const totalSalesAmt = lst.reduce((acc, r) => acc + (Number(r.SalesAmt) || 0), 0);
  const totalNetAmt = lst.reduce((acc, r) => acc + (Number(r.NetAmt) || 0), 0);

  const keys = lst.length > 0 ? Object.keys(lst[0]).filter((k) => k !== "ItemGroup") : [];

  return (
    <div className="font-sans text-slate-700 dark:text-slate-200 pt-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-violet-100 dark:bg-violet-900/30 p-2 rounded-lg text-violet-600 dark:text-violet-400">
            <Target size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Ledger Target Report</h1>
            <p className="text-xs text-slate-500 font-medium">
              View and analyze sales performance against set ledger targets.
            </p>
          </div>
        </div>

        {/* Dynamic breadcrumbs */}
        {selectedLedger && (
          <div className="flex flex-wrap gap-2 text-xs bg-slate-100 dark:bg-slate-800/40 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
            <span className="font-semibold text-slate-600 dark:text-slate-400">Ledger: {selectedLedger.name}</span>
            {selectedRange && (
              <>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <span className="font-semibold text-slate-600 dark:text-slate-400">Range: {selectedRange}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Filters Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
        <div className="flex flex-wrap items-end gap-3 w-full">
          {/* Select Ledger */}
          <div className="flex-1 min-w-[250px] md:max-w-[350px]">
            <AutocompleteInput
              label="Select Ledger"
              placeholder="Select Ledger"
              value={selectedLedger}
              options={ledgers}
              onChange={handleLedgerChange}
              templateType="ledger"
            />
            {submitted && !selectedLedger && (
              <span className="text-[10px] text-rose-500 font-bold block mt-1">
                This value is required.
              </span>
            )}
          </div>

          {/* Date Range Dropdown */}
          <div className="flex-1 min-w-[250px] md:max-w-[350px]">
            <div
              className="w-full px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg transition-all focus-within:border-yellow-500 focus-within:ring-2 focus-within:ring-yellow-500/20"
            >
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block select-none mb-0.5">
                Date Range <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedRange}
                onChange={(e) => setSelectedRange(e.target.value)}
                className="w-full bg-transparent border-0 p-0 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-0 cursor-pointer h-5"
              >
                <option value="" className="bg-white dark:bg-slate-800">-- select value --</option>
                {dateRanges.map((pt, idx) => (
                  <option key={idx} value={pt.Range} className="bg-white dark:bg-slate-800">
                    {pt.Range}
                  </option>
                ))}
              </select>
            </div>
            {submitted && !selectedRange && (
              <span className="text-[10px] text-rose-500 font-bold block mt-1">
                This value is required.
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pb-0.5 ml-auto sm:ml-0">
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
              disabled={printLoading || loading || !lst.length}
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
          <div className="overflow-auto custom-scrollbar max-h-[calc(100vh-320px)]">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="sticky top-0 z-10">
                <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  {keys.map((k, idx) => {
                    const config = getColumnConfig(k);
                    return (
                      <th
                        key={idx}
                        className={`px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider ${
                          config.align === "right" ? "text-right" : "text-left"
                        }`}
                      >
                        {config.label}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {lst.map((row, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    {keys.map((k, cIdx) => {
                      const config = getColumnConfig(k);
                      const val = row[k];

                      let displayVal = String(val ?? "-");
                      if (config.isAmount || config.isQty) {
                        displayVal = `₹${H.formatNumber(val, precision)}`;
                      } else if (config.isPercent) {
                        displayVal = `${(Number(val) || 0).toFixed(2)}%`;
                      } else if (config.isUnderPercent === "Amt") {
                        let under = 0;
                        if (row.TargetAmt && row.AchievedAmt < 100) {
                          under = 100 - row.AchievedAmt;
                        }
                        displayVal = `${under.toFixed(2)}%`;
                      } else if (config.isUnderPercent === "Qty") {
                        let under = 0;
                        if (row.TargetQty && row.AchievedQty < 100) {
                          under = 100 - row.AchievedQty;
                        }
                        displayVal = `${under.toFixed(2)}%`;
                      }

                      return (
                        <td
                          key={cIdx}
                          className={`px-4 py-3.5 text-xs font-semibold ${
                            config.align === "right"
                              ? "text-right font-mono text-slate-700 dark:text-slate-300"
                              : "text-left text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {displayVal}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sticky yellow summary bar */}
      {lst.length > 0 && (
        <div className="sticky bottom-0 z-10 bg-brand-yellow dark:bg-brand-yellow/10 rounded-xl border border-brand-yellow/20 dark:border-brand-yellow/5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] p-4 select-none mt-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <span className="text-xs font-bold text-slate-800 dark:text-brand-yellow/90 uppercase">
                Total Rows :{" "}
                <span className="text-slate-950 dark:text-brand-yellow font-extrabold">{lst.length}</span>
              </span>
            </div>

            <div className="flex items-center gap-8">
              <div className="text-right">
                <span className="text-[10px] text-slate-800/80 dark:text-brand-yellow/70 font-bold uppercase block">
                  Total Target Amt
                </span>
                <span className="text-base font-black text-slate-950 dark:text-brand-yellow font-mono">
                  ₹{H.formatNumber(totalTargetAmt, precision)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-800/80 dark:text-brand-yellow/70 font-bold uppercase block">
                  Total Sales Amt
                </span>
                <span className="text-base font-black text-slate-950 dark:text-brand-yellow font-mono">
                  ₹{H.formatNumber(totalSalesAmt, precision)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-800/80 dark:text-brand-yellow/70 font-bold uppercase block">
                  Total Net Amt
                </span>
                <span className="text-base font-black text-slate-950 dark:text-brand-yellow font-mono">
                  ₹{H.formatNumber(totalNetAmt, precision)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

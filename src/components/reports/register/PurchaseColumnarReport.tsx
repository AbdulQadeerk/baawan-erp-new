import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Search,
  RotateCcw,
  FileSpreadsheet,
  FileText,
  Printer,
  Eye,
  X,
  Loader2,
} from "lucide-react";
import { reportApi } from "../../../services/report.service";
import { toast } from "../../../lib/toast";
import * as H from "../outstanding/outstandingHelpers";
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
            o[displayField]?.toLowerCase().includes(search.toLowerCase()),
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
                  <div className="w-[32%] bg-[#fcf8e3] dark:bg-amber-950/40 px-3 py-2 text-slate-800 dark:text-amber-200 font-semibold truncate text-left" title={opt.name}>
                    {opt.name}
                  </div>
                  {/* Right part - blue background */}
                  <div className="w-[68%] bg-[#d9edf7] dark:bg-blue-950/40 px-3 py-2 flex items-center text-xs text-slate-700 dark:text-blue-200 font-semibold gap-2">
                    <div className="w-[22%] truncate text-left" title={opt.group}>{opt.group || ""}</div>
                    <div className="w-[24%] truncate text-left" title={opt.area}>{opt.area || "-"}</div>
                    <div className="w-[16%] truncate text-left" title={opt.city}>{opt.city || "-"}</div>
                    <div className="w-[20%] truncate text-left" title={opt.mobile || opt.phone_1 || opt.phone_2}>{opt.mobile || opt.phone_1 || opt.phone_2 || "-"}</div>
                    <div className="w-[18%] truncate text-left" title={opt.gstNo || opt.gstin}>{opt.gstNo || opt.gstin || "-"}</div>
                  </div>
                </div>
              ) : (
                <div className="px-3 py-2 w-full text-left">
                  {opt.name}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const PurchaseColumnarReport: React.FC = () => {
  const precision = H.getPrecision();

  const [fromDate, setFromDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
  );
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);

  const [ledgers, setLedgers] = useState<any[]>([]);
  const [selectedLedger, setSelectedLedger] = useState<any>(null);

  const [lst, setLst] = useState<any[]>([]);
  const [summaryLst, setSummaryLst] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  useEffect(() => {
    // Group 16 is Sundry Creditors
    const filtered = H.getFilteredLedgers([16]);
    setLedgers(filtered);
  }, []);

  const getLedgerSummary = (data: any[]) => {
    if (data.length === 0) return;
    const keys = Object.keys(data[0]);
    const distinctObjectKeys: any[] = [];
    const skipKeys = ['Date', 'InvoiceNo', 'PName', 'TypeName', 'Bill_No', 'GstNo', 'GrandTotal', 'SalesValue'];

    keys.forEach((key) => {
      const exist = skipKeys.find(x => x === key);
      if (!exist) {
        distinctObjectKeys.push({ ledger: key, amount: 0 });
      }
    });

    distinctObjectKeys.forEach((item) => {
      const total = data.reduce((acc, obj) => acc + (parseFloat(obj[item.ledger]) || 0), 0);
      item.amount = total;
    });

    setSummaryLst(distinctObjectKeys);
  };

  const formatDateForApi = (dateStr: string, time: string) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${m}/${d}/${y} ${time}`;
  };

  const submitReport = useCallback(async () => {
    if (new Date(fromDate) > new Date(toDate)) {
      toast.info("From Date cannot be greater than To Date", "Validation Error");
      return;
    }
    setLoading(true);
    try {
      const filters = {
        fromDate: formatDateForApi(fromDate, '00:00:00'),
        toDate: formatDateForApi(toDate, '23:59:59'),
        ledgerId: selectedLedger ? selectedLedger.id : null
      };
      const data = await reportApi.purchaseColumnarReport(filters);
      if (data && data.length > 0) {
        setLst(data);
        getLedgerSummary(data);
      } else {
        setLst([]);
        setSummaryLst([]);
        toast.info("No data found", "Info");
      }
    } catch (err: any) {
      setLst([]);
      setSummaryLst([]);
      toast.info(err?.message || "Error", "Error");
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, selectedLedger]);

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const filters = {
        fromDate: formatDateForApi(fromDate, '00:00:00'),
        toDate: formatDateForApi(toDate, '23:59:59'),
        ledgerId: selectedLedger ? selectedLedger.id : null
      };
      const blob = await reportApi.purchaseColumnarReportExport(filters);
      if (blob?.size) {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "purchase-columnar.xlsx";
        a.click();
        URL.revokeObjectURL(a.href);
      } else {
        toast.info("No data found to export.", "Info");
      }
    } catch {
    } finally {
      setExportLoading(false);
    }
  };

  const handlePrint = async () => {
    if (new Date(fromDate) > new Date(toDate)) {
      toast.info("From Date cannot be greater than To Date", "Validation Error");
      return;
    }
    setPrintLoading(true);
    try {
      const printData = lst.length
        ? lst
        : await reportApi.purchaseColumnarReport({
            fromDate: formatDateForApi(fromDate, '00:00:00'),
            toDate: formatDateForApi(toDate, '23:59:59'),
            ledgerId: selectedLedger ? selectedLedger.id : null
          });

      if (printData?.length) {
        const pdfMake = (await import("pdfmake/build/pdfmake")).default;
        const pdfFonts = (await import("pdfmake/build/vfs_fonts")).default;
        (pdfMake as any).vfs = (pdfFonts as any).pdfMake?.vfs || pdfFonts;

        const keys = Object.keys(printData[0]);
        const standardKeys = ['Date', 'Bill_No', 'PName', 'GstNo', 'TypeName', 'GrandTotal', 'SalesValue'];
        const dynamicKeys = keys.filter(k => !standardKeys.includes(k) && k !== 'InvoiceNo');
        const printOrderedKeys = [...standardKeys.filter(k => keys.includes(k)), ...dynamicKeys];

        const headers = printOrderedKeys.map((c) => ({
          text: getHeaderName(c),
          style: "tableHeader",
          alignment: isNumericKey(c) ? 'right' : 'left'
        }));

        const rows: any[][] = printData.map((row: any) =>
          printOrderedKeys.map((c) => {
            const val = row[c];
            if (c === 'Date') return H.formatDateShort(val);
            return isNumericKey(c) ? H.formatNumber(val, precision) : String(val ?? "");
          })
        );

        // Add totals row
        const totalsRow = printOrderedKeys.map((c) => {
          if (c === 'Date') return { text: "Total", bold: true };
          if (isNumericKey(c)) {
            const sum = printData.reduce((acc, row) => acc + (parseFloat(row[c]) || 0), 0);
            return { text: H.formatNumber(sum, precision), bold: true, alignment: 'right' };
          }
          return "";
        });
        rows.push(totalsRow);

        const now = new Date();
        const printedOn = `Printed on : ${now.toLocaleDateString("en-GB")} ${now.toLocaleTimeString("en-GB")}`;

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
              text: "Purchase Columnar Report",
              style: "header",
              margin: [0, 0, 0, 10],
            },
            {
              table: {
                headerRows: 1,
                widths: printOrderedKeys.map(() => "auto"),
                body: [headers, ...rows],
              },
              layout: {
                hLineWidth: () => 0.5,
                vLineWidth: () => 0.5,
                hLineColor: () => "#e2e8f0",
                vLineColor: () => "#e2e8f0",
                paddingLeft: () => 3,
                paddingRight: () => 3,
                paddingTop: () => 2,
                paddingBottom: () => 2,
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
              fontSize: 7,
              bold: true,
              color: "#475569",
              fillColor: "#f1f5f9",
            },
            footer: { fontSize: 9, italics: true, color: "#64748b" },
          },
          defaultStyle: { fontSize: 7 },
        };
        pdfMake.createPdf(docDef).open();
      } else {
        toast.info("No data found to print.", "Info");
      }
    } catch (e) {
      console.error("PDF generation error:", e);
    } finally {
      setPrintLoading(false);
    }
  };

  const handleClear = () => {
    setLst([]);
    setSummaryLst([]);
    setSelectedLedger(null);
    setFromDate(
      new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        .toISOString()
        .split("T")[0],
    );
    setToDate(new Date().toISOString().split("T")[0]);
  };

  const getHeaderName = (key: string) => {
    switch (key) {
      case 'Date': return 'Date';
      case 'PName': return 'Party Name';
      case 'TypeName': return 'Invoice Type';
      case 'Bill_No': return 'Doc No';
      case 'GstNo': return 'Gst No';
      case 'GrandTotal': return 'Grand Total';
      case 'SalesValue': return 'Value';
      default: return key;
    }
  };

  const isNumericKey = (key: string) => {
    const skip = ['Date', 'InvoiceNo', 'PName', 'TypeName', 'Bill_No', 'GstNo'];
    return !skip.includes(key);
  };

  // Re-order and select columns dynamically based on first item
  const allKeys = lst.length > 0 ? Object.keys(lst[0]) : [];
  const standardKeys = ['Date', 'Bill_No', 'PName', 'GstNo', 'TypeName', 'GrandTotal', 'SalesValue'];
  const dynamicKeys = allKeys.filter(k => !standardKeys.includes(k) && k !== 'InvoiceNo');
  const orderedKeys = [...standardKeys.filter(k => allKeys.includes(k)), ...dynamicKeys];

  // Footer Subtotals
  const totalRows = lst.length;
  const totalAmount = lst.reduce((sum, x) => sum + (parseFloat(x.GrandTotal) || 0), 0);
  const totalValue = lst.reduce((sum, x) => sum + (parseFloat(x.SalesValue) || 0), 0);

  return (
    <div className="font-sans text-slate-700 dark:text-slate-200">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400">
            <FileText size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Purchase Columnar</h1>
            <p className="text-xs text-slate-500 font-medium">Purchase columnar monthly summary and details.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleExport}
            disabled={exportLoading || loading || !lst.length}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-70"
          >
            {exportLoading ? <Loader2 size={18} className="animate-spin" /> : <FileSpreadsheet size={18} />}
            Excel
          </button>
          <button 
            onClick={handlePrint}
            disabled={printLoading || loading || !lst.length}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-70"
          >
            {printLoading ? <Loader2 size={18} className="animate-spin" /> : <Printer size={18} />}
            Print
          </button>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 mb-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-wrap items-end gap-4 flex-1">
            <div className="w-full sm:w-36 shrink-0 space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">From Date <span className="text-rose-500">*</span></label>
              <input
                type="date"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-36 shrink-0 space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">To Date <span className="text-rose-500">*</span></label>
              <input
                type="date"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <div className="flex-1 lg:max-w-[480px] min-w-[280px]">
              <AutocompleteInput
                label="Search Party"
                placeholder="Search Party"
                value={selectedLedger}
                options={ledgers}
                onChange={setSelectedLedger}
                templateType="ledger"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={submitReport} 
              disabled={loading} 
              title="Search" 
              className="w-10 h-10 flex items-center justify-center bg-[#2D9E75] text-white rounded-lg hover:opacity-90 transition-all shadow-sm cursor-pointer disabled:opacity-70 animate-none"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            </button>
            <button 
              onClick={handleClear} 
              title="Reset Filters" 
              className="w-10 h-10 flex items-center justify-center bg-lime-500 text-white rounded-lg hover:opacity-90 transition-all shadow-sm cursor-pointer"
            >
              <RotateCcw size={16} />
            </button>
            {summaryLst.length > 0 && (
              <button 
                onClick={() => setShowSummaryModal(true)}
                title="Show Summary" 
                className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:opacity-90 transition-all shadow-sm cursor-pointer"
              >
                <Eye size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table Data */}
      {lst.length > 0 && (
        <div className="mt-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-auto custom-scrollbar max-h-[calc(100vh-320px)]">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                    {orderedKeys.map((key) => (
                      <th 
                        key={key} 
                        className={`px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider ${isNumericKey(key) ? 'text-right' : ''}`}
                      >
                        {getHeaderName(key)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {lst.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group">
                      {orderedKeys.map((key) => {
                        const val = row[key];
                        return (
                          <td 
                            key={key} 
                            className={`px-4 py-2 text-xs ${
                              isNumericKey(key) 
                                ? 'text-right font-mono font-bold text-slate-700 dark:text-slate-300' 
                                : key === 'Bill_No'
                                  ? 'font-bold text-blue-600 dark:text-blue-400'
                                  : key === 'PName'
                                    ? 'font-bold text-slate-700 dark:text-slate-200'
                                    : 'text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {key === 'Date' 
                              ? H.formatDateShort(val) 
                              : isNumericKey(key)
                                ? H.formatNumber(val, precision)
                                : val ?? '-'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Summary Footer Bar */}
      {lst.length > 0 && (
        <footer className="sticky bottom-0 z-50 bg-brand-yellow dark:bg-brand-yellow/10 px-6 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.15)] border-t border-brand-yellow/20 dark:border-brand-yellow/5 flex flex-wrap justify-center gap-8 md:gap-16 items-center -mx-6 mt-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-800/80 dark:text-brand-yellow/70 uppercase tracking-tighter">Total Rows</span>
            <span className="text-xl font-extrabold text-slate-950 dark:text-brand-yellow tabular-nums">
              {totalRows}
            </span>
          </div>
          <div className="h-8 w-px bg-slate-900/15 dark:bg-brand-yellow/20 hidden sm:block"></div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-800/80 dark:text-brand-yellow/70 uppercase tracking-tighter">Total Amount</span>
            <span className="text-xl font-extrabold text-slate-950 dark:text-brand-yellow tabular-nums">
              ₹ {H.formatNumber(totalAmount, precision)}
            </span>
          </div>
          <div className="h-8 w-px bg-slate-900/15 dark:bg-brand-yellow/20 hidden sm:block"></div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-800/80 dark:text-brand-yellow/70 uppercase tracking-tighter">Total Value</span>
            <span className="text-xl font-extrabold text-slate-950 dark:text-brand-yellow tabular-nums">
              ₹ {H.formatNumber(totalValue, precision)}
            </span>
          </div>
        </footer>
      )}

      {/* Summary Data Modal */}
      {showSummaryModal && summaryLst.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh] mx-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Summary Data</h3>
              <button 
                onClick={() => setShowSummaryModal(false)} 
                className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-grow">
              <div className="overflow-hidden border border-slate-200 dark:border-slate-700 rounded-lg">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-4 py-2 font-bold text-slate-600 dark:text-slate-400">Ledger</th>
                      <th className="px-4 py-2 font-bold text-slate-600 dark:text-slate-400 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {summaryLst.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-2 text-slate-800 dark:text-slate-200 font-medium">{row.ledger}</td>
                        <td className="px-4 py-2 text-slate-800 dark:text-slate-200 text-right font-mono font-bold">{H.formatNumber(row.amount, precision)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end bg-slate-50/50 dark:bg-slate-900/50">
              <button 
                onClick={() => setShowSummaryModal(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-colors text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

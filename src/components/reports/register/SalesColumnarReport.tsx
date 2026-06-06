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
  BarChart3,
  AlertCircle,
  CheckCircle2
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
        className={`w-full px-3 py-1 bg-white dark:bg-slate-900 border rounded-lg transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 ${
          open
            ? "border-blue-500 ring-2 ring-blue-500/20"
            : "border-slate-200 dark:border-slate-700"
        }`}
      >
        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block select-none mb-0.5 uppercase tracking-wider">
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

export const SalesColumnarReport: React.FC = () => {
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
    // Group 17 is Sundry Debtors
    const filtered = H.getFilteredLedgers([17]);
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
      const total = data.reduce((acc, obj) => {
        const val = parseFloat(obj[item.ledger]) || 0;
        if (obj['TypeName'] === 'Sales Return') {
          return acc - val;
        } else {
          return acc + val;
        }
      }, 0);
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
      const data = await reportApi.salesColumnarReport(filters);
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
      const blob = await reportApi.salesColumnarReportExport(filters);
      if (blob?.size) {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "sales-columnar.xlsx";
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
        : await reportApi.salesColumnarReport({
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

        // Add net totals row
        const totalsRow = printOrderedKeys.map((c) => {
          if (c === 'Date') return { text: "Total", bold: true };
          if (isNumericKey(c)) {
            const sum = printData.reduce((acc, row) => {
              const val = parseFloat(row[c]) || 0;
              if (row.TypeName === 'Sales Return') {
                return acc - val;
              }
              return acc + val;
            }, 0);
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
              text: "Sales Columnar Report",
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
  const totalInvoiceAmount = lst
    .filter((x) => x.TypeName === 'Sales Invoice')
    .reduce((sum, x) => sum + (parseFloat(x.GrandTotal) || 0), 0);

  const totalReturnAmount = lst
    .filter((x) => x.TypeName === 'Sales Return')
    .reduce((sum, x) => sum + (parseFloat(x.GrandTotal) || 0), 0);

  const totalInvoiceValue = lst
    .filter((x) => x.TypeName === 'Sales Invoice')
    .reduce((sum, x) => sum + (parseFloat(x.SalesValue) || 0), 0);

  const totalReturnValue = lst
    .filter((x) => x.TypeName === 'Sales Return')
    .reduce((sum, x) => sum + (parseFloat(x.SalesValue) || 0), 0);

  const netSalesAmount = totalInvoiceAmount - totalReturnAmount;
  const targetAmount = netSalesAmount > 0 ? Math.ceil((netSalesAmount * 1.15) / 50000) * 50000 : 50000;
  const targetPct = targetAmount > 0 ? Math.round((netSalesAmount / targetAmount) * 100) : 0;
  const remainingGoal = Math.max(0, targetAmount - netSalesAmount);

  const monthlyDataMap = new Map();
  lst.forEach(row => {
    if(!row.Date) return;
    const d = new Date(row.Date);
    const monthYear = d.toLocaleString('default', { month: 'short' }); 
    const val = parseFloat(row.GrandTotal) || 0;
    const type = row.TypeName;
    const net = type === 'Sales Return' ? -val : val;
    monthlyDataMap.set(monthYear, (monthlyDataMap.get(monthYear) || 0) + net);
  });
  const monthlyTrend = Array.from(monthlyDataMap.entries()).map(([month, val]) => ({ month, val }));

  return (
    <div className="font-sans text-slate-700 dark:text-slate-200 pt-4 pb-20">
      {/* Left Column and Right Sidebar Wrapper */}
      <div className="flex gap-6 flex-col xl:flex-row pb-24">
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2.5 rounded-xl text-blue-600 dark:text-blue-400">
            <FileText size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Sales Columnar</h1>
            <p className="text-xs text-slate-500 font-medium">Sales columnar monthly summary and details.</p>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 mb-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-wrap items-end gap-4 flex-1">
            <div className="w-full sm:w-36 shrink-0">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">From Date <span className="text-rose-500">*</span></label>
              <input
                type="date"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-36 shrink-0">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">To Date <span className="text-rose-500">*</span></label>
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

          <div className="flex flex-wrap items-center space-x-2 ml-auto shrink-0 mt-4 xl:mt-0 gap-y-2">
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
            <button 
              onClick={handleExport}
              disabled={exportLoading || loading || !lst.length}
              title="Excel Export"
              className="w-10 h-10 flex items-center justify-center bg-emerald-600 text-white rounded-lg hover:opacity-90 transition-all shadow-sm cursor-pointer disabled:opacity-70"
            >
              {exportLoading ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
            </button>
            <button 
              onClick={handlePrint}
              disabled={printLoading || loading || !lst.length}
              title="Print"
              className="w-10 h-10 flex items-center justify-center bg-rose-500 text-white rounded-lg hover:opacity-90 transition-all shadow-sm cursor-pointer disabled:opacity-70"
            >
              {printLoading ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />}
            </button>
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

        </div> {/* End of Left Column */}

        {/* Right Sidebar (Performance Analytics) */}
        <div className="hidden xl:flex w-[320px] shrink-0 flex-col gap-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-[#ecc813]/20 text-yellow-700 dark:text-[#ecc813] rounded-lg">
              <BarChart3 size={20} />
            </div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Performance Analytics</h3>
          </div>

          {/* Target vs Achievement */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center w-full">Target vs Achievement</p>
            <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center shadow-sm">
              <div className="w-48 h-24 overflow-hidden relative rounded-t-full mb-2">
                <div 
                  className="absolute inset-0" 
                  style={{ 
                    background: `conic-gradient(from 270deg, #ecc813 0%, #ecc813 ${targetPct / 2}%, #e2e8f0 ${targetPct / 2}%, #e2e8f0 50%, transparent 50%)`
                  }}
                ></div>
                <div className="absolute top-4 left-4 right-4 bottom-0 bg-white dark:bg-slate-900 rounded-t-full flex flex-col items-center justify-end pb-1 shadow-inner">
                   <span className="text-3xl font-black text-slate-800 dark:text-slate-100 leading-none">{targetPct}%</span>
                </div>
              </div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider italic text-center">₹ {H.formatNumber(remainingGoal, precision)} Remaining to Goal</span>
            </div>
          </div>

          {/* Monthly Trend */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center w-full mt-2">Monthly Trend (₹)</p>
            <div className="h-40 w-full bg-white dark:bg-slate-900 rounded-xl flex items-end justify-around px-4 pb-2 pt-6 gap-2 border border-slate-200 dark:border-slate-800 shadow-sm">
              {monthlyTrend.length > 0 ? monthlyTrend.map((row, i) => {
                const maxVal = Math.max(...monthlyTrend.map(r => r.val));
                const heightPct = maxVal > 0 ? Math.max(8, Math.round((row.val / maxVal) * 100)) : 8;
                return (
                  <div key={i} className="flex-1 max-w-[40px] bg-[#ecc813]/40 hover:bg-[#ecc813] transition-all rounded-t-sm relative group cursor-pointer flex flex-col justify-end" style={{ height: `${heightPct}%` }}>
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10 shadow-lg font-medium">
                      ₹ {H.formatNumber(row.val, precision)}
                    </div>
                    <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{row.month}</span>
                  </div>
                );
              }) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 font-medium">No trend data available</div>
              )}
            </div>
            <div className="h-2"></div>
          </div>

          {/* Collection Alerts */}
          <div className="space-y-3 mt-auto">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Collection Alerts</p>
            
            {/* Alert 1 */}
            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-900/30 flex gap-3 shadow-sm">
              <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">Payment Pending</h4>
                <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed">Multiple high-value invoices are approaching due dates.</p>
              </div>
            </div>

            {/* Alert 2 */}
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-200 dark:border-emerald-900/30 flex gap-3 shadow-sm">
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">Target Bonus Unlocked</h4>
                <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed">You achieved over 80% monthly milestone.</p>
              </div>
            </div>
          </div>
        </div>
      </div> {/* End of Flex wrapper */}

      {/* Summary Footer Bar */}
      {lst.length > 0 && (
        <div className="sticky bottom-0 mt-auto z-40 bg-brand-yellow dark:bg-brand-yellow/10 px-6 py-4 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] backdrop-blur-md border-t border-brand-yellow/20 dark:border-brand-yellow/5 flex flex-wrap justify-between items-center select-none mx-1 xl:mx-0 rounded-t-xl">
          <div className="flex flex-wrap items-center gap-8 md:gap-16">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-800/80 dark:text-brand-yellow/70 uppercase tracking-tighter">Total Invoice Amount</span>
              <span className="text-xl font-extrabold text-slate-950 dark:text-brand-yellow tabular-nums">
                ₹ {H.formatNumber(totalInvoiceAmount, precision)}
              </span>
            </div>
            <div className="h-8 w-px bg-slate-900/15 dark:bg-brand-yellow/20 hidden sm:block"></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-800/80 dark:text-brand-yellow/70 uppercase tracking-tighter">Total Return Amount</span>
              <span className="text-xl font-extrabold text-slate-950 dark:text-brand-yellow tabular-nums">
                ₹ {H.formatNumber(totalReturnAmount, precision)}
              </span>
            </div>
            <div className="h-8 w-px bg-slate-900/15 dark:bg-brand-yellow/20 hidden sm:block"></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-800/80 dark:text-brand-yellow/70 uppercase tracking-tighter">Total Invoice Value</span>
              <span className="text-xl font-extrabold text-slate-950 dark:text-brand-yellow tabular-nums">
                ₹ {H.formatNumber(totalInvoiceValue, precision)}
              </span>
            </div>
            <div className="h-8 w-px bg-slate-900/15 dark:bg-brand-yellow/20 hidden sm:block"></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-800/80 dark:text-brand-yellow/70 uppercase tracking-tighter">Total Return Value</span>
              <span className="text-xl font-extrabold text-slate-950 dark:text-brand-yellow tabular-nums">
                ₹ {H.formatNumber(totalReturnValue, precision)}
              </span>
            </div>
          </div>
        </div>
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

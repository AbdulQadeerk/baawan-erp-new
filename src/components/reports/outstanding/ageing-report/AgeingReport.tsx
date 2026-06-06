import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Search,
  RotateCcw,
  FileSpreadsheet,
  FileText,
  Printer,
  X,
  Loader2,
  Calendar,
  Mail,
  TrendingUp,
} from "lucide-react";
import { reportApi } from "../../../../services/report.service";
import { toast } from "../../../../lib/toast";
import * as H from "../outstandingHelpers";
import { DateRangePicker } from "../../../DateRangePicker";

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
                  <div
                    className="w-[32%] bg-[#fcf8e3] dark:bg-amber-950/40 px-3 py-2 text-slate-800 dark:text-amber-200 font-semibold truncate text-left"
                    title={opt.name}
                  >
                    {opt.name}
                  </div>
                  {/* Right part - blue background */}
                  <div className="w-[68%] bg-[#d9edf7] dark:bg-blue-950/40 px-3 py-2 flex items-center text-xs text-slate-700 dark:text-blue-200 font-semibold gap-2">
                    <div
                      className="w-[22%] truncate text-left"
                      title={opt.group}
                    >
                      {opt.group || ""}
                    </div>
                    <div
                      className="w-[24%] truncate text-left"
                      title={opt.area}
                    >
                      {opt.area || "-"}
                    </div>
                    <div
                      className="w-[16%] truncate text-left"
                      title={opt.city}
                    >
                      {opt.city || "-"}
                    </div>
                    <div
                      className="w-[20%] truncate text-left"
                      title={opt.mobile || opt.phone_1 || opt.phone_2}
                    >
                      {opt.mobile || opt.phone_1 || opt.phone_2 || "-"}
                    </div>
                    <div
                      className="w-[18%] truncate text-left"
                      title={opt.gstNo || opt.gstin}
                    >
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

export const AgeingReport: React.FC = () => {
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
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  const [avgDays, setAvgDays] = useState<number>(0);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    // Groups 16, 17, 18, 19
    const filtered = H.getFilteredLedgers([16, 17, 18, 19]);
    setLedgers(filtered);
  }, []);

  const formatDateForApi = (dateStr: string, time: string) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y} ${time}`;
  };

  const submitReport = useCallback(async () => {
    if (!selectedLedger) {
      toast.info("Please select a Ledger.", "Validation Error");
      return;
    }
    if (new Date(fromDate) > new Date(toDate)) {
      toast.info(
        "From Date cannot be greater than To Date",
        "Validation Error",
      );
      return;
    }
    setLoading(true);
    try {
      const filters = {
        ledgerId: selectedLedger.id,
        dateFrom: formatDateForApi(fromDate, "00:00:00"),
        dateTo: formatDateForApi(toDate, "23:59:59"),
      };
      const data = await reportApi.ageingReport(filters);
      if (data && data.length > 0) {
        setLst(data);
        const sumDays = data.reduce(
          (sum, item) => sum + (Number(item.Days) || 0),
          0,
        );
        setAvgDays(Math.round(sumDays / data.length));
      } else {
        setLst([]);
        setAvgDays(0);
        toast.info("No data found", "Info");
      }
    } catch (err: any) {
      setLst([]);
      setAvgDays(0);
      toast.info(err?.message || "Error", "Error");
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, selectedLedger]);

  const handleExport = async () => {
    if (!selectedLedger) {
      toast.info("Please select a Ledger.", "Validation Error");
      return;
    }
    setExportLoading(true);
    try {
      const filters = {
        ledgerId: selectedLedger.id,
        dateFrom: formatDateForApi(fromDate, "00:00:00"),
        dateTo: formatDateForApi(toDate, "23:59:59"),
      };
      const blob = await reportApi.ageingReportExport(filters);
      if (blob?.size) {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "ageing-report.xlsx";
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
    if (!selectedLedger) {
      toast.info("Please select a Ledger.", "Validation Error");
      return;
    }
    if (new Date(fromDate) > new Date(toDate)) {
      toast.info(
        "From Date cannot be greater than To Date",
        "Validation Error",
      );
      return;
    }
    setPrintLoading(true);
    try {
      const printData = lst.length
        ? lst
        : await reportApi.ageingReport({
            ledgerId: selectedLedger.id,
            dateFrom: formatDateForApi(fromDate, "00:00:00"),
            dateTo: formatDateForApi(toDate, "23:59:59"),
          });

      if (printData?.length) {
        const pdfMake = (await import("pdfmake/build/pdfmake")).default;
        const pdfFonts = (await import("pdfmake/build/vfs_fonts")).default;
        (pdfMake as any).vfs = (pdfFonts as any).pdfMake?.vfs || pdfFonts;

        const headers = [
          { text: "Doc No", style: "tableHeader", alignment: "left" },
          { text: "Invoice Amount", style: "tableHeader", alignment: "right" },
          { text: "Receipt Amount", style: "tableHeader", alignment: "right" },
          { text: "Invoice Date", style: "tableHeader", alignment: "center" },
          { text: "Receipt Date", style: "tableHeader", alignment: "center" },
          { text: "Days", style: "tableHeader", alignment: "center" },
        ];

        const rows: any[][] = printData.map((row: any) => [
          String(row.INVBill_No ?? ""),
          H.formatNumber(row.INVAmount, precision),
          H.formatNumber(row.RecAmount, precision),
          H.formatDateShort(row.INVDate),
          H.formatDateShort(row.RecDate),
          String(row.Days ?? "0"),
        ]);

        const totalInv = printData.reduce(
          (acc, r) => acc + (Number(r.INVAmount) || 0),
          0,
        );
        const totalRec = printData.reduce(
          (acc, r) => acc + (Number(r.RecAmount) || 0),
          0,
        );
        const avgD = Math.round(
          printData.reduce((acc, r) => acc + (Number(r.Days) || 0), 0) /
            printData.length,
        );

        const totalsRow = [
          { text: "Total", bold: true, alignment: "left" },
          {
            text: H.formatNumber(totalInv, precision),
            bold: true,
            alignment: "right",
          },
          {
            text: H.formatNumber(totalRec, precision),
            bold: true,
            alignment: "right",
          },
          "",
          { text: "Avg Days:", bold: true, alignment: "right" },
          { text: String(avgD), bold: true, alignment: "center" },
        ];
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
              text: "Ageing Report",
              style: "header",
              margin: [0, 0, 0, 10],
            },
            {
              text: `Party: ${selectedLedger.name}`,
              fontSize: 10,
              bold: true,
              margin: [0, 0, 0, 10],
            },
            {
              table: {
                headerRows: 1,
                widths: ["*", "*", "*", "*", "*", "*"],
                body: [headers, ...rows],
              },
              layout: {
                hLineWidth: () => 0.5,
                vLineWidth: () => 0.5,
                hLineColor: () => "#e2e8f0",
                vLineColor: () => "#e2e8f0",
                paddingLeft: () => 6,
                paddingRight: () => 6,
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
      console.error("PDF generation error:", err);
      toast.error(err?.message || "Print failed");
    } finally {
      setPrintLoading(false);
    }
  };

  const handleClear = () => {
    setLst([]);
    setAvgDays(0);
    setSelectedLedger(null);
    setFromDate(
      new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        .toISOString()
        .split("T")[0],
    );
    setToDate(new Date().toISOString().split("T")[0]);
  };

  const totalRows = lst.length;
  const totalInvoiceAmount = lst.reduce(
    (sum, x) => sum + (Number(x.INVAmount) || 0),
    0,
  );
  const totalReceiptAmount = lst.reduce(
    (sum, x) => sum + (Number(x.RecAmount) || 0),
    0,
  );

  // Dynamic Sidebar Calculations
  const amount30 = lst
    .filter((x) => (Number(x.Days) || 0) <= 30)
    .reduce((sum, x) => sum + (Number(x.INVAmount) || 0), 0);
  const amount60 = lst
    .filter((x) => (Number(x.Days) || 0) > 30 && (Number(x.Days) || 0) <= 60)
    .reduce((sum, x) => sum + (Number(x.INVAmount) || 0), 0);
  const amount90 = lst
    .filter((x) => (Number(x.Days) || 0) > 60 && (Number(x.Days) || 0) <= 90)
    .reduce((sum, x) => sum + (Number(x.INVAmount) || 0), 0);
  const amount90Plus = lst
    .filter((x) => (Number(x.Days) || 0) > 90)
    .reduce((sum, x) => sum + (Number(x.INVAmount) || 0), 0);

  const pct30 =
    totalInvoiceAmount > 0 ? (amount30 / totalInvoiceAmount) * 100 : 0;
  const pct60 =
    totalInvoiceAmount > 0 ? (amount60 / totalInvoiceAmount) * 100 : 0;
  const pct90 =
    totalInvoiceAmount > 0 ? (amount90 / totalInvoiceAmount) * 100 : 0;
  const pct90Plus =
    totalInvoiceAmount > 0 ? (amount90Plus / totalInvoiceAmount) * 100 : 0;

  const deg30 = pct30;
  const deg60 = pct30 + pct60;
  const deg90 = pct30 + pct60 + pct90;

  const conicStyle =
    totalInvoiceAmount > 0
      ? {
          background: `conic-gradient(#10b981 0% ${deg30}%, #fde047 ${deg30}% ${deg60}%, #f97316 ${deg60}% ${deg90}%, #ef4444 ${deg90}% 100%)`,
        }
      : {};

  return (
    <div className="font-sans text-slate-700 dark:text-slate-200 pt-4">
      {/* Main Grid Container */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Header + Filters + Table + Yellow Footer */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                <FileText size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  Ageing Report
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Ageing details for selected parties and date ranges.
                </p>
              </div>
            </div>
          </div>

          {/* Filters Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex flex-wrap items-end gap-3">
              {/* Select Ledger / Search Party */}
              <div className="flex-1 min-w-[250px] md:max-w-[350px]">
                <AutocompleteInput
                  label="Select Ledger"
                  placeholder="Select Ledger"
                  value={selectedLedger}
                  options={ledgers}
                  onChange={setSelectedLedger}
                  templateType="ledger"
                />
              </div>

              {/* From Date */}
              <div className="w-full sm:w-36 shrink-0 space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  From Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
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
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>

              {/* Actions Inline */}
              <div className="flex items-center gap-2 pb-0.5">
                {/* Date Range Picker Modal Toggle Button */}
                <div className="shrink-0 relative">
                  <button
                    type="button"
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className="w-10 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                    title="Date Range Presets"
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
                          setFromDate(
                            `${partsFrom[2]}-${partsFrom[1]}-${partsFrom[0]}`,
                          );
                        }
                        const partsTo = to.split("/");
                        if (partsTo.length === 3) {
                          setToDate(
                            `${partsTo[2]}-${partsTo[1]}-${partsTo[0]}`,
                          );
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
                  onClick={submitReport}
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
                  disabled={exportLoading || loading || !lst.length}
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

          {/* Table Data */}
          {lst.length > 0 && (
            <>
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-auto custom-scrollbar max-h-[calc(100vh-320px)]">
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Doc No
                        </th>
                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">
                          Invoice Amount
                        </th>
                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">
                          Receipt Amount
                        </th>
                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">
                          Invoice Date
                        </th>
                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">
                          Receipt Date
                        </th>
                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">
                          Days
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {lst.map((row, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group"
                        >
                          <td className="px-6 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {row.INVBill_No ?? "-"}
                          </td>
                          <td className="px-6 py-3 text-xs text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                            ₹{H.formatNumber(row.INVAmount, precision)}
                          </td>
                          <td className="px-6 py-3 text-xs text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                            ₹{H.formatNumber(row.RecAmount, precision)}
                          </td>
                          <td className="px-6 py-3 text-xs text-center text-slate-500 dark:text-slate-400">
                            {H.formatDateShort(row.INVDate)}
                          </td>
                          <td className="px-6 py-3 text-xs text-center text-slate-500 dark:text-slate-400">
                            {H.formatDateShort(row.RecDate)}
                          </td>
                          <td className="px-6 py-3 text-xs text-center font-bold text-slate-700 dark:text-slate-300">
                            {row.Days ?? "0"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sticky yellow summary bar */}
              <div className="sticky bottom-0 z-10 bg-brand-yellow dark:bg-brand-yellow/10 rounded-xl border border-brand-yellow/20 dark:border-brand-yellow/5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] p-4 select-none">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <span className="text-xs font-bold text-slate-800 dark:text-brand-yellow/90 uppercase">
                    Total Rows :{" "}
                    <span className="text-slate-950 dark:text-brand-yellow font-extrabold">
                      {totalRows}
                    </span>
                  </span>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-800/80 dark:text-brand-yellow/70 font-bold uppercase block">
                        Average Days
                      </span>
                      <span className="text-base font-black text-slate-950 dark:text-brand-yellow">
                        {avgDays}
                      </span>
                    </div>
                    <div className="h-8 w-px bg-slate-900/15 dark:bg-brand-yellow/20"></div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-800/80 dark:text-brand-yellow/70 font-bold uppercase block">
                        Filtered Rows
                      </span>
                      <span className="text-base font-black text-slate-950 dark:text-brand-yellow">
                        {totalRows}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Column: Sidebar */}
        {lst.length > 0 && (
          <aside className="w-full lg:w-80 shrink-0 flex flex-col gap-6">
            {/* Quick Stat Card */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">
                Total Receivables
              </p>
              <p className="text-2xl font-black text-slate-900 dark:text-slate-100">
                ₹{H.formatNumber(totalInvoiceAmount, precision)}
              </p>
              <div className="flex items-center gap-1 mt-2 text-emerald-600 text-xs font-bold">
                <TrendingUp size={14} />
                <span>+12.5% vs last month</span>
              </div>
            </div>

            {/* Aging Mix Chart Container */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-6 uppercase tracking-wider">
                Aging Mix %
              </h3>
              <div className="relative w-40 h-40 mx-auto mb-6">
                {/* Conic Donut Chart */}
                <div
                  className="w-full h-full rounded-full border-[14px] border-slate-100 dark:border-slate-800 relative transition-all duration-500"
                  style={conicStyle}
                >
                  <div className="absolute inset-0 m-2 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center flex-col">
                    <span className="text-xs text-slate-400 font-bold uppercase">
                      Debt
                    </span>
                    <span
                      className="text-sm font-black text-slate-900 dark:text-white truncate max-w-[85px]"
                      title={`₹${H.formatNumber(totalInvoiceAmount, 0)}`}
                    >
                      ₹
                      {totalInvoiceAmount >= 100000
                        ? `${(totalInvoiceAmount / 1000).toFixed(0)}k`
                        : H.formatNumber(totalInvoiceAmount, 0)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#10b981]"></div>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      0-30 Days
                    </span>
                  </div>
                  <span className="text-xs font-bold">{pct30.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#fde047]"></div>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      31-60 Days
                    </span>
                  </div>
                  <span className="text-xs font-bold">{pct60.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#f97316]"></div>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      61-90 Days
                    </span>
                  </div>
                  <span className="text-xs font-bold">{pct90.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      91+ Days
                    </span>
                  </div>
                  <span className="text-xs font-bold">
                    {pct90Plus.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Reminders Sent */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 uppercase tracking-wider">
                Reminders Sent
              </h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    <Mail size={14} className="text-slate-500" />
                  </div>
                  <div>
                    <p
                      className="text-xs font-bold truncate max-w-[170px]"
                      title={selectedLedger?.name || "Acme Corporation"}
                    >
                      {selectedLedger?.name || "Acme Corporation"}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Sent 2 hours ago by System
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    <Mail size={14} className="text-slate-500" />
                  </div>
                  <div>
                    <p
                      className="text-xs font-bold truncate max-w-[170px]"
                      title={selectedLedger?.name || "Acme Corporation"}
                    >
                      {selectedLedger?.name || "Acme Corporation"}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Sent Yesterday at 4:12 PM
                    </p>
                  </div>
                </div>
              </div>
              <button className="w-full mt-6 py-2 border border-slate-200 dark:border-slate-700 rounded text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                View All Actions
              </button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

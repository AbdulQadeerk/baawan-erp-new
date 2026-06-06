import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  RotateCcw,
  FileSpreadsheet,
  Printer,
  Loader2,
  Calendar,
  ShieldCheck,
} from "lucide-react";
import { reportApi } from "../../../services/report.service";
import { toast } from "../../../lib/toast";
import { DateRangePicker } from "../../DateRangePicker";
import * as H from "../outstanding/outstandingHelpers";
import * as XLSX from "xlsx";

const GSTR2_REPORT_OPTIONS = [
  { text: "B2B", id: 1, type: 3 },
  { text: "GSTR2 B2NS", id: 2, type: 3 },
  { text: "GST-HSN", id: 3, type: 3 },
  { text: "CDNR", id: 4, type: 4 },
  { text: "GST-HSN-RETURN", id: 5, type: 4 },
];

const COLUMN_LABELS: Record<string, string> = {
  GstNo: "Customer GSTIN",
  Bill_No: "Doc No.",
  FromBill: "From",
  ToBill: "To",
  Inv_Type: "Doc Type",
  CompanyGSTNo: "Business GSTIN",
  TaxPeriod: "Tax Period",
  State: "POS",
  Date: "Doc Date",
  InvoiceAmount: "Invoice Amount",
  TaxableValue: "Taxable Value",
  Rate: "Rate",
  IGST: "IGST",
  SGST: "SGST",
  CGST: "CGST",
  HsnNo: "HSN Code",
  ItemDescription: "HSN Description",
  ItemName: "Item Name",
  Conv_Unit: "UQC",
  Conv_Qty: "Qty",
  PartyName: "Party Name",
};

const STATE_CODE_MAP: Record<string, string> = {
  "1": "JammuKashmir (1)",
  "2": "Himachal Pradesh (2)",
  "3": "Punjab (3)",
  "4": "Chandigarh (4)",
  "5": "Uttarakhand (5)",
  "6": "Haryana (6)",
  "7": "Delhi (7)",
  "8": "Rajasthan (8)",
  "9": "UttarPradesh (9)",
  "10": "Bihar (10)",
  "11": "Sikkim (11)",
  "12": "Arunachal Pradesh (12)",
  "13": "Nagaland (13)",
  "14": "Manipur (14)",
  "15": "Mizoram (15)",
  "16": "Tripura (16)",
  "17": "Meghalaya (17)",
  "18": "Assam (18)",
  "19": "West Bengal (19)",
  "20": "Jharkhand (20)",
  "21": "Orissa (21)",
  "22": "Chhattisgarh (22)",
  "23": "Madhya Pradesh (23)",
  "24": "Gujarat (24)",
  "25": "Daman And Diu (25)",
  "26": "Dadra And Nagar Haveli (26)",
  "27": "Maharashtra (27)",
  "28": "Andhra Pradesh Old (28)",
  "29": "Karnataka (29)",
  "30": "Goa (30)",
  "31": "Lakshadweep (31)",
  "32": "Kerala (32)",
  "33": "TamilNadu (33)",
  "34": "Puducherry (34)",
  "35": "Andaman And Nicobar Islands (35)",
  "36": "Telengana (36)",
  "37": "Andra Pradesh New (37)",
};

export const Gstr2Report: React.FC = () => {
  const precision = H.getPrecision();

  const getFirstDayOfPrevMonth = () => {
    const d = new Date();
    const prev = new Date(d.getFullYear(), d.getMonth() - 1, 1);
    return prev.toISOString().split("T")[0];
  };

  const getLastDayOfPrevMonth = () => {
    const d = new Date();
    const prev = new Date(d.getFullYear(), d.getMonth(), 0);
    return prev.toISOString().split("T")[0];
  };

  const [fromDate, setFromDate] = useState<string>(getFirstDayOfPrevMonth());
  const [toDate, setToDate] = useState<string>(getLastDayOfPrevMonth());
  const [reportOption, setReportOption] = useState<number>(1);

  const [lst, setLst] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const formatDateForApi = (dateStr: string, time: string) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y} ${time}`;
  };

  const getFilters = () => {
    const matchedOpt = GSTR2_REPORT_OPTIONS.find((o) => o.id === Number(reportOption));
    return {
      dateFrom: formatDateForApi(fromDate, "00:00:00"),
      dateTo: formatDateForApi(toDate, "23:59:59"),
      resultType: 1,
      reportOption: Number(reportOption),
      reportType: matchedOpt ? matchedOpt.type : 3,
    };
  };

  const submitSearch = useCallback(async () => {
    if (new Date(fromDate) > new Date(toDate)) {
      toast.info("From Date cannot be greater than To Date.", "Validation Error");
      return;
    }

    setLoading(true);
    try {
      const data = await reportApi.gstrReport(getFilters());
      if (data && data.length > 0) {
        // Resolve columns from keys of the first row
        const keys = Object.keys(data[0]).filter(
          (k) => k !== "item_ID" && k !== "gstCategory"
        );
        setColumns(keys);
        setLst(data);
      } else {
        setLst([]);
        setColumns([]);
        toast.info("No data found.", "Info");
      }
    } catch (err: any) {
      setLst([]);
      setColumns([]);
      toast.info(err?.message || "Failed to load report", "Error");
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, reportOption]);

  // Submit search on mount
  useEffect(() => {
    submitSearch();
  }, []);

  const handleClear = () => {
    setLst([]);
    setColumns([]);
    setReportOption(1);
    setFromDate(getFirstDayOfPrevMonth());
    setToDate(getLastDayOfPrevMonth());
  };

  const formatTaxPeriod = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      return `${monthNames[d.getMonth()]}-${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  const formatState = (val: string) => {
    if (!val) return "";
    const mapped = STATE_CODE_MAP[val];
    return mapped ? `${val}-${mapped}` : val;
  };

  const formatDocDate = (val: string) => {
    if (!val) return "";
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return val;
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    } catch {
      return val;
    }
  };

  const formatCellValue = (key: string, val: any) => {
    if (val == null) return "";
    if (key === "Date") return formatDocDate(val);
    if (key === "TaxPeriod") return formatTaxPeriod(val);
    if (key === "State") return formatState(String(val));
    if (
      [
        "InvoiceAmount",
        "TaxableValue",
        "Rate",
        "IGST",
        "SGST",
        "CGST",
        "Conv_Qty",
      ].includes(key)
    ) {
      const num = parseFloat(val);
      return isNaN(num) ? val : H.formatNumber(num, precision);
    }
    return String(val);
  };

  const isNumericColumn = (key: string) => {
    return [
      "InvoiceAmount",
      "TaxableValue",
      "Rate",
      "IGST",
      "SGST",
      "CGST",
      "Conv_Qty",
    ].includes(key);
  };

  // Export to Excel using backend endpoint with local xlsx backup
  const handleExport = async () => {
    setExportLoading(true);
    try {
      const filtersData = { ...getFilters(), resultType: 2 };
      const blob = await reportApi.gstrReportExport(filtersData);
      if (blob && blob.size > 0) {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "gstr2Report.xlsx";
        a.click();
        URL.revokeObjectURL(a.href);
      } else {
        // Client-side backup if blob size is 0
        if (lst.length) {
          const wsData = [
            columns.map((c) => COLUMN_LABELS[c] || c),
            ...lst.map((row) =>
              columns.map((c) => formatCellValue(c, row[c]))
            ),
          ];
          const wb = XLSX.utils.book_new();
          const ws = XLSX.utils.aoa_to_sheet(wsData);
          XLSX.utils.book_append_sheet(wb, ws, "GSTR2");
          XLSX.writeFile(wb, "gstr2Report.xlsx");
        } else {
          toast.info("No data found to export.", "Info");
        }
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to export report.");
    } finally {
      setExportLoading(false);
    }
  };

  // Landscape PDF printing
  const handlePrint = async () => {
    setPrintLoading(true);
    try {
      const printData = lst.length ? lst : await reportApi.gstrReport(getFilters());
      if (printData?.length) {
        const pdfMake = (await import("pdfmake/build/pdfmake")).default;
        const pdfFonts = (await import("pdfmake/build/vfs_fonts")).default;
        (pdfMake as any).vfs = pdfFonts?.pdfMake?.vfs || pdfFonts;

        const headers = columns.map((c) => {
          const isNum = isNumericColumn(c);
          return {
            text: COLUMN_LABELS[c] || c,
            style: "tableHeader",
            alignment: isNum ? "right" : "left",
          };
        });

        const rows: any[][] = printData.map((row: any) =>
          columns.map((c) => {
            const val = row[c];
            const isNum = isNumericColumn(c);
            return {
              text: formatCellValue(c, val),
              alignment: isNum ? "right" : "left",
            };
          })
        );

        // Add summary row for totals
        const totalsRow = columns.map((c, idx) => {
          if (idx === 0) return { text: "Total", bold: true, alignment: "left" };
          if (["InvoiceAmount", "TaxableValue", "IGST", "SGST", "CGST", "Conv_Qty"].includes(c)) {
            const sum = printData.reduce((s: number, r: any) => s + (parseFloat(r[c]) || 0), 0);
            return { text: H.formatNumber(sum, precision), bold: true, alignment: "right" };
          }
          return "";
        });
        rows.push(totalsRow);

        const now = new Date();
        const printedOn = `Printed on: ${now.toLocaleDateString("en-GB")} ${now.toLocaleTimeString("en-GB")}`;
        const optionText = GSTR2_REPORT_OPTIONS.find((o) => o.id === Number(reportOption))?.text || "";

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
              text: `GSTR2 Report (${optionText})`,
              style: "header",
              margin: [0, 0, 0, 10],
            },
            {
              text: `Period: ${H.formatDisplayDate(fromDate)} to ${H.formatDisplayDate(toDate)}`,
              fontSize: 9,
              bold: true,
              margin: [0, 0, 0, 10],
            },
            {
              table: {
                headerRows: 1,
                widths: columns.map(() => "auto"),
                body: [headers, ...rows],
              },
              layout: {
                hLineWidth: () => 0.5,
                vLineWidth: () => 0.5,
                hLineColor: () => "#e2e8f0",
                vLineColor: () => "#e2e8f0",
                paddingLeft: () => 5,
                paddingRight: () => 5,
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
            header: { fontSize: 13, bold: true, color: "#1e293b" },
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

  return (
    <div className="font-sans text-slate-700 dark:text-slate-200 pt-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg text-orange-600 dark:text-orange-400">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">GSTR2 Report</h1>
            <p className="text-xs text-slate-500 font-medium">
              Tax returns summary and purchase breakdown reports.
            </p>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
        <div className="flex flex-wrap items-end gap-3">

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

          {/* Actions */}
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

      {/* Grid Table */}
      {lst.length > 0 && columns.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col mt-4">
          <div className="overflow-auto custom-scrollbar max-h-[calc(100vh-320px)]">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="sticky top-0 z-10">
                <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-[80px]">
                    Sr No
                  </th>
                  {columns.map((col) => (
                    <th
                      key={col}
                      className={`px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider ${
                        isNumericColumn(col) ? "text-right" : ""
                      }`}
                    >
                      {COLUMN_LABELS[col] || col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {lst.map((row, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    <td className="px-6 py-3.5 text-xs font-semibold text-slate-500">
                      {idx + 1}
                    </td>
                    {columns.map((col) => {
                      const val = row[col];
                      const isNum = isNumericColumn(col);
                      return (
                        <td
                          key={col}
                          className={`px-6 py-3.5 text-xs ${
                            isNum
                              ? "text-right font-mono font-bold text-slate-700 dark:text-slate-300"
                              : "text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          {isNum && val !== null ? "₹" : ""}
                          {formatCellValue(col, val)}
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

      {/* Sticky footer metrics bar */}
      {lst.length > 0 && (
        <div className="sticky bottom-0 z-10 bg-brand-yellow dark:bg-brand-yellow/10 rounded-xl border border-brand-yellow/20 dark:border-brand-yellow/5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] p-4 select-none mt-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs font-bold text-slate-800 dark:text-brand-yellow/90 uppercase">
              Total Rows :{" "}
              <span className="text-slate-950 dark:text-brand-yellow font-extrabold">{lst.length}</span>
            </span>
            <span className="text-xs font-bold text-slate-800 dark:text-brand-yellow/90 uppercase">
              Filtered Rows :{" "}
              <span className="text-slate-950 dark:text-brand-yellow font-extrabold">{lst.length}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

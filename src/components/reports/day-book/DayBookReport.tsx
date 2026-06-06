import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  RotateCcw,
  FileSpreadsheet,
  Printer,
  Loader2,
  Calendar,
  Eye,
  BookOpen,
} from "lucide-react";
import { reportApi } from "../../../services/report.service";
import { toast } from "../../../lib/toast";
import { DateRangePicker } from "../../DateRangePicker";
import * as H from "../outstanding/outstandingHelpers";
import { InvoiceDetailsModal } from "../InvoiceDetailsModal";
import { VoucherDetailsModal } from "../../../shared/VoucherDetailsModal";
import * as XLSX from "xlsx";

const VOUCHER_TYPES_FOR_DAY_BOOK = [
  { text: "All", id: "" },
  { text: "Sales", id: 1 },
  { text: "Credit Note", id: 3 },
  { text: "Purchase", id: 9 },
  { text: "Debit Note", id: 10 },
  { text: "Payment", id: 17 },
  { text: "Receipt", id: 18 },
  { text: "Journal", id: 19 },
  { text: "Contra", id: 20 },
];

export const DayBookReport: React.FC = () => {
  const precision = H.getPrecision();

  const [fromDate, setFromDate] = useState(new Date().toISOString().split("T")[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);
  const [voucherType, setVoucherType] = useState<string>("");

  const [lst, setLst] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Drilldown Modal states
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);
  const [selectedInvCode, setSelectedInvCode] = useState<number | string>("");
  const [selectedInvType, setSelectedInvType] = useState<number>(0);
  const [drilldownIndex, setDrilldownIndex] = useState(0);
  const [drilldownList, setDrilldownList] = useState<any[]>([]);

  const formatDateForApi = (dateStr: string, time: string) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y} ${time}`;
  };

  const getFilters = () => {
    return {
      fromDate: formatDateForApi(fromDate, "00:00:00"),
      toDate: formatDateForApi(toDate, "23:59:59"),
      voucher_Type: voucherType !== "" ? Number(voucherType) : null,
    };
  };

  const submitSearch = useCallback(async () => {
    if (new Date(fromDate) > new Date(toDate)) {
      toast.info("From Date cannot be greater than To Date.", "Validation Error");
      return;
    }

    setLoading(true);
    try {
      const data = await reportApi.dayBook(getFilters());
      if (data && data.length > 0) {
        setLst(data);
      } else {
        setLst([]);
        toast.info("No data found.", "Info");
      }
    } catch (err: any) {
      setLst([]);
      toast.info(err?.message || "Failed to load report", "Error");
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, voucherType]);

  // Submit on mount
  useEffect(() => {
    submitSearch();
  }, []);

  const handleClear = () => {
    setLst([]);
    setVoucherType("");
    setFromDate(new Date().toISOString().split("T")[0]);
    setToDate(new Date().toISOString().split("T")[0]);
  };

  const getDebitAmount = (entry: any): number | null => {
    return !entry.IsCredit && !entry.isCredit && !entry.iscredit ? Number(entry.GrandTotal) : null;
  };

  const getCreditAmount = (entry: any): number | null => {
    return entry.IsCredit || entry.isCredit || entry.iscredit ? Number(entry.GrandTotal) : null;
  };

  const getVoucherTypeName = (entry: any): string => {
    const isInvoice = entry.MadeFromInvoice;
    if (isInvoice) {
      if (entry.Inv_Type === 10) return "Purchase Return(Debit Note)";
      if (entry.Inv_Type === 3) return "Sale Return(Credit Note)";
    }
    const item = VOUCHER_TYPES_FOR_DAY_BOOK.find(v => v.id === entry.Inv_Type);
    return item ? item.text : `Voucher #${entry.Inv_Type}`;
  };

  const totalDebit = lst.reduce((acc, entry) => acc + (getDebitAmount(entry) || 0), 0);
  const totalCredit = lst.reduce((acc, entry) => acc + (getCreditAmount(entry) || 0), 0);

  const formatDisplayDate = (val: string) => {
    if (!val) return "";
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return val;
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      let hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;
      const hoursStr = String(hours).padStart(2, "0");
      return `${day}/${month}/${year} ${hoursStr}:${minutes} ${ampm}`;
    } catch {
      return val;
    }
  };

  // Open drilldown details modal
  const handleOpenDetails = (item: any) => {
    if (item.InvCode === -1) return;

    // Build invoiceList for modal navigation from matching data rows
    const listForModal = lst
      .map((x) => ({
        invCode: x.InvCode,
        id: x.InvCode,
        invType: x.Inv_Type,
        fromInvoice: [17, 18, 19, 20].includes(x.Inv_Type) ? false : (x.MadeFromInvoice !== undefined ? x.MadeFromInvoice : true),
        bill_No: x.Bill_No,
        partyName: x.PartyName || x.PName,
        date: x.Date,
        amount: x.GrandTotal,
      }))
      .filter((x) => x.invCode !== -1);

    const index = listForModal.findIndex((x) => x.invCode === item.InvCode);

    setSelectedInvCode(item.InvCode);
    setSelectedInvType(item.Inv_Type);
    setDrilldownIndex(index >= 0 ? index : 0);
    setDrilldownList(listForModal);

    const isVoucher = [17, 18, 19, 20].includes(item.Inv_Type) || !item.MadeFromInvoice;
    if (isVoucher) {
      setVoucherModalOpen(true);
    } else {
      setInvoiceModalOpen(true);
    }
  };

  // Export to Excel using xlsx library client-side
  const handleExport = async () => {
    setExportLoading(true);
    try {
      const exportData = lst.length ? lst : await reportApi.dayBook(getFilters());
      if (exportData?.length) {
        const wsData = [
          ["Sr No", "Doc No", "Date", "Particulars", "Voucher", "Debit Amount", "Credit Amount"],
          ...exportData.map((row: any, i: number) => {
            const deb = getDebitAmount(row);
            const cred = getCreditAmount(row);
            return [
              i + 1,
              row.Bill_No || "",
              formatDisplayDate(row.Date),
              row.PartyName || row.PName || "",
              getVoucherTypeName(row),
              deb !== null ? deb : "",
              cred !== null ? cred : "",
            ];
          }),
          [
            "Total",
            "",
            "",
            "",
            "",
            totalDebit,
            totalCredit,
          ],
        ];

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        
        // Auto width calculation for cols
        ws["!cols"] = [
          { wch: 8 },
          { wch: 20 },
          { wch: 22 },
          { wch: 35 },
          { wch: 20 },
          { wch: 16 },
          { wch: 16 },
        ];

        XLSX.utils.book_append_sheet(wb, ws, "Day Book");
        XLSX.writeFile(wb, "day-book.xlsx");
      } else {
        toast.info("No data found to export.", "Info");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to export report.");
    } finally {
      setExportLoading(false);
    }
  };

  // Print PDF using pdfMake client-side
  const handlePrint = async () => {
    setPrintLoading(true);
    try {
      const printData = lst.length ? lst : await reportApi.dayBook(getFilters());
      if (printData?.length) {
        const pdfMake = (await import("pdfmake/build/pdfmake")).default;
        const pdfFonts = (await import("pdfmake/build/vfs_fonts")).default;
        (pdfMake as any).vfs = pdfFonts?.pdfMake?.vfs || pdfFonts;

        const headers = [
          { text: "Sr No", style: "tableHeader", alignment: "left" },
          { text: "Doc No", style: "tableHeader", alignment: "left" },
          { text: "Date", style: "tableHeader", alignment: "left" },
          { text: "Particulars", style: "tableHeader", alignment: "left" },
          { text: "Voucher", style: "tableHeader", alignment: "left" },
          { text: "Debit Amount", style: "tableHeader", alignment: "right" },
          { text: "Credit Amount", style: "tableHeader", alignment: "right" },
        ];

        const rows: any[][] = printData.map((row: any, i: number) => {
          const deb = getDebitAmount(row);
          const cred = getCreditAmount(row);
          return [
            String(i + 1),
            String(row.Bill_No || ""),
            formatDisplayDate(row.Date),
            String(row.PartyName || row.PName || ""),
            getVoucherTypeName(row),
            deb !== null ? H.formatNumber(deb, precision) : "",
            cred !== null ? H.formatNumber(cred, precision) : "",
          ];
        });

        const totalsRow = [
          { text: "Total", bold: true, alignment: "left" },
          "",
          "",
          "",
          "",
          { text: H.formatNumber(totalDebit, precision), bold: true, alignment: "right" },
          { text: H.formatNumber(totalCredit, precision), bold: true, alignment: "right" },
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
              text: "Day Book Report",
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
                widths: ["auto", "auto", "auto", "*", "auto", "auto", "auto"],
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
          <div className="bg-rose-100 dark:bg-rose-900/30 p-2 rounded-lg text-rose-600 dark:text-rose-400">
            <BookOpen size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Day Book</h1>
            <p className="text-xs text-slate-500 font-medium">
              Daily summary of sales, purchases, receipts, payments, and journals.
            </p>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
        <div className="flex flex-wrap items-end gap-3">
          {/* Voucher Type */}
          <div className="w-full sm:w-48 shrink-0 space-y-1">
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Voucher Type
            </label>
            <select
              value={voucherType}
              onChange={(e) => setVoucherType(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer font-semibold"
            >
              {VOUCHER_TYPES_FOR_DAY_BOOK.map((item) => (
                <option key={item.id ?? "all"} value={item.id}>
                  {item.text}
                </option>
              ))}
            </select>
          </div>

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
      {lst.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col mt-4">
          <div className="overflow-auto custom-scrollbar max-h-[calc(100vh-320px)]">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="sticky top-0 z-10">
                <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-[80px]">
                    Sr No
                  </th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Doc No
                  </th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Particulars
                  </th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Voucher
                  </th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">
                    Debit Amount
                  </th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">
                    Credit Amount
                  </th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center w-[80px]">
                    Action
                  </th>
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
                    <td className="px-6 py-3.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                      {row.Bill_No || "—"}
                    </td>
                    <td className="px-6 py-3.5 text-xs text-slate-600 dark:text-slate-400">
                      {formatDisplayDate(row.Date)}
                    </td>
                    <td className="px-6 py-3.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                      {row.PartyName || row.PName || "—"}
                    </td>
                    <td className="px-6 py-3.5 text-xs text-slate-600 dark:text-slate-400">
                      {getVoucherTypeName(row)}
                    </td>
                    <td className="px-6 py-3.5 text-xs text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                      {getDebitAmount(row) !== null
                        ? `₹${H.formatNumber(getDebitAmount(row)!, precision)}`
                        : ""}
                    </td>
                    <td className="px-6 py-3.5 text-xs text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                      {getCreditAmount(row) !== null
                        ? `₹${H.formatNumber(getCreditAmount(row)!, precision)}`
                        : ""}
                    </td>
                    <td className="px-6 py-3.5 text-xs text-center">
                      {row.InvCode !== -1 && (
                        <button
                          onClick={() => handleOpenDetails(row)}
                          className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors inline-flex items-center justify-center cursor-pointer"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                      )}
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
        <div className="sticky bottom-0 z-10 bg-brand-yellow dark:bg-brand-yellow/10 rounded-xl border border-brand-yellow/20 dark:border-brand-yellow/5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] p-4 select-none mt-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs font-bold text-slate-800 dark:text-brand-yellow/90 uppercase">
              Total Rows :{" "}
              <span className="text-slate-950 dark:text-brand-yellow font-extrabold">{lst.length}</span>
            </span>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
              <div className="text-right">
                <span className="text-[10px] text-slate-800/80 dark:text-brand-yellow/70 font-bold uppercase block">
                  Total Debit
                </span>
                <span className="text-sm font-black text-slate-950 dark:text-brand-yellow">
                  ₹{H.formatNumber(totalDebit, precision)}
                </span>
              </div>
              <div className="h-8 w-px bg-slate-900/15 dark:bg-brand-yellow/20 hidden sm:block"></div>
              <div className="text-right">
                <span className="text-[10px] text-slate-800/80 dark:text-brand-yellow/70 font-bold uppercase block">
                  Total Credit
                </span>
                <span className="text-sm font-black text-slate-950 dark:text-brand-yellow">
                  ₹{H.formatNumber(totalCredit, precision)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modals */}
      {invoiceModalOpen && (
        <InvoiceDetailsModal
          isOpen={invoiceModalOpen}
          onClose={() => setInvoiceModalOpen(false)}
          invCode={selectedInvCode}
          invType={selectedInvType}
          invoiceList={drilldownList}
          currentIndex={drilldownIndex}
        />
      )}

      {voucherModalOpen && (
        <VoucherDetailsModal
          isOpen={voucherModalOpen}
          onClose={() => setVoucherModalOpen(false)}
          invCode={selectedInvCode}
          invType={selectedInvType}
          invoiceList={drilldownList}
          currentIndex={drilldownIndex}
        />
      )}
    </div>
  );
};

import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Search,
  RotateCcw,
  FileSpreadsheet,
  Printer,
  Calendar,
  Loader2,
  Landmark,
  FileText,
  Save,
  CheckCircle2,
} from "lucide-react";
import { reportApi } from "../../../services/report.service";
import { toast } from "../../../lib/toast";
import * as H from "../outstanding/outstandingHelpers";
import { DateRangePicker } from "../../DateRangePicker";

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
            o[displayField]?.toLowerCase().includes(search.toLowerCase())
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
              <RotateCcw size={14} className="stroke-[3]" />
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

const EnTransactionTypeObjId: Record<number, string> = {
  1: "Cheque",
  2: "Credit Card",
  3: "DD",
  4: "Cash",
  5: "Bank Transfer",
  6: "RTGS",
  7: "NEFT",
  8: "UPI",
};

export const BankReconciliationReport: React.FC = () => {
  const precision = H.getPrecision();

  const [fromDate, setFromDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0]
  );
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);

  const [ledgers, setLedgers] = useState<any[]>([]);
  const [selectedLedger, setSelectedLedger] = useState<any>(null);
  const [type, setType] = useState<number>(1); // 1 = All, 2 = Reconciled, 3 = Not Reconciled

  const [lst, setLst] = useState<any[]>([]);
  const [bankOpeningBal, setBankOpeningBal] = useState<number>(0);
  const [notRefDB, setNotRefDB] = useState<number>(0);
  const [notRefCR, setNotRefCR] = useState<number>(0);
  const [asPerBank, setAsPerBank] = useState<number>(0);

  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    // Groups [19, 20] are Bank and Bank OD groups
    const filtered = H.getFilteredLedgers([19, 20]);
    setLedgers(filtered);
  }, []);

  const formatDateForApi = (dateStr: string, time: string) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y} ${time}`;
  };

  const submitReport = useCallback(async () => {
    if (!selectedLedger) {
      toast.info("Please select a bank ledger.", "Validation Error");
      return;
    }
    if (new Date(fromDate) > new Date(toDate)) {
      toast.info("From Date cannot be greater than To Date", "Validation Error");
      return;
    }
    setLoading(true);
    try {
      const filters = {
        fromDate: formatDateForApi(fromDate, "00:00:00"),
        toDate: formatDateForApi(toDate, "23:59:59"),
        bank: selectedLedger.id,
        detailed: false,
        type: Number(type),
      };
      const res = await reportApi.bankReconcile(filters);
      if (res) {
        // Format API bankDate to YYYY-MM-DD for standard HTML input types
        const mappedInstruments = (res.instruments || []).map((item: any) => {
          let cleanBankDate = "";
          if (item.bankDate) {
            const dateObj = new Date(item.bankDate);
            if (!isNaN(dateObj.getTime())) {
              cleanBankDate = dateObj.toISOString().split("T")[0];
            }
          }
          return {
            ...item,
            bankDate: cleanBankDate,
            originalBankDate: cleanBankDate,
            isChange: false,
          };
        });
        setLst(mappedInstruments);
        setBankOpeningBal(res.bankOpeningBal || 0);
        setNotRefDB(res.notRefDB || 0);
        setNotRefCR(res.notRefCR || 0);
        setAsPerBank(res.asPerBank || 0);
      } else {
        setLst([]);
        setBankOpeningBal(0);
        setNotRefDB(0);
        setNotRefCR(0);
        setAsPerBank(0);
        toast.info("No records found", "Info");
      }
    } catch (err: any) {
      setLst([]);
      setBankOpeningBal(0);
      setNotRefDB(0);
      setNotRefCR(0);
      setAsPerBank(0);
      toast.info(err?.message || "Failed to load data", "Error");
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, selectedLedger, type]);

  const handleExport = async () => {
    if (!selectedLedger) {
      toast.info("Please select a bank ledger.", "Validation Error");
      return;
    }
    setExportLoading(true);
    try {
      const filters = {
        fromDate: formatDateForApi(fromDate, "00:00:00"),
        toDate: formatDateForApi(toDate, "23:59:59"),
        bank: selectedLedger.id,
        detailed: false,
        type: Number(type),
      };
      const blob = await reportApi.bankReconcileExport(filters);
      if (blob?.size) {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "bank-reconciliation.xlsx";
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
      toast.info("Please select a bank ledger.", "Validation Error");
      return;
    }
    setPrintLoading(true);
    try {
      const printData = lst.length
        ? {
            instruments: lst,
            bankOpeningBal,
            notRefDB,
            notRefCR,
            asPerBank,
          }
        : await reportApi.bankReconcile({
            fromDate: formatDateForApi(fromDate, "00:00:00"),
            toDate: formatDateForApi(toDate, "23:59:59"),
            bank: selectedLedger.id,
            detailed: false,
            type: Number(type),
          });

      if (printData?.instruments?.length) {
        const pdfMake = (await import("pdfmake/build/pdfmake")).default;
        const pdfFonts = (await import("pdfmake/build/vfs_fonts")).default;
        (pdfMake as any).vfs = pdfFonts?.pdfMake?.vfs || pdfFonts;

        const headers = [
          { text: "Date", style: "tableHeader", alignment: "left" },
          { text: "Party", style: "tableHeader", alignment: "left" },
          { text: "Type", style: "tableHeader", alignment: "left" },
          { text: "Txn No.", style: "tableHeader", alignment: "left" },
          { text: "Txn Type", style: "tableHeader", alignment: "left" },
          { text: "Txn Date", style: "tableHeader", alignment: "center" },
          { text: "Bank Date", style: "tableHeader", alignment: "center" },
          { text: "Debit", style: "tableHeader", alignment: "right" },
          { text: "Credit", style: "tableHeader", alignment: "right" },
        ];

        const rows: any[][] = printData.instruments.map((row: any) => [
          H.formatDateShort(row.date),
          String(row.partyName ?? ""),
          String(row.voucherName ?? ""),
          String(row.instrumentNo ?? ""),
          EnTransactionTypeObjId[row.instrumentType] || "",
          H.formatDateShort(row.instrumentDate),
          row.bankDate ? H.formatDateShort(row.bankDate) : "Not Set",
          !row.isCredit ? H.formatNumber(row.amount, precision) : "",
          row.isCredit ? H.formatNumber(row.amount, precision) : "",
        ]);

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
              text: "Bank Reconciliation Statement",
              style: "header",
              margin: [0, 0, 0, 10],
            },
            {
              text: `Bank Account: ${selectedLedger.name}`,
              fontSize: 10,
              bold: true,
              margin: [0, 0, 0, 5],
            },
            {
              text: `Period: ${H.formatDisplayDate(fromDate)} to ${H.formatDisplayDate(toDate)}`,
              fontSize: 9,
              color: "#475569",
              margin: [0, 0, 0, 15],
            },
            {
              columns: [
                {
                  width: "50%",
                  text: `Balance as per Company Books: ₹${H.formatNumber(Math.abs(printData.bankOpeningBal), precision)}`,
                  bold: true,
                  fontSize: 9,
                },
                {
                  width: "50%",
                  text: `Balance as per Bank Statement: ₹${H.formatNumber(Math.abs(printData.asPerBank), precision)}`,
                  bold: true,
                  alignment: "right",
                  fontSize: 9,
                },
              ],
              margin: [0, 0, 0, 10],
            },
            {
              text: `Amounts Not Reflected In Bank: Debit: ₹${H.formatNumber(printData.notRefDB, precision)}    Credit: ₹${H.formatNumber(printData.notRefCR, precision)}`,
              bold: true,
              fontSize: 9,
              margin: [0, 0, 0, 15],
            },
            {
              table: {
                headerRows: 1,
                widths: ["auto", "*", "auto", "auto", "auto", "auto", "auto", "auto", "auto"],
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
              text: `Total Transactions: ${printData.instruments.length}`,
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
        toast.info("No records to print.", "Info");
      }
    } catch (err: any) {
      toast.error(err?.message || "Print failed");
    } finally {
      setPrintLoading(false);
    }
  };

  const handleUpdate = async () => {
    const changed = lst.filter((x) => x.isChange);
    if (!changed.length) {
      toast.info("No modifications to save.", "Info");
      return;
    }

    setUpdateLoading(true);
    try {
      // Format instruments list back to parameters format
      const formattedInstruments = changed.map((x) => {
        let cleanApiDate = null;
        if (x.bankDate) {
          const [yr, mn, dy] = x.bankDate.split("-");
          cleanApiDate = `${yr}-${mn}-${dy}`; // yyyy-MM-dd format
        }
        return {
          ...x,
          bankDate: cleanApiDate,
        };
      });

      const payload = { instruments: formattedInstruments };
      await reportApi.bankReconcileUpdate(payload);
      toast.success("Bank reconciliation records updated successfully.", "Success");
      // Reload the dataset
      submitReport();
    } catch (err: any) {
      toast.error(err?.message || "Update failed", "Error");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleClear = () => {
    setLst([]);
    setBankOpeningBal(0);
    setNotRefDB(0);
    setNotRefCR(0);
    setAsPerBank(0);
    setSelectedLedger(null);
    setType(1);
    setFromDate(
      new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        .toISOString()
        .split("T")[0]
    );
    setToDate(new Date().toISOString().split("T")[0]);
  };

  const handleBankDateChange = (idx: number, newVal: string) => {
    setLst((prev) =>
      prev.map((item, i) => {
        if (i === idx) {
          const isChange = newVal !== item.originalBankDate;
          return { ...item, bankDate: newVal, isChange };
        }
        return item;
      })
    );
  };

  const hasModifications = lst.some((x) => x.isChange);

  return (
    <div className="font-sans text-slate-700 dark:text-slate-200 pt-4">
      {/* Main Grid Container */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Header + Filters + Table + Sticky Yellow Footer */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg text-emerald-600 dark:text-emerald-400">
                <Landmark size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  Bank Reconciliation
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Reconcile your bank statement transactions with company books.
                </p>
              </div>
            </div>
          </div>

          {/* Filters Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex flex-wrap items-end gap-3">
              {/* Select Bank Ledger */}
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

              {/* Status Type Dropdown */}
              <div className="w-full sm:w-36 shrink-0 space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                >
                  <option value={1}>All</option>
                  <option value={2}>Reconciled</option>
                  <option value={3}>Not Conciled</option>
                </select>
              </div>

              {/* Actions Inline */}
              <div className="flex items-center gap-2 pb-0.5">
                {/* Date presets selection button */}
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
                            `${partsFrom[2]}-${partsFrom[1]}-${partsFrom[0]}`
                          );
                        }
                        const partsTo = to.split("/");
                        if (partsTo.length === 3) {
                          setToDate(
                            `${partsTo[2]}-${partsTo[1]}-${partsTo[0]}`
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

                {/* Reset */}
                <button
                  onClick={handleClear}
                  title="Reset Filters"
                  className="w-10 h-10 flex items-center justify-center bg-lime-500 text-white rounded-lg hover:opacity-90 transition-all shadow-sm cursor-pointer"
                >
                  <RotateCcw size={16} />
                </button>

                {/* Print PDF */}
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

                {/* Export Excel */}
                <button
                  onClick={handleExport}
                  disabled={exportLoading || loading || !lst.length}
                  title="Export Excel"
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
                        <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Party
                        </th>
                        <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Txn No
                        </th>
                        <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Txn Type
                        </th>
                        <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Txn Date
                        </th>
                        <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Bank Date
                        </th>
                        <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">
                          Debit
                        </th>
                        <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">
                          Credit
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {lst.map((row, idx) => {
                        // Apply layout highlight style rules:
                        // Red = unreconciled row (no bankDate & no isChange)
                        // Green = has modifications (isChange)
                        // Slate = reconciled & not changed
                        let textClass = "text-slate-700 dark:text-slate-300";
                        if (!row.bankDate && !row.isChange) {
                          textClass = "text-rose-600 dark:text-rose-400 font-semibold";
                        } else if (row.isChange) {
                          textClass = "text-emerald-600 dark:text-emerald-400 font-bold";
                        }

                        return (
                          <tr
                            key={idx}
                            className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group"
                          >
                            <td className="px-5 py-3.5 text-xs font-semibold">
                              {H.formatDateShort(row.date)}
                            </td>
                            <td className="px-5 py-3.5 text-xs truncate max-w-[200px]" title={row.partyName}>
                              {row.partyName ?? "-"}
                            </td>
                            <td className="px-5 py-3.5 text-xs">
                              {row.voucherName ?? "-"}
                            </td>
                            <td className="px-5 py-3.5 text-xs font-mono font-medium">
                              {row.instrumentNo ?? "-"}
                            </td>
                            <td className="px-5 py-3.5 text-xs">
                              {EnTransactionTypeObjId[row.instrumentType] || "-"}
                            </td>
                            <td className="px-5 py-3.5 text-xs">
                              {H.formatDateShort(row.instrumentDate)}
                            </td>
                            <td className="px-5 py-3 text-xs">
                              {/* Inline Editable Bank Date Picker */}
                              <input
                                type="date"
                                value={row.bankDate || ""}
                                onChange={(e) =>
                                  handleBankDateChange(idx, e.target.value)
                                }
                                className={`px-2 py-1 bg-slate-50 dark:bg-slate-800 border rounded text-xs focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 transition-all cursor-pointer ${
                                  row.isChange
                                    ? "border-emerald-500"
                                    : !row.bankDate
                                    ? "border-rose-300 dark:border-rose-900"
                                    : "border-slate-200 dark:border-slate-700"
                                }`}
                              />
                            </td>
                            <td className={`px-5 py-3.5 text-xs text-right font-mono font-bold ${textClass}`}>
                              {!row.isCredit ? `₹${H.formatNumber(row.amount, precision)}` : "—"}
                            </td>
                            <td className={`px-5 py-3.5 text-xs text-right font-mono font-bold ${textClass}`}>
                              {row.isCredit ? `₹${H.formatNumber(row.amount, precision)}` : "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sticky yellow reconciliation summary footer */}
              <div className="sticky bottom-0 z-10 bg-brand-yellow dark:bg-brand-yellow/10 rounded-xl border border-brand-yellow/20 dark:border-brand-yellow/5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] p-4 select-none">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  {/* Left Column info */}
                  <span className="text-xs font-bold text-slate-800 dark:text-brand-yellow/90 uppercase">
                    Total Rows :{" "}
                    <span className="text-slate-950 dark:text-brand-yellow font-extrabold">
                      {lst.length}
                    </span>
                  </span>

                  {/* Middle columns stats */}
                  <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-800/80 dark:text-brand-yellow/70 font-bold uppercase block">
                        Balance per Company
                      </span>
                      <span className="text-sm font-black text-slate-950 dark:text-brand-yellow">
                        ₹{H.formatNumber(Math.abs(bankOpeningBal), precision)}
                      </span>
                    </div>

                    <div className="h-8 w-px bg-slate-900/15 dark:bg-brand-yellow/20 hidden sm:block"></div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-800/80 dark:text-brand-yellow/70 font-bold uppercase block">
                        Amounts Not Reflected In Bank (Dr / Cr)
                      </span>
                      <span className="text-sm font-black text-slate-950 dark:text-brand-yellow space-x-2">
                        <span>₹{H.formatNumber(notRefDB, precision)}</span>
                        <span className="text-slate-900/50 dark:text-brand-yellow/50">/</span>
                        <span>₹{H.formatNumber(notRefCR, precision)}</span>
                      </span>
                    </div>

                    <div className="h-8 w-px bg-slate-900/15 dark:bg-brand-yellow/20 hidden sm:block"></div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-800/80 dark:text-brand-yellow/70 font-bold uppercase block">
                        Balance per Bank
                      </span>
                      <span className="text-sm font-black text-slate-950 dark:text-brand-yellow">
                        ₹{H.formatNumber(Math.abs(asPerBank), precision)}
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Update Action */}
                  <div className="flex items-center">
                    <button
                      onClick={handleUpdate}
                      disabled={updateLoading || !hasModifications}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {updateLoading ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Save size={14} />
                      )}
                      <span>Update</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

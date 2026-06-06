import React, { useState, useCallback, useEffect } from "react";
import {
  Search,
  RotateCcw,
  FileSpreadsheet,
  Printer,
  Mail,
  MessageSquare,
  MessageCircle,
  BarChart3,
  Eye,
  FileText,
  Calendar,
  List,
  X,
  BookOpen,
  Loader2,
} from "lucide-react";
import { reportApi } from "../../../../services/report.service";
import { commonApi } from "../../../../services/common.service";
import { toast } from "../../../../lib/toast";
import * as H from "../../outstanding/outstandingHelpers";
import { ledgerApi } from "../../../../services/ledger.service";
import { CommonAutocompleteTemplate } from "../../../../shared/CommonAutocompleteTemplate";
import { useRef } from "react";
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

export const LedgerRegisterReport: React.FC = () => {
  const precision = H.getPrecision();

  const [ledgers, setLedgers] = useState<any[]>([]);
  const [selectedLedger, setSelectedLedger] = useState<any>(null);

  const [projectSites, setProjectSites] = useState<any[]>([]);
  const [selectedProjectSiteId, setSelectedProjectSiteId] = useState<
    number | null
  >(null);

  const [fromDate, setFromDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
  );
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);

  const [openingBalance, setOpeningBalance] = useState(true);
  const [runningBalance, setRunningBalance] = useState(true);
  const [billDetails, setBillDetails] = useState(false);
  const [childLedgers, setChildLedgers] = useState(false);
  const [monthWise, setMonthWise] = useState(false);
  const [columnType, setColumnType] = useState<number>(1); // 1 = All, 2 = Credit, 3 = Debit

  const [lst, setLst] = useState<any[]>([]);
  const [groupedData, setGroupedData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [openingAmount, setOpeningAmount] = useState<number>(0);
  const [closingAmount, setClosingAmount] = useState<number>(0);
  const [currentTotal, setCurrentTotal] = useState<number>(0);

  useEffect(() => {
    // Fetch detailed ledgers for autocomplete
    ledgerApi
      .search({ name: "", lockFreeze: false })
      .then((data) => {
        const list =
          data?.list || data?.data?.list || (Array.isArray(data) ? data : []);
        setLedgers(list);
      })
      .catch(console.error);

    commonApi.getDropdown({ table: 13 }).then((data) => {
      setProjectSites(data);
    });
  }, []);

  const getFilters = useCallback(
    () => ({
      ledgerId: selectedLedger
        ? selectedLedger.id || selectedLedger.ledger_id || 0
        : 0,
      projectSiteId: selectedProjectSiteId || 0,
      from: H.formatDisplayDate(fromDate) + " 00:00:00",
      to: H.formatDisplayDate(toDate) + " 23:59:59",
      openingBalance,
      runningBalance,
      billDetails,
      bankDetails: false,
      isPdc: false,
      includeChildLedgers: childLedgers,
      monthWise,
      columnType: columnType.toString(),
    }),
    [
      selectedLedger,
      selectedProjectSiteId,
      fromDate,
      toDate,
      openingBalance,
      runningBalance,
      billDetails,
      childLedgers,
      monthWise,
      columnType,
    ],
  );

  const submitReport = useCallback(async () => {
    if (!selectedLedger) {
      toast.info("Please select a ledger", "Info");
      return;
    }
    setLoading(true);
    try {
      const data = await reportApi.ledgerRegister(getFilters());
      if (data && data.list?.length) {
        setLst(data.list);
        setOpeningAmount(data.openingBal || 0);

        const filteredList = data.list.filter(
          (entry: any) =>
            entry.type !== "Closing Amount" &&
            entry.type !== "Current Total" &&
            entry.type !== "Opening Amount",
        );

        const sumCredit = filteredList.reduce(
          (total: number, entry: any) =>
            entry.credit !== null ? total + entry.credit : total,
          0,
        );
        const sumDebit = filteredList.reduce(
          (total: number, entry: any) =>
            entry.debit !== null ? total + entry.debit : total,
          0,
        );

        setCurrentTotal(Math.abs(sumDebit - sumCredit));

        const openingEntry = data.list.find(
          (entry: any) => entry.type === "Opening Amount",
        );
        const isOpeningCredit = openingEntry && openingEntry.isCr;

        let closingAmt = 0;
        if (isOpeningCredit) {
          closingAmt = (data.openingBal || 0) + sumCredit - sumDebit;
        } else {
          closingAmt = (data.openingBal || 0) + sumDebit - sumCredit;
        }
        setClosingAmount(closingAmt);

        if (monthWise) {
          const gData = data.list.reduce((acc: any, item: any) => {
            const key = `${item.InvMonth}-${item.InvYear}`;
            if (!acc[key])
              acc[key] = {
                key,
                openingAmount: item.opening || 0,
                credit: 0,
                debit: 0,
                closingAmount: 0,
              };
            acc[key].credit += item.credit || 0;
            acc[key].debit += item.debit || 0;
            acc[key].closingAmount =
              acc[key].openingAmount + acc[key].credit - acc[key].debit;
            return acc;
          }, {});
          setGroupedData(Object.values(gData));
        } else {
          setGroupedData([]);
        }
      } else {
        setLst([]);
        setGroupedData([]);
        setOpeningAmount(0);
        setClosingAmount(0);
        setCurrentTotal(0);
        toast.info("No data found", "Info");
      }
    } catch (err: any) {
      setLst([]);
      setGroupedData([]);
      toast.info(err?.message || "Error", "Error");
    } finally {
      setLoading(false);
    }
  }, [getFilters, selectedLedger, monthWise]);

  const handleExport = async () => {
    if (!selectedLedger) return;
    setExportLoading(true);
    try {
      const blob = await reportApi.ledgerRegisterExport(getFilters());
      if (blob?.size) {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "ledger-register.xlsx";
        a.click();
        URL.revokeObjectURL(a.href);
      } else toast.info("No data found to export.", "Info");
    } catch {
    } finally {
      setExportLoading(false);
    }
  };

  const handleClear = () => {
    setLst([]);
    setGroupedData([]);
    setSelectedLedger(null);
    setSelectedProjectSiteId(null);
    setFromDate(
      new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        .toISOString()
        .split("T")[0],
    );
    setToDate(new Date().toISOString().split("T")[0]);
    setOpeningBalance(true);
    setRunningBalance(true);
    setBillDetails(false);
    setChildLedgers(false);
    setMonthWise(false);
    setColumnType(1);
    setOpeningAmount(0);
    setClosingAmount(0);
    setCurrentTotal(0);
  };

  const selectedLedgerName = selectedLedger ? selectedLedger.name : "";

  return (
    <div className="font-sans text-slate-700 dark:text-slate-200 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2.5 rounded-xl text-blue-600 dark:text-blue-400"><BookOpen size={22} /></div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Ledger Register</h1>
            <div className="text-xs font-semibold text-slate-500">
              {selectedLedgerName ? `Ledger : ${selectedLedgerName} | ` : ""}
              Date : {H.formatDateShort(fromDate)} - {H.formatDateShort(toDate)}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex flex-wrap xl:flex-nowrap items-end gap-4 mb-4">
            <div className="flex-1 lg:max-w-[480px] min-w-[280px]">
              <AutocompleteInput
                label="Select Ledger"
                placeholder="Select Ledger"
                value={selectedLedger}
                options={ledgers}
                onChange={setSelectedLedger}
                templateType="ledger"
              />
            </div>
            <div className="w-full sm:w-36 shrink-0">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">
                From Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
              />
            </div>
            <div className="w-full sm:w-36 shrink-0">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">
                To Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
              />
            </div>
            <div className="shrink-0 relative">
              <button
                type="button"
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center hover:opacity-90 transition-all shadow-sm cursor-pointer"
                title="Date Range Presets"
              >
                <Calendar size={18} />
              </button>
              {showDatePicker && (
                <DateRangePicker
                  isOpen={showDatePicker}
                  onClose={() => setShowDatePicker(false)}
                  onApply={(from, to) => {
                    const partsFrom = from.split('/');
                    if (partsFrom.length === 3) {
                      setFromDate(`${partsFrom[2]}-${partsFrom[1]}-${partsFrom[0]}`);
                    }
                    const partsTo = to.split('/');
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
            <div className="flex flex-col gap-2 shrink-0 select-none pb-0.5 justify-end">
              <div className="flex items-center gap-2 min-h-[18px]">
                <input
                  type="checkbox"
                  id="openingBalance"
                  checked={openingBalance}
                  onChange={(e) => setOpeningBalance(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-slate-50 border-slate-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600 cursor-pointer"
                />
                <label
                  htmlFor="openingBalance"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none"
                >
                  Opening Bal
                </label>
              </div>
              <div className="flex items-center gap-2 min-h-[18px]">
                <input
                  type="checkbox"
                  id="runningBalance"
                  checked={runningBalance}
                  onChange={(e) => setRunningBalance(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-slate-50 border-slate-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600 cursor-pointer"
                />
                <label
                  htmlFor="runningBalance"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none"
                >
                  Running Bal
                </label>
              </div>
            </div>
            <div className="flex flex-wrap items-center space-x-2 ml-auto shrink-0 mt-4 xl:mt-0 gap-y-2">
              <button
                onClick={submitReport} disabled={loading}
                className="w-10 h-10 rounded-lg bg-[#2D9E75] text-white flex items-center justify-center hover:opacity-90 transition-all shadow-sm cursor-pointer disabled:opacity-70"
                title="Search"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              </button>
              <button
                onClick={handleClear}
                className="w-10 h-10 rounded-lg bg-lime-500 text-white flex items-center justify-center hover:opacity-90 transition-all shadow-sm cursor-pointer"
                title="Reset Filters"
              >
                <RotateCcw size={16} />
              </button>
              <button
                onClick={handleExport} disabled={exportLoading || loading || !lst.length}
                className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center hover:opacity-90 transition-all shadow-sm cursor-pointer disabled:opacity-70"
                title="Excel Export"
              >
                {exportLoading ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
              </button>
              <button
                disabled={!lst.length}
                title="Print"
                className="w-10 h-10 rounded-lg bg-rose-500 text-white flex items-center justify-center hover:opacity-90 transition-all shadow-sm cursor-pointer disabled:opacity-70"
              >
                <Printer size={16} />
              </button>
              <button disabled={!lst.length} title="Email" className="w-10 h-10 rounded-lg bg-amber-600 text-white flex items-center justify-center hover:opacity-90 transition-all shadow-sm cursor-pointer disabled:opacity-70"><Mail size={16} /></button>
              <button disabled={!lst.length} title="WhatsApp" className="w-10 h-10 rounded-lg bg-green-500 text-white flex items-center justify-center hover:opacity-90 transition-all shadow-sm cursor-pointer disabled:opacity-70"><MessageCircle size={16} /></button>
              <button disabled={!lst.length} title="SMS" className="w-10 h-10 rounded-lg bg-indigo-500 text-white flex items-center justify-center hover:opacity-90 transition-all shadow-sm cursor-pointer disabled:opacity-70"><MessageSquare size={16} /></button>
              <button disabled={!lst.length} title="Chart" className="w-10 h-10 rounded-lg bg-yellow-500 text-white flex items-center justify-center hover:opacity-90 transition-all shadow-sm cursor-pointer disabled:opacity-70"><BarChart3 size={16} /></button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 mt-4 border-t border-slate-100 dark:border-slate-800 pt-4">
            <div className="flex items-end gap-1.5 shrink-0">
              <div className="w-48">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Project Site
                </label>
                <select
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
                  value={selectedProjectSiteId || ""}
                  onChange={(e) =>
                    setSelectedProjectSiteId(Number(e.target.value))
                  }
                >
                  <option value="">Project Site</option>
                  {projectSites.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center hover:opacity-90 transition-all shadow-sm cursor-pointer"
                title="Project Site Selection"
              >
                <List size={18} />
              </button>
            </div>
            
            <div className="flex flex-wrap items-center gap-6 shrink-0 select-none pt-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="billDetails"
                  checked={billDetails}
                  onChange={(e) => setBillDetails(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-slate-50 border-slate-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600 cursor-pointer"
                />
                <label
                  htmlFor="billDetails"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none"
                >
                  Bill Details
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="childLedgers"
                  checked={childLedgers}
                  onChange={(e) => setChildLedgers(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-slate-50 border-slate-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600 cursor-pointer"
                />
                <label
                  htmlFor="childLedgers"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none"
                >
                  Child Ledgers
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="monthWise"
                  checked={monthWise}
                  onChange={(e) => setMonthWise(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-slate-50 border-slate-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600 cursor-pointer"
                />
                <label
                  htmlFor="monthWise"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none"
                >
                  Month Wise
                </label>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0 border-l border-slate-200 dark:border-slate-700 pl-6 select-none pt-4">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="colType"
                  value={1}
                  checked={columnType === 1}
                  onChange={() => setColumnType(1)}
                  className="w-4 h-4 text-blue-600 bg-slate-50 border-slate-300 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 cursor-pointer"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600 transition-colors">
                  All
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="colType"
                  value={2}
                  checked={columnType === 2}
                  onChange={() => setColumnType(2)}
                  className="w-4 h-4 text-blue-600 bg-slate-50 border-slate-300 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 cursor-pointer"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600 transition-colors">
                  Credit
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="colType"
                  value={3}
                  checked={columnType === 3}
                  onChange={() => setColumnType(3)}
                  className="w-4 h-4 text-blue-600 bg-slate-50 border-slate-300 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 cursor-pointer"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600 transition-colors">
                  Debit
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {lst.length > 0 && (
        <div className="px-6 pb-6 flex-1 flex flex-col min-h-0">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-auto">
              {monthWise ? (
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-slate-100/50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 font-bold">Month</th>
                      <th className="px-4 py-3 font-bold text-right">
                        Opening
                      </th>
                      <th className="px-4 py-3 font-bold text-right">Credit</th>
                      <th className="px-4 py-3 font-bold text-right">Debit</th>
                      <th className="px-4 py-3 font-bold text-right">
                        Closing
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {groupedData.map((row, i) => (
                      <tr
                        key={i}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                          {row.key}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400">
                          {H.formatNumber(row.openingAmount, precision)}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400">
                          {H.formatNumber(row.credit, precision)}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400">
                          {H.formatNumber(row.debit, precision)}
                        </td>
                        <td className="px-4 py-3 text-right font-black text-blue-600 dark:text-blue-400">
                          {H.formatNumber(row.closingAmount, precision)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-[#fcf8e3] dark:bg-amber-900/20 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-amber-200/80 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 font-bold text-xs uppercase">
                        Doc No
                      </th>
                      <th className="px-4 py-3 font-bold text-xs uppercase">
                        Bill Date
                      </th>
                      <th className="px-4 py-3 font-bold text-xs uppercase">
                        Particular
                      </th>
                      <th className="px-4 py-3 font-bold text-xs uppercase">
                        Type
                      </th>
                      <th className="px-4 py-3 font-bold text-xs uppercase text-right">
                        Debit
                      </th>
                      <th className="px-4 py-3 font-bold text-xs uppercase text-right">
                        Credit
                      </th>
                      <th className="px-4 py-3 font-bold text-xs uppercase text-right">
                        Running
                      </th>
                      <th className="px-4 py-3 font-bold text-xs uppercase">
                        Note
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    <tr className="bg-slate-50/30 dark:bg-slate-800/10">
                      <td colSpan={3}></td>
                      <td className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                        Opening Amount
                      </td>
                      <td className="px-4 py-2 text-right font-mono text-slate-500"></td>
                      <td className="px-4 py-2 text-right font-mono text-slate-600 dark:text-slate-300">
                        {H.formatNumber(openingAmount, precision)}
                      </td>
                      <td colSpan={2}></td>
                    </tr>

                    {lst.map((row, i) => (
                      <tr
                        key={i}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="px-4 py-2 font-medium text-slate-800 dark:text-slate-200">
                          {row.docNo || row.billNo}
                        </td>
                        <td className="px-4 py-2 text-slate-600 dark:text-slate-400">
                          {H.formatDateShort(row.date)}
                        </td>
                        <td className="px-4 py-2 text-slate-600 dark:text-slate-400">
                          {row.particular || row.party}
                        </td>
                        <td className="px-4 py-2 text-slate-600 dark:text-slate-400">
                          {row.type}
                        </td>
                        <td className="px-4 py-2 text-right font-mono text-slate-600 dark:text-slate-400">
                          {H.formatNumber(row.debit, precision)}
                        </td>
                        <td className="px-4 py-2 text-right font-mono text-slate-600 dark:text-slate-400">
                          {H.formatNumber(row.credit, precision)}
                        </td>
                        <td className="px-4 py-2 text-right font-mono text-blue-600 dark:text-blue-400 font-semibold">
                          {H.formatNumber(row.runningAmount, precision)}
                        </td>
                        <td className="px-4 py-2 text-slate-500 text-xs truncate max-w-[150px]">
                          {row.note}
                        </td>
                      </tr>
                    ))}

                    <tr className="bg-slate-50/30 dark:bg-slate-800/10 border-t border-slate-200 dark:border-slate-700">
                      <td colSpan={3}></td>
                      <td className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                        Current Total
                      </td>
                      <td className="px-4 py-2 text-right font-mono font-semibold text-slate-800 dark:text-slate-100">
                        {H.formatNumber(currentTotal, precision)}
                      </td>
                      <td className="px-4 py-2 text-right font-mono font-semibold text-slate-800 dark:text-slate-100">
                        {H.formatNumber(currentTotal, precision)}
                      </td>
                      <td colSpan={2}></td>
                    </tr>
                    <tr className="bg-slate-50/30 dark:bg-slate-800/10">
                      <td colSpan={3}></td>
                      <td className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                        Closing Amount
                      </td>
                      <td className="px-4 py-2 text-right font-mono text-slate-500"></td>
                      <td className="px-4 py-2 text-right font-mono text-slate-600 dark:text-slate-300">
                        {H.formatNumber(closingAmount, precision)}
                      </td>
                      <td colSpan={2}></td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer summary matching SO Summary styling */}
      {lst.length > 0 && (
        <div className="sticky bottom-0 mt-auto z-40 bg-brand-yellow dark:bg-brand-yellow/10 px-6 py-4 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] backdrop-blur-md border-t border-brand-yellow/20 dark:border-brand-yellow/5 flex flex-wrap justify-between items-center select-none">
              <div className="flex flex-wrap items-center gap-8 md:gap-16">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-800/80 dark:text-brand-yellow/70 uppercase tracking-tighter">Total Rows</span>
                  <span className="text-xl font-extrabold text-slate-950 dark:text-brand-yellow tabular-nums">
                    {lst.length}
                  </span>
                </div>
                <div className="h-8 w-px bg-slate-900/15 dark:bg-brand-yellow/20 hidden sm:block"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-800/80 dark:text-brand-yellow/70 uppercase tracking-tighter">Opening Amount</span>
                  <span className="text-xl font-extrabold text-slate-950 dark:text-brand-yellow tabular-nums">
                    ₹ {H.formatNumber(openingAmount, precision)}
                  </span>
                </div>
                <div className="h-8 w-px bg-slate-900/15 dark:bg-brand-yellow/20 hidden sm:block"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-800/80 dark:text-brand-yellow/70 uppercase tracking-tighter">Closing Amount</span>
                  <span className="text-xl font-extrabold text-slate-950 dark:text-brand-yellow tabular-nums">
                    ₹ {H.formatNumber(closingAmount, precision)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 shrink-0">
                <button className="w-8 h-8 bg-indigo-500 text-white rounded flex items-center justify-center hover:bg-indigo-600 transition-colors shadow-sm">
                  <Printer size={14} />
                </button>
                <button className="w-8 h-8 bg-lime-500 text-white rounded flex items-center justify-center hover:bg-lime-600 transition-colors shadow-sm">
                  <FileText size={14} />
                </button>
                <button className="w-8 h-8 bg-amber-500 text-white rounded flex items-center justify-center hover:bg-amber-600 transition-colors shadow-sm">
                  <FileText size={14} />
                </button>
                <button className="w-8 h-8 bg-rose-500 text-white rounded flex items-center justify-center hover:bg-rose-600 transition-colors shadow-sm">
                  <FileText size={14} />
                </button>
              </div>
            </div>
          )}
    </div>
  );
};

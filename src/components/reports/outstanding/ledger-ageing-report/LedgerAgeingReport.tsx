import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  RotateCcw,
  FileSpreadsheet,
  Printer,
  ChevronDown,
  ChevronUp,
  Loader2,
  Clock
} from "lucide-react";
import { reportApi } from "../../../../services/report.service";
import { commonApi } from "../../../../services/common.service";
import { ledgerApi } from "../../../../services/ledger.service";
import { toast } from "../../../../lib/toast";
import * as H from "../outstandingHelpers";

export const LedgerAgeingReport: React.FC = () => {
  const precision = H.getPrecision();

  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);
  const [assignedUserID, setAssignedUserID] = useState<string>("");
  const [groupId, setGroupId] = useState<string>("");
  const [ageType, setAgeType] = useState<number>(1);

  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);

  const salesPersonListRef = useRef<any[]>([]);

  const [agingCategories, setAgingCategories] = useState<any[]>([]);
  const [agingDataArray, setAgingDataArray] = useState<any[]>([]);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const [ledgerOptions, setLedgerOptions] = useState<any[]>([]);
  const [selectedLedgerIds, setSelectedLedgerIds] = useState<Set<number>>(
    new Set(),
  );
  const [isLedgerDropdownOpen, setIsLedgerDropdownOpen] = useState(false);
  const ledgerDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (groupId) {
      const ledgers = H.getFilteredLedgers([Number(groupId)]);
      setLedgerOptions(ledgers);
      setSelectedLedgerIds(new Set(ledgers.map((l) => l.id)));
    } else {
      setLedgerOptions([]);
      setSelectedLedgerIds(new Set());
    }
  }, [groupId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        ledgerDropdownRef.current &&
        !ledgerDropdownRef.current.contains(e.target as Node)
      ) {
        setIsLedgerDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    commonApi
      .getDropdown({ table: 18 })
      .then((data) => {
        salesPersonListRef.current = data || [];
      })
      .catch(() => {});
  }, []);

  const getFilters = useCallback(
    () => ({
      dateTo: H.formatDateForApi(toDate) + " 23:59:59",
      resultType: 1,
      assignedUserID: assignedUserID || null,
      ledgers: Array.from(selectedLedgerIds),
    }),
    [toDate, assignedUserID, selectedLedgerIds],
  );

  const determineCategories = (type: number) => {
    if (type === 1) {
      return [
        { label: "<=7 Days", daysRange: 7 },
        { label: "8 to 14 Days", daysRange: 14 },
        { label: "15 to 21 Days", daysRange: 21 },
        { label: "22 to 42 Days", daysRange: 42 },
        { label: ">42 Days", daysRange: Infinity },
      ];
    } else if (type === 2) {
      return [
        { label: "<=30 Days", daysRange: 30 },
        { label: "31 to 60 Days", daysRange: 60 },
        { label: "61 to 90 Days", daysRange: 90 },
        { label: "91 to 180 Days", daysRange: 180 },
        { label: ">180 Days", daysRange: Infinity },
      ];
    } else {
      return [
        { label: "<=90 Days", daysRange: 90 },
        { label: "91 to 180 Days", daysRange: 180 },
        { label: "181 to 270 Days", daysRange: 270 },
        { label: "271 to 540 Days", daysRange: 540 },
        { label: ">540 Days", daysRange: Infinity },
      ];
    }
  };

  const calculateReceivableAging = (
    invoices: any[],
    asOfDate: string,
    categories: any[],
    multiLedgerInfo: any[],
  ) => {
    const agingData: Record<
      string,
      { salesperson: string; data: Record<string, number> }
    > = {};

    invoices.forEach((invoice: any) => {
      const invoiceDate = new Date(invoice.date);
      const asOf = new Date(asOfDate);
      const diffTime = asOf.getTime() - invoiceDate.getTime();
      const daysAgo = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

      for (const category of categories) {
        if (daysAgo <= category.daysRange) {
          const categoryKey = category.label;
          const ledgerKey =
            invoice.party ||
            invoice.ledgerName ||
            `Ledger #${invoice.ledgerId}`;
          const ledgerInfo = multiLedgerInfo.find(
            (x) => x.id === invoice.ledgerId,
          );
          let salespersonKey = "-";

          if (
            ledgerInfo &&
            ledgerInfo.assignedUserID &&
            salesPersonListRef.current.length
          ) {
            const rec = salesPersonListRef.current.find(
              (x) => x.id == ledgerInfo.assignedUserID,
            );
            salespersonKey = rec ? rec.name : "-";
          }

          if (!agingData[ledgerKey]) {
            agingData[ledgerKey] = { salesperson: salespersonKey, data: {} };
          }

          const amount =
            invoice.opening *
            (invoice.openingDrCr === invoice.ledgerDrCr ? 1 : -1);
          agingData[ledgerKey].data[categoryKey] =
            (agingData[ledgerKey].data[categoryKey] || 0) + amount;
          break;
        }
      }
    });

    const dataArray = [];
    for (const ledgerKey in agingData) {
      const ledgerData = agingData[ledgerKey].data;
      const salesperson = agingData[ledgerKey].salesperson;
      const ledgerTotal = Object.values(ledgerData).reduce(
        (acc: number, val: number) => acc + val,
        0,
      );
      const invs = invoices.filter(
        (x) =>
          (x.party || x.ledgerName || `Ledger #${x.ledgerId}`) === ledgerKey,
      );

      dataArray.push({
        ledger: { name: ledgerKey, salesperson },
        rowData: ledgerData,
        total: ledgerTotal,
        invoices: invs,
      });
    }

    setAgingDataArray(
      dataArray.sort((a, b) => a.ledger.name.localeCompare(b.ledger.name)),
    );
  };

  const submitReport = useCallback(async () => {
    if (!groupId) {
      toast.info("Please select a Group.", "Validation");
      return;
    }
    if (selectedLedgerIds.size === 0) {
      toast.info("No ledgers provided to show outstanding", "Validation");
      return;
    }
    setLoading(true);
    setExpandedRows({});
    try {
      let data = await reportApi.ledgerOutstanding(getFilters());
      if (data?.length) {
        // Filter by Dr or Cr based on group (17 = Debtors = Dr, 16 = Creditors = Cr)
        const targetDrCr = groupId === "17" ? "Dr" : "Cr";
        data = data.filter((x: any) => x.ledgerDrCr === targetDrCr);
        data = data.sort((a: any, b: any) => b.overDue - a.overDue);

        if (data.length) {
          const uniqueIds = [...new Set(data.map((i: any) => i.ledgerId))];
          let multiLedgerInfo: any[] = [];
          try {
            multiLedgerInfo = await ledgerApi.multiLedgerInfo({
              ledgers: uniqueIds,
            });
          } catch {}

          const categories = determineCategories(ageType);
          setAgingCategories(categories);
          calculateReceivableAging(data, toDate, categories, multiLedgerInfo);
        } else {
          setAgingCategories([]);
          setAgingDataArray([]);
          toast.info("No outstanding for selected criteria", "Info");
        }
      } else {
        setAgingCategories([]);
        setAgingDataArray([]);
        toast.info("No outstanding for selected party", "Info");
      }
    } catch (err: any) {
      setAgingCategories([]);
      setAgingDataArray([]);
      toast.info(err?.message || "Error", "Error");
    } finally {
      setLoading(false);
    }
  }, [getFilters, groupId, ageType, toDate]);

  const handleExport = async () => {
    if (!groupId) {
      toast.info("Please select a Group.", "Validation");
      return;
    }
    if (selectedLedgerIds.size === 0) {
      toast.info("No ledgers provided to show outstanding", "Validation");
      return;
    }
    setExportLoading(true);
    try {
      const blob = await reportApi.ledgerOutstandingExport(getFilters());
      if (blob?.size) {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "ledger-wise-ageing.xlsx";
        a.click();
        URL.revokeObjectURL(a.href);
      } else toast.info("No data found to export.", "Info");
    } catch {
    } finally {
      setExportLoading(false);
    }
  };

  const handlePrint = async () => {
    if (!groupId) {
      toast.info("Please select a Group.", "Validation");
      return;
    }
    if (selectedLedgerIds.size === 0) {
      toast.info("No ledgers provided to show outstanding", "Validation");
      return;
    }
    setPrintLoading(true);
    try {
      const blob = await reportApi.ledgerOutstandingPrint(getFilters());
      if (blob?.size) {
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, "_blank");
      } else toast.info("No data to print.", "Info");
    } catch (err: any) {
      toast.error(err?.message || "Print failed");
    } finally {
      setPrintLoading(false);
    }
  };

  const handleClear = () => {
    setAgingCategories([]);
    setAgingDataArray([]);
    setToDate(new Date().toISOString().split("T")[0]);
    setAssignedUserID("");
    setGroupId("");
    setAgeType(1);
    setExpandedRows({});
    // The useEffect listening to groupId will clear the selected ledgers
  };

  const toggleRow = (ledgerName: string) => {
    setExpandedRows((prev) => ({ ...prev, [ledgerName]: !prev[ledgerName] }));
  };

  const calculateColumnTotal = (categoryLabel: string) => {
    return agingDataArray.reduce(
      (acc, data) => acc + (data.rowData[categoryLabel] || 0),
      0,
    );
  };

  const calculateTotalOfTotals = () => {
    return agingDataArray.reduce((acc, data) => acc + data.total, 0);
  };

  return (
    <div className="font-sans text-slate-700 dark:text-slate-200 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2.5 rounded-xl text-blue-600 dark:text-blue-400"><Clock size={22} /></div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Ledger Wise Ageing</h1>
            <p className="text-xs text-slate-500 font-medium">Ageing report by ledger</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 mb-5">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">Sales Person</label>
            <select
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-48"
              value={assignedUserID}
              onChange={(e) => setAssignedUserID(e.target.value)}
            >
              <option value="">Select Sales Person</option>
              {salesPersonListRef.current.map((sp) => (
                <option key={sp.id} value={sp.id}>{sp.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">Group</label>
            <select
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-48"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
            >
              <option value="">Select Group</option>
              <option value="16">Sundry Creditors</option>
              <option value="17">Sundry Debtors</option>
            </select>
          </div>

          <div className="relative w-48" ref={ledgerDropdownRef}>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">Ledgers</label>
            <button
              type="button"
              onClick={() => setIsLedgerDropdownOpen(!isLedgerDropdownOpen)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <span className="truncate">
                {selectedLedgerIds.size === 0
                  ? "Select Ledgers"
                  : `${selectedLedgerIds.size} selected`}
              </span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            {isLedgerDropdownOpen && (
              <div className="absolute z-50 top-full left-0 mt-1 w-64 max-h-60 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl custom-scrollbar">
                <div className="p-2 border-b border-slate-100 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedLedgerIds(new Set(ledgerOptions.map((l) => l.id)))}
                    className="flex-1 text-xs py-1.5 font-medium bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedLedgerIds(new Set())}
                    className="flex-1 text-xs py-1.5 font-medium bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    Clear
                  </button>
                </div>
                <div className="p-1">
                  {ledgerOptions.map((l) => (
                    <label key={l.id} className="flex items-center gap-3 px-2 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500/20 bg-white dark:bg-slate-800 cursor-pointer"
                        checked={selectedLedgerIds.has(l.id)}
                        onChange={(e) => {
                          const newSet = new Set(selectedLedgerIds);
                          if (e.target.checked) newSet.add(l.id);
                          else newSet.delete(l.id);
                          setSelectedLedgerIds(newSet);
                        }}
                      />
                      <span className="text-sm truncate text-slate-700 dark:text-slate-200 cursor-pointer" title={l.name}>{l.name}</span>
                    </label>
                  ))}
                  {ledgerOptions.length === 0 && (
                    <div className="p-4 text-center text-sm text-slate-500">No ledgers found</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">To Date</label>
            <input
              type="date"
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-36"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">Age Type</label>
            <select
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-36"
              value={ageType}
              onChange={(e) => setAgeType(Number(e.target.value))}
            >
              <option value={1}>Weekly</option>
              <option value={2}>Monthly</option>
              <option value={3}>Quarterly</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 mt-4 md:mt-0 ml-auto">
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
              onClick={handlePrint} disabled={printLoading || loading || !agingDataArray.length}
              className="w-10 h-10 rounded-lg bg-rose-500 text-white flex items-center justify-center hover:opacity-90 transition-all shadow-sm cursor-pointer disabled:opacity-70"
              title="Print / PDF"
            >
              {printLoading ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />}
            </button>
            <button
              onClick={handleExport} disabled={exportLoading || loading || !agingDataArray.length}
              className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center hover:opacity-90 transition-all shadow-sm cursor-pointer disabled:opacity-70"
              title="Excel Export"
            >
              {exportLoading ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
            </button>
          </div>
        </div>
      </div>

      {agingDataArray.length > 0 && agingCategories.length > 0 && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-slate-100/50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 font-bold">Ledger</th>
                    <th className="px-4 py-3 font-bold">Sales Person</th>
                    {agingCategories.map((cat, i) => (
                      <th key={i} className="px-4 py-3 font-bold text-right">
                        {cat.label}
                      </th>
                    ))}
                    <th className="px-4 py-3 font-bold text-right text-blue-600 dark:text-blue-400">
                      Total (INR)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {agingDataArray.map((data, i) => (
                    <React.Fragment key={i}>
                      <tr
                        className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer ${expandedRows[data.ledger.name] ? "bg-blue-50/50 dark:bg-blue-900/10" : ""}`}
                        onClick={() => toggleRow(data.ledger.name)}
                      >
                        <td className="px-4 py-3 font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                          {expandedRows[data.ledger.name] ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                          {data.ledger.name}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                          {data.ledger.salesperson}
                        </td>
                        {agingCategories.map((cat, j) => (
                          <td
                            key={j}
                            className="px-4 py-3 text-right font-medium text-slate-700 dark:text-slate-300"
                          >
                            {H.formatNumber(
                              data.rowData[cat.label] || 0,
                              precision,
                            )}
                          </td>
                        ))}
                        <td className="px-4 py-3 text-right font-black text-blue-600 dark:text-blue-400">
                          {H.formatNumber(data.total, precision)}
                        </td>
                      </tr>

                      {expandedRows[data.ledger.name] && (
                        <tr className="bg-slate-50 dark:bg-slate-800/20">
                          <td
                            colSpan={agingCategories.length + 3}
                            className="p-0 border-b border-slate-200 dark:border-slate-700"
                          >
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 pl-12">
                              <table className="w-full text-xs text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm">
                                <thead className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                  <tr>
                                    <th className="px-3 py-2 font-bold text-slate-600 dark:text-slate-300">
                                      Doc No
                                    </th>
                                    <th className="px-3 py-2 font-bold text-slate-600 dark:text-slate-300">
                                      Date
                                    </th>
                                    <th className="px-3 py-2 font-bold text-slate-600 dark:text-slate-300">
                                      Voucher
                                    </th>
                                    <th className="px-3 py-2 font-bold text-right text-slate-600 dark:text-slate-300">
                                      Amount
                                    </th>
                                    <th className="px-3 py-2 font-bold text-right text-slate-600 dark:text-slate-300">
                                      Opening
                                    </th>
                                    <th className="px-3 py-2 font-bold text-center text-slate-600 dark:text-slate-300">
                                      Over Due(In Days)
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                  {data.invoices.map((inv: any, j: number) => (
                                    <tr
                                      key={j}
                                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                                    >
                                      <td className="px-3 py-2 font-medium">
                                        {inv.billNo || inv.bill_No}
                                      </td>
                                      <td className="px-3 py-2">
                                        {H.formatDisplayDate(inv.date)}
                                      </td>
                                      <td className="px-3 py-2">
                                        {inv.voucher}
                                      </td>
                                      <td className="px-3 py-2 text-right font-medium">
                                        {H.formatNumber(inv.opening, precision)}{" "}
                                        {inv.openingDrCr}
                                      </td>
                                      <td className="px-3 py-2 text-right font-medium">
                                        {H.formatNumber(inv.pending, precision)}{" "}
                                        {inv.pendingDrCr}
                                      </td>
                                      <td className="px-3 py-2 text-center">
                                        <span
                                          className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                            inv.overDue > 0
                                              ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                                              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                          }`}
                                        >
                                          {inv.overDue}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
                <tfoot className="bg-slate-100/80 dark:bg-slate-800/80 sticky bottom-0 z-10 border-t-2 border-slate-200 dark:border-slate-700">
                  <tr>
                    <td className="px-4 py-3 font-black text-slate-800 dark:text-slate-100">
                      TOTAL
                    </td>
                    <td className="px-4 py-3"></td>
                    {agingCategories.map((cat, i) => (
                      <td
                        key={i}
                        className="px-4 py-3 text-right font-black text-slate-800 dark:text-slate-100"
                      >
                        {H.formatNumber(
                          calculateColumnTotal(cat.label),
                          precision,
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right font-black text-blue-600 dark:text-blue-400">
                      {H.formatNumber(calculateTotalOfTotals(), precision)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

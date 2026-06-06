import React, { useState, useCallback } from "react";
import {
  Search,
  RotateCcw,
  FileSpreadsheet,
  Loader2,
  Printer,
  BarChart2,
} from "lucide-react";
import { reportApi } from "../../../services/report.service";
import { toast } from "../../../lib/toast";
import * as H from "../outstanding/outstandingHelpers";

export const RateComparisionReport: React.FC = () => {
  const precision = H.getPrecision();

  const [billNo, setBillNo] = useState<string>("");

  const [lst, setLst] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);

  const getFilters = useCallback(() => {
    return {
      billNo: billNo ? billNo : null,
    };
  }, [billNo]);

  const submitReport = async () => {
    if (!billNo) {
      toast.error("Please enter Doc No.");
      return;
    }

    setLoading(true);
    try {
      const data = await reportApi.rateComparisionReport(getFilters());
      if (data?.length) {
        setLst(data);
      } else {
        setLst([]);
        toast.info("No data found.", "Info");
      }
    } catch (err: any) {
      setLst([]);
      toast.error(err?.message || "Error fetching report");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setBillNo("");
    setLst([]);
  };

  const handleExport = async () => {
    if (!billNo) {
      toast.error("Please enter Doc No before exporting.");
      return;
    }
    setExportLoading(true);
    try {
      const blob = await reportApi.rateComparisionReportExport(getFilters());
      if (blob?.size) {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "rate-comparision.xlsx";
        a.click();
        URL.revokeObjectURL(a.href);
      } else {
        toast.info("No data found to export.", "Info");
      }
    } catch (err: any) {
      toast.error(err?.message || "Export failed");
    } finally {
      setExportLoading(false);
    }
  };

  const handlePrint = async () => {
    if (!billNo) {
      toast.error("Please enter Doc No before printing.");
      return;
    }
    setPrintLoading(true);
    try {
      toast.info("Print functionality requires backend API implementation.");
    } finally {
      setPrintLoading(false);
    }
  };

  return (
    <div className="font-sans text-slate-700 dark:text-slate-200 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="bg-sky-100 dark:bg-sky-900/30 p-2.5 rounded-xl text-sky-600 dark:text-sky-400">
            <BarChart2 size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              Rate Comparision
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Analyze and compare item rates by Document No
            </p>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 mb-5">
        <div className="flex flex-wrap items-end gap-4">
          {/* Doc No */}
          <div className="w-full sm:w-64 space-y-1">
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Doc No <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-semibold"
              placeholder="e.g. INV-2026-001"
              value={billNo}
              onChange={(e) => setBillNo(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pb-[2px]">
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

      {/* Results Grid */}
      {loading ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-sky-500 mb-3" />
          <span className="text-sm text-slate-500 font-medium">Loading...</span>
        </div>
      ) : !lst.length ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm text-center py-16">
          <BarChart2 size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <p className="text-slate-500 text-sm">
            No results found. Enter Doc No and click Search.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-auto max-h-[500px] custom-scrollbar">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="sticky top-0 z-10">
                <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">Item Code</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">Particulars</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">Std Qty</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">Std Unit</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase text-right">Sell Rate</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase text-right">NRP</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase text-right">SDP</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase text-right">EWP</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase text-right">NPP</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase text-right">MRP</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase text-right">MRP To NRP</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase text-right">MRP To SDP</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase text-right">MRP To EWP</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase text-right">NRP To SDP</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase text-right">NRP To EWP</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase text-right">SDP To EWP</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {lst.map((row, ri) => (
                  <tr
                    key={ri}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {row.Item_CodeTxt}
                    </td>
                    <td className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400">
                      {row.Particulars}
                    </td>
                    <td className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400">
                      {row.Std_Qty}
                    </td>
                    <td className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400">
                      {row.Std_Unit}
                    </td>
                    <td className="px-4 py-2 text-xs font-mono font-bold text-right text-sky-600 dark:text-sky-400">
                      {H.formatNumber(row.Std_Rate, precision)}
                    </td>
                    <td className="px-4 py-2 text-xs font-mono text-right text-slate-700 dark:text-slate-300">
                      {H.formatNumber(row.NRP, precision)}
                    </td>
                    <td className="px-4 py-2 text-xs font-mono text-right text-slate-700 dark:text-slate-300">
                      {H.formatNumber(row.SDP, precision)}
                    </td>
                    <td className="px-4 py-2 text-xs font-mono text-right text-slate-700 dark:text-slate-300">
                      {H.formatNumber(row.EWP, precision)}
                    </td>
                    <td className="px-4 py-2 text-xs font-mono text-right text-slate-700 dark:text-slate-300">
                      {H.formatNumber(row.NPP, precision)}
                    </td>
                    <td className="px-4 py-2 text-xs font-mono text-right text-slate-700 dark:text-slate-300">
                      {H.formatNumber(row.MRP, precision)}
                    </td>
                    <td className="px-4 py-2 text-xs font-mono text-right text-slate-700 dark:text-slate-300">
                      {H.formatNumber(row.MRPToNRP, precision)}
                    </td>
                    <td className="px-4 py-2 text-xs font-mono text-right text-slate-700 dark:text-slate-300">
                      {H.formatNumber(row.MRPToSDP, precision)}
                    </td>
                    <td className="px-4 py-2 text-xs font-mono text-right text-slate-700 dark:text-slate-300">
                      {H.formatNumber(row.MRPToEWP, precision)}
                    </td>
                    <td className="px-4 py-2 text-xs font-mono text-right text-slate-700 dark:text-slate-300">
                      {H.formatNumber(row.NRPToSDP, precision)}
                    </td>
                    <td className="px-4 py-2 text-xs font-mono text-right text-slate-700 dark:text-slate-300">
                      {H.formatNumber(row.NRPToEWP, precision)}
                    </td>
                    <td className="px-4 py-2 text-xs font-mono text-right text-slate-700 dark:text-slate-300">
                      {H.formatNumber(row.SDPToEWP, precision)}
                    </td>
                    <td className="px-4 py-2 text-xs text-slate-500">
                      {row.ItemDescription}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sticky Summary Footer */}
      {lst.length > 0 && (
        <div className="sticky bottom-0 z-10 bg-brand-yellow dark:bg-brand-yellow/10 rounded-xl border border-brand-yellow/20 dark:border-brand-yellow/5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] p-4 select-none mt-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs font-bold text-slate-800 dark:text-brand-yellow/90 uppercase">
              Total Rows :{" "}
              <span className="text-slate-950 dark:text-brand-yellow font-extrabold">
                {lst.length}
              </span>
            </span>
            <span className="text-xs font-bold text-slate-800 dark:text-brand-yellow/90 uppercase">
              Filtered Rows :{" "}
              <span className="text-slate-950 dark:text-brand-yellow font-extrabold">
                {lst.length}
              </span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

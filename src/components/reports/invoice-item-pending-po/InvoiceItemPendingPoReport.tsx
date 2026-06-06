import React, { useState } from "react";
import { Search, RotateCcw, FileSpreadsheet, Loader2, Printer, ClipboardList } from "lucide-react";
import { reportApi } from "../../../services/report.service";
import { toast } from "../../../lib/toast";

export const InvoiceItemPendingPoReport: React.FC = () => {
  const [fromDate, setFromDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split("T")[0];
  });
  const [toDate, setToDate] = useState<string>(() => {
    return new Date().toISOString().split("T")[0];
  });

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);

  const getFilters = () => {
    return {
      fromDate: fromDate ? fromDate + " 00:00:00" : null,
      toDate: toDate ? toDate + " 23:59:59" : null,
    };
  };

  const submitSearch = async () => {
    if (!fromDate || !toDate) {
      toast.error("Please select both From Date and To Date");
      return;
    }
    setLoading(true);
    try {
      const filters = getFilters();
      // Emulating the old UI which called SalesPersonReport for this
      const res = await reportApi.salesPersonReport(filters);
      if (res && res.length) {
        setData(res);
      } else {
        setData([]);
        toast.info("No data found.");
      }
    } catch (err: any) {
      setData([]);
      toast.error(err?.message || "Error fetching report");
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    const d = new Date();
    d.setDate(1);
    setFromDate(d.toISOString().split("T")[0]);
    setToDate(new Date().toISOString().split("T")[0]);
    setData([]);
  };

  const submitExport = async () => {
    if (!fromDate || !toDate) {
      toast.error("Please select both From Date and To Date");
      return;
    }
    setExportLoading(true);
    try {
      const filters = getFilters();
      // Emulating the old UI which called SalesPersonReportExport
      const blob = await reportApi.salesPersonReportExport(filters);
      if (blob?.size) {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "InvoiceItemPendingPO.xlsx";
        a.click();
        URL.revokeObjectURL(a.href);
      } else {
        toast.info("No data found to export.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Export failed");
    } finally {
      setExportLoading(false);
    }
  };

  const handlePrint = async () => {
    if (!fromDate || !toDate) {
      toast.error("Please select both From Date and To Date");
      return;
    }
    setPrintLoading(true);
    try {
      // Print functionality stub
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
          <div className="bg-purple-100 dark:bg-purple-900/30 p-2.5 rounded-xl text-purple-600 dark:text-purple-400">
            <ClipboardList size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              Invoice Item Pending PO Report
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              View pending purchase orders for invoice items
            </p>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 mb-5">
        <div className="flex flex-wrap items-end gap-4">
          <div className="w-full sm:w-40 space-y-1">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              From Date <span className="text-rose-500">*</span>
            </label>
            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          <div className="w-full sm:w-40 space-y-1">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              To Date <span className="text-rose-500">*</span>
            </label>
            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pb-[1px]">
            <button
              onClick={submitSearch}
              disabled={loading}
              title="Search"
              className="w-10 h-[38px] flex items-center justify-center bg-[#2D9E75] text-white rounded-lg hover:opacity-90 transition-all shadow-sm cursor-pointer disabled:opacity-70"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            </button>
            <button
              onClick={clear}
              title="Reset"
              className="w-10 h-[38px] flex items-center justify-center bg-lime-500 text-white rounded-lg hover:opacity-90 transition-all shadow-sm cursor-pointer"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={submitExport}
              disabled={exportLoading || loading || !data.length}
              title="Excel Export"
              className="w-10 h-[38px] flex items-center justify-center bg-emerald-600 text-white rounded-lg hover:opacity-90 transition-all shadow-sm cursor-pointer disabled:opacity-70"
            >
              {exportLoading ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
            </button>
            <button
              onClick={handlePrint}
              disabled={printLoading || loading || !data.length}
              title="Print PDF"
              className="w-10 h-[38px] flex items-center justify-center bg-rose-500 text-white rounded-lg hover:opacity-90 transition-all shadow-sm cursor-pointer disabled:opacity-70"
            >
              {printLoading ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-purple-500 mb-3" />
          <span className="text-sm text-slate-500 font-medium">Loading...</span>
        </div>
      ) : !data.length ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm text-center py-16">
          <ClipboardList size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <p className="text-slate-500 text-sm">No results found. Adjust filters and click Search.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-auto max-h-[500px]">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">Item Code</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">Item Name</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">Brands</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">Subcategory</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.map((row, ri) => (
                  <tr key={ri} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-2 text-xs font-semibold text-purple-600 dark:text-purple-400 whitespace-nowrap">
                      {row.BillNo || "-"}
                    </td>
                    <td className="px-4 py-2 text-xs text-slate-700 dark:text-slate-300">{row.ItemName || "-"}</td>
                    <td className="px-4 py-2 text-xs text-slate-500 whitespace-nowrap">{row.Brand || "-"}</td>
                    <td className="px-4 py-2 text-xs text-slate-500 whitespace-nowrap">{row.Category || "-"}</td>
                    <td className="px-4 py-2 text-xs text-slate-500 whitespace-nowrap">{row.SubCategory || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sticky Summary Footer */}
      {data.length > 0 && (
        <div className="sticky bottom-0 z-10 bg-brand-yellow dark:bg-brand-yellow/10 rounded-xl border border-brand-yellow/20 dark:border-brand-yellow/5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] p-4 select-none mt-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <span className="text-xs font-bold text-slate-800 dark:text-brand-yellow/90 uppercase">
                Total Rows : <span className="text-slate-950 dark:text-brand-yellow font-extrabold">{data.length}</span>
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-brand-yellow/90 uppercase">
                Filtered Rows : <span className="text-slate-950 dark:text-brand-yellow font-extrabold">{data.length}</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

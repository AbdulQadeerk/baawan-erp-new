import React, { useState, useCallback } from 'react';
import { Search, RotateCcw, FileSpreadsheet, FileText, Printer, Eye, X, Loader2 } from 'lucide-react';
import { reportApi } from '../../../services/report.service';
import { toast } from '../../../lib/toast';
import * as H from '../outstanding/outstandingHelpers';

export const PurchaseRegisterReport: React.FC = () => {
  const precision = H.getPrecision();

  const [fromDate, setFromDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [excludeTax, setExcludeTax] = useState(false);

  const [lst, setLst] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);

  const [detailedData, setDetailedData] = useState<any[] | null>(null);
  const [selectedMonthLabel, setSelectedMonthLabel] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const getFilters = useCallback(() => ({
    fromDate: H.formatDisplayDate(fromDate) + ' 00:00:00',
    toDate: H.formatDisplayDate(toDate) + ' 23:59:59',
    excludeTax
  }), [fromDate, toDate, excludeTax]);

  const submitReport = useCallback(async () => {
    setLoading(true);
    setDetailedData(null);
    setSelectedMonthLabel(null);
    try {
      const data = await reportApi.purchaseRegisterSummaryReport(getFilters());
      if (data?.length) {
        setLst(data);
      } else {
        setLst([]);
        toast.info('No data found', 'Info');
      }
    } catch (err: any) {
      setLst([]);
      toast.info(err?.message || 'Error', 'Error');
    } finally {
      setLoading(false);
    }
  }, [getFilters]);

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const blob = await reportApi.purchaseRegisterSummaryReportExport(getFilters());
      if (blob?.size) {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'purchase-register.xlsx';
        a.click();
        URL.revokeObjectURL(a.href);
      } else toast.info('No data found to export.', 'Info');
    } catch {
    } finally {
      setExportLoading(false);
    }
  };

  const handleClear = () => {
    setLst([]);
    setDetailedData(null);
    setSelectedMonthLabel(null);
    setFromDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
    setToDate(new Date().toISOString().split('T')[0]);
    setExcludeTax(false);
  };

  const fetchDetails = async (row: any) => {
    setDetailLoading(true);
    try {
      const y = row.InvYear;
      const m = row.InvMonthNo - 1;
      const firstDay = new Date(y, m, 1);
      const lastDay = new Date(y, m + 1, 0);
      
      const pFrom = H.formatDisplayDate(firstDay.toISOString()) + ' 00:00:00';
      const pTo = H.formatDisplayDate(lastDay.toISOString()) + ' 23:59:59';
      
      const payload = {
        fromDate: pFrom,
        toDate: pTo,
        excludeTax
      };
      
      const data = await reportApi.purchaseRegisterDetailReport(payload);
      setDetailedData(data || []);
      setSelectedMonthLabel(`${row.InvMonth}-${row.InvYear}`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to fetch details');
    } finally {
      setDetailLoading(false);
    }
  };

  const calculateNet = (row: any) => {
    return (row['Purchase Invoice'] || 0) - (row['Purchase Return'] || 0);
  };

  const totalPurchase = lst.reduce((sum, row) => sum + (row['Purchase Invoice'] || 0), 0);
  const totalReturn = lst.reduce((sum, row) => sum + (row['Purchase Return'] || 0), 0);
  const netAmount = totalPurchase - totalReturn;

  return (
    <div className="font-sans text-slate-700 dark:text-slate-200 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2.5 rounded-xl text-blue-600 dark:text-blue-400">
            <FileText size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Purchase Register</h1>
            <p className="text-xs text-slate-500 font-medium">Purchase register monthly summary and details.</p>
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
            
            <div className="flex items-center gap-2 min-h-[38px] select-none pb-0.5">
              <input
                type="checkbox"
                id="excludeTax"
                checked={excludeTax}
                onChange={(e) => setExcludeTax(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-slate-50 border-slate-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600 cursor-pointer"
              />
              <label
                htmlFor="excludeTax"
                className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none"
              >
                Exclude Tax
              </label>
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
            <button 
              onClick={handleExport}
              disabled={exportLoading || loading || !lst.length}
              title="Excel Export"
              className="w-10 h-10 flex items-center justify-center bg-emerald-600 text-white rounded-lg hover:opacity-90 transition-all shadow-sm cursor-pointer disabled:opacity-70"
            >
              {exportLoading ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
            </button>
            <button 
              disabled={printLoading || loading || !lst.length}
              title="Print"
              className="w-10 h-10 flex items-center justify-center bg-rose-500 text-white rounded-lg hover:opacity-90 transition-all shadow-sm cursor-pointer disabled:opacity-70"
            >
              {printLoading ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />}
            </button>
          </div>
        </div>
      </div>

      {lst.length > 0 && (
        <div className="mt-4">
          {selectedMonthLabel && (
            <div className="flex items-center gap-4 mb-3 ml-1">
              <span className="text-xs font-bold text-slate-500 tracking-wider">MONTHWISE</span>
              <button 
                onClick={() => {
                  setDetailedData(null);
                  setSelectedMonthLabel(null);
                }}
                className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors border border-blue-200 dark:border-blue-800"
              >
                {selectedMonthLabel}
                <X size={14} className="opacity-70" />
              </button>
            </div>
          )}
          
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
            {detailLoading ? (
               <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" /></div>
            ) : detailedData ? (
              <div className="overflow-auto custom-scrollbar max-h-[calc(100vh-320px)]">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Doc No</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ref No</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Type</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Customer Name</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {detailedData.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group">
                        <td className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400">{H.formatDisplayDate(row.Date)} {new Date(row.Date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</td>
                        <td className="px-4 py-2 text-xs font-bold text-blue-600 dark:text-blue-400">{row.Bill_No}</td>
                        <td className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400">{row.RefNo || '-'}</td>
                        <td className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400">{row.TypeName}</td>
                        <td className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200">{row.Name}</td>
                        <td className="px-4 py-2 text-xs font-black text-slate-800 dark:text-slate-200 text-right">{H.formatNumber(row.Amount, precision)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-auto custom-scrollbar max-h-[calc(100vh-320px)]">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Month</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Purchase</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Return</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right text-blue-600 dark:text-blue-400">Net</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center w-20">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {lst.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group">
                        <td className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                          {row.InvMonth}-{row.InvYear}
                        </td>
                        <td className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 text-right">
                          {H.formatNumber(row['Purchase Invoice'] || 0, precision)}
                        </td>
                        <td className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 text-right">
                          {H.formatNumber(row['Purchase Return'] || 0, precision)}
                        </td>
                        <td className="px-4 py-2 text-xs font-black text-blue-600 dark:text-blue-400 text-right">
                          {H.formatNumber(calculateNet(row), precision)}
                        </td>
                        <td className="px-4 py-2 text-center text-xs">
                          <button onClick={() => fetchDetails(row)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded transition-colors" title="View Details">
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sticky Footer */}
      {lst.length > 0 && (
        <div className="sticky bottom-0 mt-auto z-40 bg-brand-yellow dark:bg-brand-yellow/10 px-6 py-4 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] backdrop-blur-md border-t border-brand-yellow/20 dark:border-brand-yellow/5 flex flex-wrap justify-between items-center select-none">
          {detailedData ? (
            <div className="flex flex-wrap items-center gap-8 md:gap-16">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-800/80 dark:text-brand-yellow/70 uppercase tracking-tighter">Total Rows</span>
                <span className="text-xl font-extrabold text-slate-950 dark:text-brand-yellow tabular-nums">
                  {detailedData.length}
                </span>
              </div>
              <div className="h-8 w-px bg-slate-900/15 dark:bg-brand-yellow/20 hidden sm:block"></div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-800/80 dark:text-brand-yellow/70 uppercase tracking-tighter">Total Amount</span>
                <span className="text-xl font-extrabold text-slate-950 dark:text-brand-yellow tabular-nums">
                  ₹ {H.formatNumber(detailedData.reduce((s, r) => s + (r.Amount || 0), 0), precision)}
                </span>
              </div>
              <div className="h-8 w-px bg-slate-900/15 dark:bg-brand-yellow/20 hidden sm:block"></div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-800/80 dark:text-brand-yellow/70 uppercase tracking-tighter">Filtered Rows</span>
                <span className="text-xl font-extrabold text-slate-950 dark:text-brand-yellow tabular-nums">
                  {detailedData.length}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-8 md:gap-16">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-800/80 dark:text-brand-yellow/70 uppercase tracking-tighter">Total Rows</span>
                <span className="text-xl font-extrabold text-slate-950 dark:text-brand-yellow tabular-nums">
                  {lst.length}
                </span>
              </div>
              <div className="h-8 w-px bg-slate-900/15 dark:bg-brand-yellow/20 hidden sm:block"></div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-800/80 dark:text-brand-yellow/70 uppercase tracking-tighter">Total Purchase</span>
                <span className="text-xl font-extrabold text-slate-950 dark:text-brand-yellow tabular-nums">
                  ₹ {H.formatNumber(totalPurchase, precision)}
                </span>
              </div>
              <div className="h-8 w-px bg-slate-900/15 dark:bg-brand-yellow/20 hidden sm:block"></div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-800/80 dark:text-brand-yellow/70 uppercase tracking-tighter">Total Return</span>
                <span className="text-xl font-extrabold text-slate-950 dark:text-brand-yellow tabular-nums">
                  ₹ {H.formatNumber(totalReturn, precision)}
                </span>
              </div>
              <div className="h-8 w-px bg-slate-900/15 dark:bg-brand-yellow/20 hidden sm:block"></div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-800/80 dark:text-brand-yellow/70 uppercase tracking-tighter">Net Amount</span>
                <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400 tabular-nums">
                  ₹ {H.formatNumber(netAmount, precision)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

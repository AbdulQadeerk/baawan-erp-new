import React, { useState, useCallback } from 'react';
import { Search, Eraser, FileDown, Printer, Eye, X } from 'lucide-react';
import { reportApi } from '../../../services/report.service';
import { toast } from '../../../lib/toast';
import * as H from '../outstanding/outstandingHelpers';

export const SalesRegisterReport: React.FC = () => {
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
      const data = await reportApi.salesRegisterSummaryReport(getFilters());
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
      const blob = await reportApi.salesRegisterSummaryReportExport(getFilters());
      if (blob?.size) {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'sales-register.xlsx';
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
      // Calculate start and end date of the selected month
      const y = row.InvYear;
      const m = row.InvMonthNo - 1; // 0-indexed
      const firstDay = new Date(y, m, 1);
      const lastDay = new Date(y, m + 1, 0); // last day of month
      
      const pFrom = H.formatDisplayDate(firstDay.toISOString()) + ' 00:00:00';
      const pTo = H.formatDisplayDate(lastDay.toISOString()) + ' 23:59:59';
      
      const payload = {
        fromDate: pFrom,
        toDate: pTo,
        excludeTax
      };
      
      const data = await reportApi.salesRegisterDetailReport(payload);
      setDetailedData(data || []);
      setSelectedMonthLabel(`${row.InvMonth}-${row.InvYear}`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to fetch details');
    } finally {
      setDetailLoading(false);
    }
  };

  const calculateNet = (row: any) => {
    return (row['Sales Invoice'] || 0) - (row['Sales Return'] || 0);
  };

  const totalSales = lst.reduce((sum, row) => sum + (row['Sales Invoice'] || 0), 0);
  const totalReturn = lst.reduce((sum, row) => sum + (row['Sales Return'] || 0), 0);
  const netAmount = totalSales - totalReturn;

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900/50">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Sales Register</h1>
      </div>

      <div className="p-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-3">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">From Date <span className="text-rose-500">*</span></label>
              <input
                type="date"
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">To Date <span className="text-rose-500">*</span></label>
              <input
                type="date"
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            
            <div className="md:col-span-2 flex items-center mb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                  checked={excludeTax}
                  onChange={(e) => setExcludeTax(e.target.checked)}
                />
                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Exclude Tax</span>
              </label>
            </div>

            <div className="md:col-span-4 flex items-center justify-end gap-2">
              <button onClick={submitReport} disabled={loading} title="Search" className="w-10 h-10 flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors shadow-sm disabled:opacity-70">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Search size={18} />}
              </button>
              <button onClick={handleClear} title="Clear" className="w-10 h-10 flex items-center justify-center bg-lime-600 hover:bg-lime-700 text-white rounded-lg transition-colors shadow-sm">
                <Eraser size={18} />
              </button>
              <button onClick={handleExport} disabled={exportLoading || loading || !lst.length} title="Export" className="w-10 h-10 flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-sm disabled:opacity-70">
                {exportLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FileDown size={18} />}
              </button>
              <button disabled={printLoading || loading || !lst.length} title="Print" className="w-10 h-10 flex items-center justify-center bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors shadow-sm disabled:opacity-70">
                {printLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Printer size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {lst.length > 0 && (
        <div className="px-6 pb-6 flex-1 flex flex-col min-h-0">
          
          {selectedMonthLabel && (
            <div className="flex items-center gap-4 mb-2 ml-1">
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
          
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-full overflow-hidden">
            {detailLoading ? (
               <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" /></div>
            ) : detailedData ? (
              <div className="flex-1 overflow-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-amber-50/50 dark:bg-amber-900/10 border-b border-amber-100 dark:border-amber-900/50 text-slate-600 dark:text-slate-300 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 font-bold">Date</th>
                      <th className="px-4 py-3 font-bold">Doc No</th>
                      <th className="px-4 py-3 font-bold">Ref No</th>
                      <th className="px-4 py-3 font-bold">Type</th>
                      <th className="px-4 py-3 font-bold">Customer Name</th>
                      <th className="px-4 py-3 font-bold text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {detailedData.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{H.formatDisplayDate(row.Date)} {new Date(row.Date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</td>
                        <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{row.Bill_No}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{row.RefNo || '-'}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{row.TypeName}</td>
                        <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{row.Name}</td>
                        <td className="px-4 py-3 text-right font-black text-slate-800 dark:text-slate-200">{H.formatNumber(row.Amount, precision)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-100/80 dark:bg-slate-800/80 sticky bottom-0 z-10 border-t-2 border-slate-200 dark:border-slate-700">
                    <tr>
                      <td colSpan={3} className="px-4 py-3 font-black text-slate-800 dark:text-slate-100">Total Rows : {detailedData.length}</td>
                      <td colSpan={2} className="px-4 py-3 text-center font-black text-slate-800 dark:text-slate-100">
                        Total Amount : {H.formatNumber(detailedData.reduce((s, r) => s + (r.Amount || 0), 0), precision)}
                      </td>
                      <td className="px-4 py-3 text-right font-black text-slate-800 dark:text-slate-100">
                        Filtered Rows : {detailedData.length}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="flex-1 overflow-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-slate-100/50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 sticky top-0 z-10">
                    <tr>
                    <th className="px-4 py-3 font-bold">Month</th>
                    <th className="px-4 py-3 font-bold text-right">Sale</th>
                    <th className="px-4 py-3 font-bold text-right">Return</th>
                    <th className="px-4 py-3 font-bold text-right text-blue-600 dark:text-blue-400">Net</th>
                    <th className="px-4 py-3 font-bold text-center w-20">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {lst.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                        {row.InvMonth}-{row.InvYear}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400">
                        {H.formatNumber(row['Sales Invoice'] || 0, precision)}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400">
                        {H.formatNumber(row['Sales Return'] || 0, precision)}
                      </td>
                      <td className="px-4 py-3 text-right font-black text-blue-600 dark:text-blue-400">
                        {H.formatNumber(calculateNet(row), precision)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => fetchDetails(row)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded transition-colors" title="View Details">
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-100/80 dark:bg-slate-800/80 sticky bottom-0 z-10 border-t-2 border-slate-200 dark:border-slate-700">
                  <tr>
                    <td className="px-4 py-3 font-black text-slate-800 dark:text-slate-100">TOTAL ({lst.length} Rows)</td>
                    <td className="px-4 py-3 text-right font-black text-slate-800 dark:text-slate-100">
                      {H.formatNumber(totalSales, precision)}
                    </td>
                    <td className="px-4 py-3 text-right font-black text-slate-800 dark:text-slate-100">
                      {H.formatNumber(totalReturn, precision)}
                    </td>
                    <td className="px-4 py-3 text-right font-black text-blue-600 dark:text-blue-400">
                      {H.formatNumber(netAmount, precision)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  FileSpreadsheet, 
  Loader2, 
  FileText,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import { reportApi } from '../../../services/report.service';

export const SalesOrderSummaryReport: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Default to today
  const [filters, setFilters] = useState({
    fromDate: new Date().toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0],
  });

  const getFormattedFilters = () => {
    // Format dates to exactly match Angular 'DD/MM/yyyy HH:mm:ss'
    const formatDt = (dtStr: string, time: string) => {
      if (!dtStr) return null;
      const [y, m, d] = dtStr.split('-');
      return `${d}/${m}/${y} ${time}`;
    };

    return {
      fromDate: formatDt(filters.fromDate, '00:00:00'),
      toDate: formatDt(filters.toDate, '23:59:59'),
    };
  };

  const submitReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await reportApi.soSummary(getFormattedFilters());
      if (result && result.length > 0) {
        // The API returns an array with summaryData at index 0, where SOData is a stringified JSON array
        const rawSOData = result[0]?.SOData;
        if (rawSOData) {
          const parsed = JSON.parse(rawSOData);
          setData(parsed);
        } else {
          setData([]);
          setError('No valid data received.');
        }
      } else {
        setData([]);
        setError('No data found for the selected date range.');
      }
    } catch (err: any) {
      console.error('Error fetching report:', err);
      setData([]);
      setError(err?.message || 'Failed to load report data.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const exportData = await reportApi.soSummaryExport(getFormattedFilters());
      if (exportData) {
        const a = document.createElement('a');
        const objectUrl = URL.createObjectURL(exportData);
        a.href = objectUrl;
        a.setAttribute('download', 'so-summary.xlsx');
        a.click();
        URL.revokeObjectURL(objectUrl);
      }
    } catch (e) {
      console.error('Export error:', e);
    } finally {
      setExportLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      fromDate: new Date().toISOString().split('T')[0],
      toDate: new Date().toISOString().split('T')[0],
    });
    setData([]);
    setError(null);
  };

  const formatNumber = (val: any) => {
    if (val == null || val === '') return '';
    const n = parseFloat(val);
    return isNaN(n) ? val : n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDate = (val: string) => {
    if (!val) return '';
    const date = new Date(val);
    if (isNaN(date.getTime())) return val;
    // Format to DD/MM/YYYY hh:mm A
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    let h = date.getHours();
    const min = date.getMinutes().toString().padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12; // the hour '0' should be '12'
    const hStr = h.toString().padStart(2, '0');
    return `${d}/${m}/${y} ${hStr}:${min} ${ampm}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Full Pending': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'Partial Pending': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'Closed': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'Cancelled':
      case 'Partial Cancelled': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    }
  };

  // Subtotals
  const totalItemAmount = data.reduce((s, i) => s + (parseFloat(i.Item_SubTotal) || 0), 0);
  const totalBillAmount = data.reduce((s, i) => s + (parseFloat(i.GrandTotal) || 0), 0);

  return (
    <div className="font-sans text-slate-700 dark:text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400">
            <FileText size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Sales Order (SO) Summary Report</h1>
            <p className="text-xs text-slate-500 font-medium">Sales order status and summary.</p>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">From Date</label>
            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">To Date</label>
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 justify-end">
          <button 
            onClick={submitReport} 
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-600/20 disabled:opacity-70"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            <span className="hidden sm:inline">Search</span>
          </button>
          <button onClick={clearFilters} className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 rounded-lg transition-all border border-slate-200 dark:border-slate-700">
            <RotateCcw size={16} />
          </button>
          <button 
            onClick={handleExport} 
            disabled={exportLoading}
            className="p-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-70"
          >
            {exportLoading ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-auto custom-scrollbar max-h-[calc(100vh-320px)]">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">SO Date</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">SO No</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Party Name</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ref No</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">SO Qty</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Taxable Value</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Grand Total</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sales Person</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">SO Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 size={24} className="animate-spin text-blue-600" />
                      <span className="text-xs text-slate-500 font-medium">Fetching summary...</span>
                    </div>
                  </td>
                </tr>
              ) : error && !data.length ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle size={24} className="text-rose-500" />
                      <span className="text-xs text-rose-500 font-medium">{error}</span>
                    </div>
                  </td>
                </tr>
              ) : !data.length ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-sm text-slate-400">
                    Use the filters above to generate the report.
                  </td>
                </tr>
              ) : (
                data.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400">{formatDate(item.Date)}</td>
                    <td className="px-4 py-2 text-xs font-bold text-blue-600 dark:text-blue-400">{item.SONo}</td>
                    <td className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200">{item.PartyName}</td>
                    <td className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400">{item.RefNo}</td>
                    
                    <td className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 text-right">{formatNumber(item.SOQty)}</td>
                    <td className="px-4 py-2 text-xs font-bold text-amber-600 dark:text-amber-400 text-right">{formatNumber(item.Item_SubTotal)}</td>
                    <td className="px-4 py-2 text-xs font-black text-emerald-600 dark:text-emerald-400 text-right">{formatNumber(item.GrandTotal)}</td>
                    <td className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400">{item.SalesPerson}</td>
                    <td className="px-4 py-2">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded border ${getStatusColor(item.SOStatus)}`}>
                        {item.SOStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Totals */}
        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Rows:</span>
              <span className="px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs font-black">{data.length}</span>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Total Taxable Value</p>
              <p className="text-sm font-black text-amber-600 dark:text-amber-400">{formatNumber(totalItemAmount)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Overall Grand Total</p>
              <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">{formatNumber(totalBillAmount)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

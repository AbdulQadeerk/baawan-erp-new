import React, { useState, useEffect } from 'react';
import { 
  Search, 
  RotateCcw, 
  FileSpreadsheet, 
  Loader2, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { reportApi } from '../../../services/report.service';

export const SupplierWisePendingReport: React.FC = () => {
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
    // Format dates to match exactly what Angular sent
    // "DD/MM/yyyy HH:mm:ss"
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
      const result = await reportApi.supplierWisePendingReport(getFormattedFilters());
      setData(result || []);
      if (!result || result.length === 0) {
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
      const exportData = await reportApi.supplierWisePendingReportExport(getFormattedFilters());
      if (exportData) {
        const a = document.createElement('a');
        const objectUrl = URL.createObjectURL(exportData);
        a.href = objectUrl;
        a.setAttribute('download', 'supplier-wise-pending.xlsx');
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

  // Subtotals
  const totalPurchaseQty = data.reduce((s, i) => s + (parseFloat(i.PurchaseQty) || 0), 0);
  const totalInwardPending = data.reduce((s, i) => s + (parseFloat(i.InwardPending) || 0), 0);
  const totalOutwardPending = data.reduce((s, i) => s + (parseFloat(i.OutwardPending) || 0), 0);

  return (
    <div className="font-sans text-slate-700 dark:text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg text-orange-600 dark:text-orange-400">
            <FileText size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Purchase Invoice Adjustment Report</h1>
            <p className="text-xs text-slate-500 font-medium">Supplier wise pending inward and outward tracking.</p>
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
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-orange-600/20 disabled:opacity-70"
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
            className="p-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all shadow-lg shadow-blue-500/20 disabled:opacity-70"
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
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Party Name</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">SO No</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Item Code</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ref No</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Purchase No</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Purchase Qty</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Inward Pending</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Outward Pending</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 size={24} className="animate-spin text-orange-600" />
                      <span className="text-xs text-slate-500 font-medium">Fetching supplier data...</span>
                    </div>
                  </td>
                </tr>
              ) : error && !data.length ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle size={24} className="text-rose-500" />
                      <span className="text-xs text-rose-500 font-medium">{error}</span>
                    </div>
                  </td>
                </tr>
              ) : !data.length ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-sm text-slate-400">
                    Use the filters above to generate the report.
                  </td>
                </tr>
              ) : (
                data.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200">{item.PartyName}</td>
                    <td className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400">{item.SONo}</td>
                    <td className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400">{item.Item_CodeTxt}</td>
                    <td className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400">{item.RefNo}</td>
                    <td className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400">{item.PurchaseNo}</td>
                    
                    <td className="px-4 py-2 text-xs font-bold text-blue-600 dark:text-blue-400 text-right">{formatNumber(item.PurchaseQty)}</td>
                    <td className="px-4 py-2 text-xs font-bold text-orange-600 dark:text-orange-400 text-right">{formatNumber(item.InwardPending)}</td>
                    <td className="px-4 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 text-right">{formatNumber(item.OutwardPending)}</td>
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
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Purchase Qty</p>
              <p className="text-sm font-black text-blue-600 dark:text-blue-400">{formatNumber(totalPurchaseQty)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Inward Pending</p>
              <p className="text-sm font-black text-orange-600 dark:text-orange-400">{formatNumber(totalInwardPending)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Outward Pending</p>
              <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">{formatNumber(totalOutwardPending)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
